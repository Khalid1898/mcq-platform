"use client";

import { useState } from "react";
import type { GeneralTask1Question } from "@/lib/writing/types";
import { SharedWritingLayout } from "./SharedWritingLayout";

export interface GeneralTask1LetterScreenProps {
  question: GeneralTask1Question;
}

/**
 * General Training Task 1: letter layout.
 * Left: task label, instructions, prompt, bullet points.
 * Right: writing editor.
 */
export function GeneralTask1LetterScreen({
  question,
}: GeneralTask1LetterScreenProps) {
  const [value, setValue] = useState("");

  const leftPanel = (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
        WRITING TASK 1
      </h2>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {question.instructions}
      </p>
      <div className="space-y-3 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        {question.prompt.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {question.bulletPoints && question.bulletPoints.length > 0 && (
        <ul className="list-disc list-inside space-y-1.5 text-[14px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {question.bulletPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      )}
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
      editorPlaceholder="Write your letter..."
      editorAriaLabel="Task 1 letter"
    />
  );
}
