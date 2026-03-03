"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import type { CoachTips as CoachTipsType } from "@/lib/session-types";
import { cn } from "@/lib/utils";

type Props = {
  tips: CoachTipsType;
  className?: string;
};

export function CoachTip({ tips, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/30 bg-primary/5 overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <span className="flex items-center gap-2 font-medium text-text">
          <Lightbulb className="h-5 w-5 text-primary" />
          Coach tip
        </span>
        <ChevronDown
          className={cn("h-5 w-5 text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-primary/20 p-4 pt-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              What this validates
            </div>
            <p className="mt-1 text-[15px] leading-relaxed text-text">{tips.validates}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Common trap
            </div>
            <p className="mt-1 text-[15px] leading-relaxed text-text">{tips.trap}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Best mental model
            </div>
            <p className="mt-1 text-[15px] leading-relaxed text-text">{tips.mentalModel}</p>
          </div>
        </div>
      )}
    </div>
  );
}
