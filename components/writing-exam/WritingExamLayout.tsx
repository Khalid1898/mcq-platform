"use client";

import { useState } from "react";
import type { WritingTaskExamData } from "./types";
import { SimpleQuestionPanel } from "./SimpleQuestionPanel";
import { WritingEditor } from "./WritingEditor";

export interface WritingExamLayoutProps {
  task: WritingTaskExamData;
  /** Optional slot above the main exam area (e.g. future progress bar). */
  topSlot?: React.ReactNode;
}

/**
 * Single-task IELTS Writing exam screen: reserved top area + two panels
 * (question left, writing editor right). Desktop-first, responsive.
 */
export function WritingExamLayout({ task, topSlot }: WritingExamLayoutProps) {
  const [value, setValue] = useState("");

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] min-h-[480px] flex-col bg-neutral-100 dark:bg-neutral-950">
      {topSlot ? (
        <div className="shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          {topSlot}
        </div>
      ) : (
        <div className="h-4 shrink-0" aria-hidden />
      )}

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className="w-full md:w-[40%] md:min-w-[280px] md:max-w-[480px]"
          aria-label="Writing task"
        >
          <SimpleQuestionPanel task={task} />
        </aside>
        <main
          className="flex min-h-[320px] flex-1 flex-col border-t border-neutral-200 p-4 md:border-t-0 md:border-l-0 md:min-w-0 dark:border-neutral-800"
          aria-label="Writing answer area"
        >
          <WritingEditor
            value={value}
            onChange={setValue}
            aria-label="Writing answer"
          />
        </main>
      </div>
    </div>
  );
}
