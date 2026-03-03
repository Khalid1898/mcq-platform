"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReadingPassage } from "@/lib/content/reading";
import { useReadingSession } from "./useReadingSession";
import { PassagePanel } from "./PassagePanel";
import { FocusParagraphCard } from "./FocusParagraphCard";
import { QuestionStack } from "./QuestionStack";
import { FeedbackPanel } from "./FeedbackPanel";
import { ProgressHeader } from "./ProgressHeader";

type Props = {
  passage: ReadingPassage;
};

export function ReadingSession({ passage }: Props) {
  const { startSession, getStageState, submitAnswer, nextParagraph, endPreview } =
    useReadingSession(passage);

  const state = getStageState();
  const { stage, currentParagraphIndex, activeQuestions, isComplete } = state;
  const paragraph = passage.paragraphs[currentParagraphIndex];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 py-6 px-4">
      <ProgressHeader
        stage={stage}
        currentParagraphIndex={currentParagraphIndex}
        totalParagraphs={passage.paragraphs.length}
        answeredCount={
          Object.values(state.statusById).filter((s) => s === "completed")
            .length
        }
        totalQuestions={passage.questions.length}
      />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)]">
        <AnimatePresence mode="sync">
          {stage === "OVERWHELM" ? (
            <motion.section
              key="overwhelm"
              layoutId="passageStage"
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <h1 className="text-lg font-semibold text-text">
                {passage.title}
              </h1>
              <p className="mt-1 text-sm text-muted">
                First, take a breath—skim the passage.
              </p>
              <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-2 text-[15px] leading-relaxed text-text">
                {passage.paragraphs.map((p) => (
                  <p key={p.id}>{p.text}</p>
                ))}
              </div>
              <button
                type="button"
                onClick={startSession}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Begin Smart Practice
              </button>
            </motion.section>
          ) : (
            <motion.section
              key="focus"
              layoutId="passageStage"
              layout
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col"
            >
              <PassagePanel
                passage={passage}
                currentParagraphId={paragraph.id}
              />
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          {stage === "FOCUS" && (
            <FocusParagraphCard paragraph={paragraph} />
          )}
          <QuestionStack
            stage={stage}
            passage={passage}
            state={state}
            onSubmit={submitAnswer}
            onPreviewDone={endPreview}
          />
          <FeedbackPanel
            passage={passage}
            state={state}
            onNextParagraph={nextParagraph}
          />
        </div>
      </div>

      {isComplete && (
        <div className="mt-2 rounded-xl border border-border bg-surface p-3 text-xs text-muted">
          Session complete. All questions for this passage have been resolved.
        </div>
      )}
    </div>
  );
}

