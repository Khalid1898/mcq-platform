"use client";

import type { ReadingPassage } from "@/lib/content/reading";
import type { ReadingStageState } from "./useReadingSession";

type Props = {
  passage: ReadingPassage;
  state: ReadingStageState;
  onNextParagraph: () => void;
};

export function FeedbackPanel({ passage, state, onNextParagraph }: Props) {
  const qId = state.feedbackForQuestionId;
  if (!qId) return null;

  const question = passage.questions.find((q) => q.id === qId);
  if (!question) return null;

  const correct = state.statusById[qId] === "completed";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div
        className={`flex items-start gap-3 rounded-xl border-2 p-3 ${
          correct
            ? "border-emerald-400 bg-emerald-50"
            : "border-amber-400 bg-amber-50"
        }`}
      >
        <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-text">
            {correct ? "Nice — this one lands." : "Not quite yet."}
          </p>
          <p className="text-xs leading-relaxed text-muted">
            {question.explanation}
          </p>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted">
        XP animations / skill gains can plug in here later.
      </div>

      {!state.isComplete && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onNextParagraph}
            className="text-xs font-medium text-primary hover:underline"
          >
            Next paragraph →
          </button>
        </div>
      )}
      {state.isComplete && (
        <div className="mt-3 text-xs text-muted">
          All questions resolved for this passage.
        </div>
      )}
    </div>
  );
}

