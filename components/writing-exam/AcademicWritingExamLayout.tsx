"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AcademicWritingExamData,
  ActiveWritingTask,
  WritingExamAnswers,
} from "./types";
import { WritingExamTopBar } from "./WritingExamTopBar";
import { QuestionPanel } from "./QuestionPanel";
import { WritingEditor } from "./WritingEditor";
import { ExamBottomBar } from "./ExamBottomBar";
import { countWords } from "./WritingEditor";

const EXAM_TITLE = "IELTS Academic Writing";
const TOTAL_SECONDS = 60 * 60; // 60:00

function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export interface AcademicWritingExamLayoutProps {
  examData: AcademicWritingExamData;
  /** Optional slot above the exam area (e.g. future progress bar). */
  topSlot?: React.ReactNode;
  /** Called when the user has completed at least one sub task (e.g. written something in Task 1 or Task 2). Use to update practice progress circle. */
  onSubTaskProgress?: () => void;
}

/**
 * Full IELTS Academic Writing exam: top bar (title, timer, task tabs), split
 * question/editor panels, bottom bar (task label, word count, prev/next).
 * Keeps separate answer state per task.
 */
export function AcademicWritingExamLayout({
  examData,
  topSlot,
  onSubTaskProgress,
}: AcademicWritingExamLayoutProps) {
  const [activeTask, setActiveTask] = useState<ActiveWritingTask>("task1");
  const [answers, setAnswers] = useState<WritingExamAnswers>({
    task1: "",
    task2: "",
  });
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_SECONDS);

  const currentAnswer = answers[activeTask];
  const currentWordCount = countWords(currentAnswer);

  const hasSubTaskProgress =
    answers.task1.trim().length > 0 || answers.task2.trim().length > 0;

  useEffect(() => {
    if (hasSubTaskProgress) onSubTaskProgress?.();
  }, [hasSubTaskProgress, onSubTaskProgress]);

  const handleAnswerChange = useCallback((task: ActiveWritingTask, value: string) => {
    setAnswers((prev) => ({ ...prev, [task]: value }));
  }, []);

  const handlePreviousTask = useCallback(() => {
    setActiveTask("task1");
  }, []);

  const handleNextTask = useCallback(() => {
    setActiveTask("task2");
  }, []);

  // Mock countdown: decrement every second
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] min-h-[520px] flex-col bg-neutral-100 dark:bg-neutral-950">
      {/* Reserved for future progress / session UI */}
      {topSlot ? (
        <div className="shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          {topSlot}
        </div>
      ) : (
        <div className="h-4 shrink-0" aria-hidden />
      )}

      <WritingExamTopBar
        title={EXAM_TITLE}
        timeRemaining={formatTimeRemaining(secondsRemaining)}
        activeTask={activeTask}
        onTaskChange={setActiveTask}
      />

      {/* Main exam area: question (40%) | editor (60%) */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className="w-full md:w-[40%] md:min-w-[280px] md:max-w-[480px]"
          aria-label="Writing task"
        >
          <QuestionPanel
            task1Data={examData.task1}
            task2Data={examData.task2}
            activeTask={activeTask}
          />
        </aside>
        <main
          className="flex min-h-[320px] flex-1 flex-col border-t border-neutral-200 p-4 md:border-t-0 md:border-l-0 md:min-w-0 dark:border-neutral-800"
          aria-label="Writing answer area"
        >
          <WritingEditor
            value={currentAnswer}
            onChange={(value) => handleAnswerChange(activeTask, value)}
            aria-label={`Writing answer ${activeTask === "task1" ? "Task 1" : "Task 2"}`}
            showCharacterCount
          />
        </main>
      </div>

      <ExamBottomBar
        activeTask={activeTask}
        wordCount={currentWordCount}
        onPreviousTask={handlePreviousTask}
        onNextTask={handleNextTask}
      />
    </div>
  );
}
