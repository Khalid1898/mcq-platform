"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ReadingPassage,
  ReadingQuestion,
} from "@/lib/content/reading";

export type ReadingStage = "OVERWHELM" | "FOCUS";

export type QuestionStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped"
  | "retry";

export type ReadingStageState = {
  stage: ReadingStage;
  currentParagraphIndex: number;
  activeQuestions: ReadingQuestion[];
  showPreviewAll: boolean;
  statusById: Record<string, QuestionStatus>;
  attemptsById: Record<string, number>;
  feedbackForQuestionId: string | null;
  isComplete: boolean;
};

export type SubmitAnswerPayload = {
  questionId: string;
  answer: unknown;
  action?: "submit" | "skipParagraph" | "tryAgain" | "reveal";
};

export type ReadingSummary = {
  correctCount: number;
  total: number;
};

function evaluateAnswer(question: ReadingQuestion, answer: unknown): boolean {
  if (question.type === "TFNG") {
    return (
      typeof answer === "string" &&
      typeof question.correctAnswer === "string" &&
      answer.trim().toLowerCase() ===
        (question.correctAnswer as string).trim().toLowerCase()
    );
  }

  if (question.type === "MATCHING_INFO") {
    return (
      typeof answer === "string" &&
      typeof question.correctAnswer === "string" &&
      answer.trim().toLowerCase() ===
        (question.correctAnswer as string).trim().toLowerCase()
    );
  }

  if (question.type === "SENTENCE_COMPLETION") {
    if (Array.isArray(question.correctAnswer)) {
      const arrAns = Array.isArray(answer) ? answer : [answer];
      const target = (question.correctAnswer as string[])[0] ?? "";
      const given = (arrAns[0] as string | undefined) ?? "";
      return given.trim().toLowerCase() === target.trim().toLowerCase();
    }
  }

  return false;
}

export function useReadingSession(passage: ReadingPassage) {
  const totalQuestions = passage.questions.length;

  const [stage, setStage] = useState<ReadingStage>("OVERWHELM");
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [showPreviewAll, setShowPreviewAll] = useState(false);
  const [statusById, setStatusById] = useState<Record<string, QuestionStatus>>(
    () =>
      Object.fromEntries(
        passage.questions.map((q) => [q.id, "pending" as QuestionStatus])
      )
  );
  const [attemptsById, setAttemptsById] = useState<Record<string, number>>({});
  const [feedbackForQuestionId, setFeedbackForQuestionId] =
    useState<string | null>(null);

  const tfngIds = useMemo(
    () =>
      passage.questions
        .filter((q) => q.type === "TFNG")
        .sort((a, b) => a.order - b.order)
        .map((q) => q.id),
    [passage.questions]
  );

  const matchIds = useMemo(
    () =>
      passage.questions
        .filter((q) => q.type === "MATCHING_INFO")
        .sort((a, b) => a.order - b.order)
        .map((q) => q.id),
    [passage.questions]
  );

  const sentIds = useMemo(
    () =>
      passage.questions
        .filter((q) => q.type === "SENTENCE_COMPLETION")
        .sort((a, b) => a.order - b.order)
        .map((q) => q.id),
    [passage.questions]
  );

  const activeQuestions = useMemo(() => {
    if (stage === "OVERWHELM" || showPreviewAll) return [];

    const paraIndex = currentParagraphIndex;

    const pickNextId = (ids: string[], index: number) => {
      if (!ids.length) return undefined;
      const clamped = Math.min(index, ids.length - 1);
      const id = ids[clamped];
      return id;
    };

    const pickTfngId = () => pickNextId(tfngIds, paraIndex);

    const pickMatchId = () => {
      if (!matchIds.length) return undefined;
      const targetIdx = Math.min(paraIndex, matchIds.length - 1);
      const prevIdx = targetIdx - 1;
      if (prevIdx >= 0) {
        const prevId = matchIds[prevIdx];
        const prevStatus = statusById[prevId];
        const prevAttempts = attemptsById[prevId] ?? 0;
        if (
          prevStatus !== "completed" &&
          prevStatus !== "skipped" &&
          prevAttempts === 0
        ) {
          return prevId;
        }
      }
      return matchIds[targetIdx];
    };

    const pickSentId = () => pickNextId(sentIds, paraIndex);

    const ids: string[] = [];
    const tf = pickTfngId();
    const m = pickMatchId();
    const s = pickSentId();
    if (tf) ids.push(tf);
    if (m) ids.push(m);
    if (s) ids.push(s);

    const map = new Map(passage.questions.map((q) => [q.id, q]));
    return ids
      .map((id) => map.get(id))
      .filter((q): q is ReadingQuestion => Boolean(q));
  }, [
    stage,
    showPreviewAll,
    currentParagraphIndex,
    tfngIds,
    matchIds,
    sentIds,
    passage.questions,
    statusById,
    attemptsById,
  ]);

  const isComplete = useMemo(
    () =>
      passage.questions.every((q) => statusById[q.id] === "completed"),
    [passage.questions, statusById]
  );

  const startSession = useCallback(() => {
    setStage("FOCUS");
    setCurrentParagraphIndex(0);
    setShowPreviewAll(true);
  }, []);

  const submitAnswer = useCallback(
    (payload: SubmitAnswerPayload) => {
      const { questionId, answer, action = "submit" } = payload;
      const q = passage.questions.find((qq) => qq.id === questionId);
      if (!q) return;

      if (action === "skipParagraph") {
        setStatusById((prev) => ({ ...prev, [questionId]: "skipped" }));
        setFeedbackForQuestionId(null);
        return;
      }

      if (action === "reveal") {
        setStatusById((prev) => ({ ...prev, [questionId]: "completed" }));
        setFeedbackForQuestionId(questionId);
        setAttemptsById((prev) => ({
          ...prev,
          [questionId]: (prev[questionId] ?? 0) + 1,
        }));
        return;
      }

      if (action === "tryAgain") {
        setFeedbackForQuestionId(null);
        return;
      }

      const correct = evaluateAnswer(q, answer);
      setAttemptsById((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] ?? 0) + 1,
      }));
      setStatusById((prev) => ({
        ...prev,
        [questionId]: correct ? "completed" : "retry",
      }));
      setFeedbackForQuestionId(questionId);
    },
    [passage.questions]
  );

  const nextParagraph = useCallback(() => {
    const nextIndex = Math.min(
      passage.paragraphs.length - 1,
      currentParagraphIndex + 1
    );
    setCurrentParagraphIndex(nextIndex);
    setFeedbackForQuestionId(null);
  }, [currentParagraphIndex, passage.paragraphs.length]);

  const completeSession = useCallback((): ReadingSummary => {
    const correctCount = passage.questions.filter(
      (q) => statusById[q.id] === "completed"
    ).length;
    return { correctCount, total: totalQuestions };
  }, [passage.questions, statusById, totalQuestions]);

  const stageState: ReadingStageState = {
    stage,
    currentParagraphIndex,
    activeQuestions,
    showPreviewAll,
    statusById,
    attemptsById,
    feedbackForQuestionId,
    isComplete,
  };

  return {
    startSession,
    getStageState: () => stageState,
    submitAnswer,
    nextParagraph,
    completeSession,
    endPreview: () => setShowPreviewAll(false),
  };
}

