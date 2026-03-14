"use client";

import { useState } from "react";
import type { Task2Question } from "@/lib/writing/types";
import { SharedWritingLayout } from "./SharedWritingLayout";

export interface Task2EssayScreenProps {
  question: Task2Question;
}

/**
 * Task 2: essay layout (Academic or General Training).
 * Left: task label, instructions, essay prompt, word requirement.
 * Right: writing editor.
 */
export function Task2EssayScreen({ question }: Task2EssayScreenProps) {
  const [value, setValue] = useState("");

  const leftPanel = (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
        WRITING TASK 2
      </h2>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {question.instructions}
      </p>
      <div className="space-y-3 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        {question.prompt.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">
        Write at least {question.minimumWords} words.
      </p>
    </div>
  );

  return (
    <SharedWritingLayout
      leftPanel={leftPanel}
      value={value}
      onChange={setValue}
      editorPlaceholder="Write your essay..."
      editorAriaLabel="Task 2 essay"
    />
  );
}
