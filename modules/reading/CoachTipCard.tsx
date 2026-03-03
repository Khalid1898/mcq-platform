"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  title?: string;
  body: string;
};

export function CoachTipCard({ title = "Coach tip", body }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Star className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-text">{title}</span>
        <span className="ml-auto text-xs text-muted">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && (
        <div className="border-t border-primary/20 px-3 py-2 text-xs leading-relaxed text-text">
          {body}
        </div>
      )}
    </div>
  );
}

