import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ClipEntry } from "./types";
import SearchBar from "./components/SearchBar";
import ClipList from "./components/ClipList";
import Toast, { ToastMessage } from "./components/Toast";

let toastId = 0;

export default function App() {
  const [clips, setClips] = useState<ClipEntry[]>([]);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Refs for stable event handler closures
  const clipsRef = useRef<ClipEntry[]>([]);
  const selectedIndexRef = useRef(-1);
  const searchRef = useRef("");

  clipsRef.current = clips;
  selectedIndexRef.current = selectedIndex;
  searchRef.current = search;

  // --- Toast helper ---

  const showToast = useCallback((text: string, type: ToastMessage["type"] = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Data ---

  const loadClips = useCallback(async (query?: string) => {
    const q = query ?? searchRef.current;
    try {
      const result = await invoke<ClipEntry[]>("get_clips", {
        limit: 50,
        offset: 0,
        search: q || null,
      });
      setClips(result);
      setSelectedIndex(-1);
    } catch (e) {
      console.error("Failed to load clips:", e);
    }
  }, []);

  useEffect(() => {
    loadClips(search);
  }, [search, loadClips]);

  // BUGFIX #5: Use a cancelled flag to prevent setState on an unmounted
  // component. The async listen() can resolve after the component unmounts
  // if the effect cleanup runs before the promise settles.
  useEffect(() => {
    let cancelled = false;
    let cleanupFn: (() => void) | undefined;

    (async () => {
      const unlisten = await listen<ClipEntry>("new-clip", () => {
        if (!cancelled) loadClips();
      });
      // Only store cleanup if we haven't been cancelled while waiting
      if (!cancelled) {
        cleanupFn = unlisten;
      } else {
        unlisten();
      }
    })();

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, [loadClips]);

  // --- Actions ---

  const pasteClip = useCallback(async (clip: ClipEntry) => {
    try {
      await invoke("paste_clip", { id: clip.id });
      await getCurrentWindow().hide();
    } catch (e) {
      console.error("Failed to paste:", e);
      showToast("Failed to paste", "error");
    }
  }, [showToast]);

  const togglePin = useCallback(async (id: number) => {
    try {
      const pinned = await invoke<boolean>("toggle_pin", { id });
      showToast(pinned ? "Pinned" : "Unpinned", "success");
      loadClips();
    } catch (e) {
      console.error("Failed to toggle pin:", e);
    }
  }, [loadClips, showToast]);

  const deleteClip = useCallback(async (id: number) => {
    try {
      await invoke("delete_clip", { id });
      loadClips();
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  }, [loadClips]);

  const clearAll = useCallback(async () => {
    try {
      const count = await invoke<number>("clear_all_clips");
      if (count > 0) {
        showToast(`Cleared ${count} clip${count !== 1 ? "s" : ""}`, "success");
      }
      loadClips();
    } catch (e) {
      console.error("Failed to clear clips:", e);
      showToast("Failed to clear history", "error");
    }
  }, [loadClips, showToast]);

  // --- Keyboard navigation ---

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const currentClips = clipsRef.current;
      const currentIdx = selectedIndexRef.current;

      switch (e.key) {
        case "Escape":
          await getCurrentWindow().hide();
          break;

        case "ArrowDown":
          e.preventDefault();
          if (currentIdx < currentClips.length - 1) {
            setSelectedIndex(currentIdx + 1);
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (currentIdx > 0) {
            setSelectedIndex(currentIdx - 1);
          }
          break;

        case "Enter": {
          e.preventDefault();
          if (currentIdx >= 0 && currentIdx < currentClips.length) {
            await pasteClip(currentClips[currentIdx]);
            loadClips();
          }
          break;
        }

        case "Delete":
        case "Backspace": {
          if (currentIdx >= 0 && currentIdx < currentClips.length) {
            e.preventDefault();
            await deleteClip(currentClips[currentIdx].id);
          }
          break;
        }

        // Search focus: typing anywhere focuses search
        default:
          if (
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey
          ) {
            const input = document.querySelector<HTMLInputElement>("#search-input");
            if (input && document.activeElement !== input) {
              input.focus();
            }
          }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pasteClip, deleteClip, loadClips]);

  // --- Focus on show ---

  useEffect(() => {
    const handleFocus = () => {
      const input = document.querySelector<HTMLInputElement>("#search-input");
      input?.focus();
      input?.select();
      loadClips();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadClips]);

  // --- Dark mode ---

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // --- Scroll selected into view ---

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const hasClips = clips.length > 0;

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        backgroundColor: "var(--bg-surface)",
        color: "var(--text-primary)",
      }}
      role="application"
      aria-label="ClipLite clipboard manager"
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
          <h1 className="text-sm font-semibold tracking-tight">
            ClipLite
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {hasClips && (
            <button
              onClick={clearAll}
              className="text-[11px] px-2 py-0.5 rounded-md font-medium
                         transition-all duration-100 active:scale-[0.95]"
              style={{
                color: "var(--text-tertiary)",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.borderColor = "";
              }}
              aria-label="Clear all unpinned clips"
            >
              Clear all
            </button>
          )}
          <kbd
            className="text-[11px] px-1.5 py-0.5 rounded font-mono select-none"
            style={{
              color: "var(--text-tertiary)",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {"\u2303\u21E7V"}
          </kbd>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-md transition-colors duration-100
                       active:scale-[0.92]"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Clip list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto flex flex-col"
        role="listbox"
        aria-label="Clipboard history"
      >
        <ClipList
          clips={clips}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onPaste={pasteClip}
          onTogglePin={togglePin}
          onDelete={deleteClip}
        />
      </div>

      {/* Footer */}
      <footer
        className="px-4 py-2 text-xs shrink-0 flex items-center justify-between"
        style={{
          borderTop: "1px solid var(--border-subtle)",
          color: "var(--text-tertiary)",
        }}
      >
        <span>
          {clips.length} clip{clips.length !== 1 ? "s" : ""}
        </span>
        <span className="flex gap-3">
          <span>{"\u21B5"} paste</span>
          <span>{"\u232B"} delete</span>
          <span>Esc close</span>
        </span>
      </footer>

      {/* Toasts */}
      {toasts.map((t) => (
        <Toast key={t.id} message={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
