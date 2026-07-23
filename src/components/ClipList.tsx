import { ClipEntry } from "../types";
import ClipItem from "./ClipItem";

interface ClipListProps {
  clips: ClipEntry[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onPaste: (clip: ClipEntry) => void;
  onTogglePin: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ClipList({
  clips,
  selectedIndex,
  onSelect,
  onPaste,
  onTogglePin,
  onDelete,
}: ClipListProps) {
  if (clips.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-8">
          <svg
            className="w-14 h-14 mx-auto mb-4"
            style={{ color: "var(--border-default)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          </svg>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Nothing copied yet
          </p>
          <p
            className="text-xs mt-1.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Copy text anywhere, then come back here
          </p>
          <p
            className="text-[11px] mt-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            Press ⌃⇧V to open ClipLite
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {clips.map((clip, index) => (
        <ClipItem
          key={clip.id}
          clip={clip}
          isSelected={index === selectedIndex}
          onSelect={() => onSelect(index)}
          onPaste={onPaste}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
