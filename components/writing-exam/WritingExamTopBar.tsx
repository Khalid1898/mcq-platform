"use client";

import type { ActiveWritingTask } from "./types";
import { TaskTabs } from "./TaskTabs";

export interface WritingExamTopBarProps {
  /** Exam title, e.g. "IELTS Academic Writing". */
  title: string;
  /** Time display string, e.g. "60:00". */
  timeRemaining: string;
  activeTask: ActiveWritingTask;
  onTaskChange: (task: ActiveWritingTask) => void;
}

/**
 * Thin top bar for the writing exam: title, timer, task switcher.
 */
export function WritingExamTopBar({
  title,
  timeRemaining,
  activeTask,
  onTaskChange,
}: WritingExamTopBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900">
      <h1 className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <span
          className="tabular-nums text-[14px] text-neutral-600 dark:text-neutral-400"
          aria-label="Time remaining"
        >
          {timeRemaining}
        </span>
        <TaskTabs activeTask={activeTask} onSelect={onTaskChange} />
      </div>
    </div>
  );
}
