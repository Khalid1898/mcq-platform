"use client";

export interface ChartPlaceholderProps {
  /** Optional label; default "Chart / Diagram Preview". */
  label?: string;
}

/**
 * Placeholder area for Task 1 chart/diagram in the exam. Neutral, exam-asset style.
 */
export function ChartPlaceholder({
  label = "Chart / Diagram Preview",
}: ChartPlaceholderProps) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800/80"
      style={{ minHeight: 200 }}
      aria-hidden
    >
      <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </div>
  );
}
