import { ClipEntry } from "../types";

interface ClipItemProps {
  clip: ClipEntry;
  isSelected: boolean;
  onSelect: () => void;
  onPaste: (clip: ClipEntry) => void;
  onTogglePin: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ClipItem({
  clip,
  isSelected,
  onSelect,
  onPaste,
  onTogglePin,
  onDelete,
}: ClipItemProps) {
  const preview =
    clip.content.length > 140
      ? clip.content.slice(0, 140) + "\u2026"
      : clip.content;

  // SQLite datetime('now') returns local time in "YYYY-MM-DD HH:MM:SS"
  // Parse as local, not UTC
  const timeAgo = (dateStr: string): string => {
    const date = new Date(dateStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return "";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  const bgColor = isSelected ? "var(--bg-hover)" : "transparent";

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      onClick={() => onPaste(clip)}
      onMouseEnter={onSelect}
      className="group relative flex items-start gap-2 px-4 py-2.5 cursor-pointer"
      style={{
        backgroundColor: bgColor,
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Bookmark spine */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full
                   transition-[opacity,transform,background-color] duration-200"
        style={{
          backgroundColor: isSelected
            ? "var(--accent)"
            : clip.pinned
              ? "var(--text-tertiary)"
              : "transparent",
          opacity: isSelected ? 1 : clip.pinned ? 0.5 : 0,
          transform: `scaleY(${isSelected ? 1 : 0.85})`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className="text-sm leading-relaxed break-all line-clamp-2 select-none"
          style={{ color: "var(--text-primary)" }}
        >
          {preview}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[11px] select-none font-medium"
            style={{
              color: "var(--text-tertiary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timeAgo(clip.created_at)}
          </span>
          {clip.pinned && (
            <span
              className="text-[11px] font-semibold select-none"
              style={{ color: "var(--accent)" }}
            >
              Pinned
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center gap-0.5 shrink-0 opacity-0
                   group-hover:opacity-100 transition-opacity duration-100"
        style={{ opacity: isSelected ? 1 : undefined }}
      >
        {/* Pin */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(clip.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onTogglePin(clip.id);
            }
          }}
          className="p-1 rounded-md transition-transform duration-100
                     active:scale-[0.92]"
          style={{
            color: clip.pinned ? "var(--accent)" : "var(--text-tertiary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = clip.pinned
              ? "rgba(99, 102, 241, 0.1)"
              : "var(--bg-active)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label={clip.pinned ? "Unpin" : "Pin"}
        >
          <svg
            className="w-3.5 h-3.5"
            fill={clip.pinned ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(clip.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onDelete(clip.id);
            }
          }}
          className="p-1 rounded-md transition-transform duration-100
                     active:scale-[0.92]"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "";
          }}
          aria-label={`Delete: ${clip.content.slice(0, 40)}`}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
