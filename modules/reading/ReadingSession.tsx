"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { ReadingPassage } from "@/lib/content/reading";
import { useReadingSession } from "./useReadingSession";
import { PassagePanel } from "./PassagePanel";
import { ProgressHeader } from "./ProgressHeader";

const LAYOUT_TRANSITION = {
  layout: {
    duration: 5,
    ease: [0.32, 0.72, 0, 1],
  },
};

type Props = {
  passage: ReadingPassage;
};

export function ReadingSession({ passage }: Props) {
  const { startSession, getStageState, submitAnswer, nextParagraph, endPreview } =
    useReadingSession(passage);

  const state = getStageState();
  const { stage, currentParagraphIndex, isComplete } = state;
  const paragraph = passage.paragraphs[currentParagraphIndex];

  // Auto-transition to FOCUS after 2s
  useEffect(() => {
    if (stage !== "OVERWHELM") return;
    const t = setTimeout(startSession, 2000);
    return () => clearTimeout(t);
  }, [stage, startSession]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 py-6 px-4">
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

      {stage === "OVERWHELM" ? (
        <motion.section
          layoutId="passageStage"
          layout
          initial={false}
          transition={LAYOUT_TRANSITION}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-text">
            {passage.title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            First, take a breath—skim the passage.
          </p>
          <div className="mt-4 max-h-[65vh] space-y-4 overflow-y-auto pr-2 text-[15px] leading-relaxed text-text">
            {passage.paragraphs.map((p) => (
              <p key={p.id}>{p.text}</p>
            ))}
          </div>
        </motion.section>
      ) : (
        <motion.section
          layoutId="passageStage"
          layout
          initial={false}
          transition={LAYOUT_TRANSITION}
        >
          <PassagePanel
            passage={passage}
            currentParagraphId={paragraph.id}
          />
        </motion.section>
      )}
    </div>
  );
}

