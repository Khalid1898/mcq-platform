"use client";

import { useState } from "react";
import type { AcademicTask1Question } from "@/lib/writing/types";
import { SUBTYPE_LABELS } from "@/lib/writing/renderConfig";
import { ChartPlaceholder } from "@/components/writing-exam";
import { SharedWritingLayout } from "./SharedWritingLayout";

export interface AcademicTask1ScreenProps {
  question: AcademicTask1Question;
}

/**
 * Academic Task 1: visual/report layout.
 * Left: task label, instructions, prompt, chart/diagram placeholder (or image), summarise instruction, word requirement.
 * Right: writing editor.
 */
export function AcademicTask1Screen({ question }: AcademicTask1ScreenProps) {
  const [value, setValue] = useState("");

  const visualLabel =
    question.imageUrl != null
      ? question.imageAlt ?? "Chart / Diagram"
      : SUBTYPE_LABELS[question.subtype] ?? "Chart / Diagram Preview";

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
      {question.imageUrl ? (
        <div className="rounded border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800/80 overflow-hidden" style={{ minHeight: 200 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt={question.imageAlt ?? visualLabel}
            className="w-full h-auto object-contain"
            style={{ minHeight: 200 }}
          />
        </div>
      ) : (
        <ChartPlaceholder label={visualLabel} />
      )}
      <p className="text-[14px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        {question.summariseInstruction}
      </p>
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
      editorPlaceholder="Write your report..."
      editorAriaLabel="Task 1 report"
    />
  );
}
