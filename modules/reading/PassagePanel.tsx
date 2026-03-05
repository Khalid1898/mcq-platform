"use client";

import type { ReadingPassage } from "@/lib/content/reading";
import { cn } from "@/lib/utils";

type Props = {
  passage: ReadingPassage;
  currentParagraphId: string;
};

export function PassagePanel({ passage, currentParagraphId }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Passage
      </div>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-[14px] leading-relaxed text-text">
        {passage.paragraphs.map((p) => (
          <p
            key={p.id}
            className={cn(
              "transition-all duration-300",
              p.id === currentParagraphId
                ? "bg-primary/5 rounded-lg px-2 py-1 border border-primary/30 opacity-100"
                : "text-muted opacity-50 blur-[2px]"
            )}
          >
            {p.text}
          </p>
        ))}
      </div>
    </div>
  );
}

