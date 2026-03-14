"use client";

import type { WritingQuestion } from "@/lib/writing/types";
import { getScreenType } from "@/lib/writing/renderConfig";
import { isAcademicTask1, isGeneralTask1 } from "@/lib/writing/types";
import { AcademicTask1Screen } from "./AcademicTask1Screen";
import { GeneralTask1LetterScreen } from "./GeneralTask1LetterScreen";
import { Task2EssayScreen } from "./Task2EssayScreen";

export interface WritingQuestionRendererProps {
  /** Question object from storage/API. Determines exam type, task type, subtype and content. */
  question: WritingQuestion;
}

/**
 * Central renderer: picks the correct screen from question metadata and renders it.
 * Pass any WritingQuestion; layout is chosen automatically by examType + taskType.
 */
export function WritingQuestionRenderer({
  question,
}: WritingQuestionRendererProps) {
  const screenType = getScreenType(question);

  switch (screenType) {
    case "academic_task1":
      if (isAcademicTask1(question)) {
        return <AcademicTask1Screen question={question} />;
      }
      break;
    case "general_task1_letter":
      if (isGeneralTask1(question)) {
        return <GeneralTask1LetterScreen question={question} />;
      }
      break;
    case "task2_essay":
      return <Task2EssayScreen question={question} />;
  }

  return (
    <div className="flex min-h-[320px] items-center justify-center rounded border border-neutral-200 bg-neutral-50 p-8 text-center text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
      <p>No layout found for this question type.</p>
    </div>
  );
}
