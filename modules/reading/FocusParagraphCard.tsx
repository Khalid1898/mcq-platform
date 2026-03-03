"use client";

import type { ReadingParagraph } from "@/lib/content/reading";

type Props = {
  paragraph: ReadingParagraph;
};

export function FocusParagraphCard({ paragraph }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
        Focus paragraph
      </div>
      <p className="text-[15px] leading-relaxed text-text">{paragraph.text}</p>
    </div>
  );
}

