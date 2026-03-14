"use client";

import type { ActiveWritingTask, Task1ExamData, Task2ExamData } from "./types";
import { Task1Prompt } from "./Task1Prompt";
import { Task2Prompt } from "./Task2Prompt";

export interface QuestionPanelProps {
  task1Data: Task1ExamData;
  task2Data: Task2ExamData;
  activeTask: ActiveWritingTask;
}

/**
 * Left panel: shows the prompt for the active task (Task 1 or Task 2).
 * Scrolls independently when content is long.
 */
export function QuestionPanel({
  task1Data,
  task2Data,
  activeTask,
}: QuestionPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTask === "task1" ? (
          <Task1Prompt data={task1Data} />
        ) : (
          <Task2Prompt data={task2Data} />
        )}
      </div>
    </div>
  );
}
