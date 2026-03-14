"use client";

import type { WritingTaskExamData } from "./types";

export interface SimpleQuestionPanelProps {
  task: WritingTaskExamData;
}

/**
 * Left panel for a single writing task (used by WritingExamLayout).
 * Scrolls independently when content is long.
 */
export function SimpleQuestionPanel({ task }: SimpleQuestionPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
          {task.taskLabel}
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {task.instruction}
        </p>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
          {task.prompt.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-4 text-[14px] font-medium text-neutral-700 dark:text-neutral-300">
          {task.wordRequirement}
        </p>
      </div>
    </div>
  );
}
