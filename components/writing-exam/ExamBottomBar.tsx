"use client";

import type { ActiveWritingTask } from "./types";

export interface ExamBottomBarProps {
  activeTask: ActiveWritingTask;
  wordCount: number;
  onPreviousTask: () => void;
  onNextTask: () => void;
}

/**
 * Bottom status/navigation bar: active task label, word count, Previous / Next task.
 */
export function ExamBottomBar({
  activeTask,
  wordCount,
  onPreviousTask,
  onNextTask,
}: ExamBottomBarProps) {
  const isTask1 = activeTask === "task1";

  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900/80">
      <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
        {isTask1 ? "Task 1" : "Task 2"}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-neutral-600 dark:text-neutral-400">
          Word count: {wordCount}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onPreviousTask}
            disabled={isTask1}
            className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Previous Task
          </button>
          <button
            type="button"
            onClick={onNextTask}
            disabled={!isTask1}
            className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Next Task
          </button>
        </div>
      </div>
    </div>
  );
}
