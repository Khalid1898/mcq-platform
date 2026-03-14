"use client";

import type { ActiveWritingTask } from "./types";

export interface TaskTabsProps {
  activeTask: ActiveWritingTask;
  onSelect: (task: ActiveWritingTask) => void;
}

/**
 * Task 1 / Task 2 switcher for the exam top bar. Exam-style, minimal.
 */
export function TaskTabs({ activeTask, onSelect }: TaskTabsProps) {
  return (
    <div
      className="flex rounded border border-neutral-300 dark:border-neutral-600 overflow-hidden"
      role="tablist"
      aria-label="Writing task"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTask === "task1"}
        onClick={() => onSelect("task1")}
        className={`min-w-[72px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
          activeTask === "task1"
            ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100"
            : "bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        }`}
      >
        Task 1
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTask === "task2"}
        onClick={() => onSelect("task2")}
        className={`min-w-[72px] px-3 py-1.5 text-[13px] font-medium transition-colors border-l border-neutral-300 dark:border-neutral-600 ${
          activeTask === "task2"
            ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100"
            : "bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        }`}
      >
        Task 2
      </button>
    </div>
  );
}
