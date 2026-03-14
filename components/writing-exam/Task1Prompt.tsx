"use client";

import type { Task1ExamData } from "./types";
import { ChartPlaceholder } from "./ChartPlaceholder";

export interface Task1PromptProps {
  data: Task1ExamData;
}

/**
 * Left-panel content for Academic Writing Task 1: instruction, prompt, chart placeholder, summarise instruction, word requirement.
 */
export function Task1Prompt({ data }: Task1PromptProps) {
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
      <ChartPlaceholder />
      <p className="text-[14px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        {data.summariseInstruction}
      </p>
      <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">
        {data.wordRequirement}
      </p>
    </div>
  );
}
