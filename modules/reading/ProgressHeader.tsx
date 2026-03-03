"use client";

import type { ReadingStage } from "./useReadingSession";

type Props = {
  stage: ReadingStage;
  currentParagraphIndex: number;
  totalParagraphs: number;
  answeredCount: number;
  totalQuestions: number;
};

export function ProgressHeader({
  stage,
  currentParagraphIndex,
  totalParagraphs,
  answeredCount,
  totalQuestions,
}: Props) {
  const paraNum = currentParagraphIndex + 1;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {stage === "OVERWHELM"
          ? "Skim mode"
          : `Paragraph ${paraNum} of ${totalParagraphs}`}
      </div>
      <div className="text-xs text-muted">
        Questions resolved:{" "}
        <span className="font-semibold text-text">
          {answeredCount}/{totalQuestions}
        </span>
      </div>
    </div>
  );
}

