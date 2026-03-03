"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import type { ReadingPassage } from "@/lib/content/reading";
import type {
  ReadingStageState,
  ReadingStage,
  SubmitAnswerPayload,
} from "./useReadingSession";
import { QuestionCard } from "./QuestionCard";
import { CoachTipCard } from "./CoachTipCard";

type Props = {
  stage: ReadingStage;
  passage: ReadingPassage;
  state: ReadingStageState;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onPreviewDone: () => void;
};

export function QuestionStack({ stage, passage, state, onSubmit, onPreviewDone }: Props) {
  if (stage === "OVERWHELM") {
    return null;
  }

  const currentParaNum = state.currentParagraphIndex + 1;
  const ids = state.activeQuestions.map((q) => q.id).join(", ");

  useEffect(() => {
    if (!state.showPreviewAll) return;
    const t = setTimeout(() => {
      onPreviewDone();
    }, 1500);
    return () => clearTimeout(t);
  }, [state.showPreviewAll, onPreviewDone]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      {state.showPreviewAll ? (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            All questions (pressure view)
          </div>
          <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-muted">
            {passage.questions.map((q) => (
              <li key={q.id}>
                Q{q.order}. {q.prompt}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              Focus set for paragraph {currentParaNum}:{" "}
              <span className="text-text">
                Q{ids ? ids.replace(/q/gi, "") : ""}
              </span>
            </div>
          </div>

          <CoachTipCard
            title="Why these?"
            body="These questions are chosen because they rely heavily on this paragraph. Training your brain to link a small set of questions to a single paragraph reduces overwhelm and builds paragraph-level scanning."
          />

          <div className="mt-3 space-y-3">
            <AnimatePresence>
              {state.activeQuestions.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <QuestionCard
                    question={q}
                    status={state.statusById[q.id]}
                    attempts={state.attemptsById[q.id] ?? 0}
                    onSubmit={(answer, action) =>
                      onSubmit({ questionId: q.id, answer, action })
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

