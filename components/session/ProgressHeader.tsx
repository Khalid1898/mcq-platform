"use client";

import { cn } from "@/lib/utils";

type Props = {
  current: number;
  total: number;
  className?: string;
};

export function ProgressHeader({ current, total, className }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-xs font-medium text-muted">
        <span>Question {current} of {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
