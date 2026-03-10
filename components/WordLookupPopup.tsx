"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  word: string;
  definition: string;
  synonyms: string[];
  x: number;
  y: number;
  onClose: () => void;
};

export function WordLookupPopup({
  word,
  definition,
  synonyms,
  x,
  y,
  onClose,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Basic viewport guard so popup doesn't go off-screen to the right/bottom.
  const offset = 8;
  const style: React.CSSProperties = {
    position: "fixed",
    left: x + offset,
    top: y + offset,
    maxWidth: "260px",
    zIndex: 50,
  };

  return (
    <div
      ref={ref}
      style={style}
      className="rounded-xl border border-border bg-surface px-3 py-2 text-[11px] shadow-lg dark:bg-surface-2"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold text-text">{word}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Close word definition"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1">
        <div>
          <p className="font-medium text-text">Meaning</p>
          <p className="mt-0.5 text-muted">{definition}</p>
        </div>
        {synonyms.length > 0 && (
          <div>
            <p className="font-medium text-text">Synonyms</p>
            <p className="mt-0.5 text-muted">
              {synonyms.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

