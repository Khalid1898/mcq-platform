"use client";

import { useState } from "react";
import { WritingQuestionRenderer } from "@/components/writing";
import {
  ALL_WRITING_QUESTIONS,
  getQuestionById,
  getScreenType,
  SUBTYPE_LABELS,
} from "@/lib/writing";
import type { WritingQuestion } from "@/lib/writing/types";

function getQuestionLabel(q: WritingQuestion): string {
  const exam = q.examType === "academic" ? "Academic" : "General";
  const task = q.taskType === "task1" ? "Task 1" : "Task 2";
  const sub = SUBTYPE_LABELS[q.subtype] ?? q.subtype;
  return `${exam} / ${task} / ${sub}`;
}

export default function WritingDemoPage() {
  const [selectedId, setSelectedId] = useState<string>(
    ALL_WRITING_QUESTIONS[0]?.id ?? ""
  );

  const question = getQuestionById(selectedId);
  const screenType = question ? getScreenType(question) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300" htmlFor="question-select">
          Question
        </label>
        <select
          id="question-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="min-w-[280px] rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
        >
          {ALL_WRITING_QUESTIONS.map((q) => (
            <option key={q.id} value={q.id}>
              {getQuestionLabel(q)}
            </option>
          ))}
        </select>
        {screenType && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            → Renders: {screenType.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="-mx-2 -my-6 sm:-mx-4 md:-mx-6 lg:-mx-8">
        {question ? (
          <WritingQuestionRenderer question={question} />
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded border border-neutral-200 bg-neutral-50 p-8 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
            Select a question to see the layout.
          </div>
        )}
      </div>
    </div>
  );
}
