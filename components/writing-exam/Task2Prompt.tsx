"use client";

import type { Task2ExamData } from "./types";

export interface Task2PromptProps {
  data: Task2ExamData;
}

/**
 * Left-panel content for Academic Writing Task 2: instruction, prompt, word requirement.
 */
export function Task2Prompt({ data }: Task2PromptProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
        {data.taskLabel}
      </h2>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {data.instruction}
      </p>
      <div className="space-y-3 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        {data.prompt.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">
        {data.wordRequirement}
      </p>
    </div>
  );
}
