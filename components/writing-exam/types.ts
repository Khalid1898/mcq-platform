/**
 * Data shape for an IELTS Writing task displayed in the exam UI.
 * Used by QuestionPanel and by pages that load tasks.
 */
export interface WritingTaskExamData {
  /** e.g. "WRITING TASK 2" */
  taskLabel: string;
  /** e.g. "You should spend about 40 minutes on this task." */
  instruction: string;
  /** Full question prompt (one or more paragraphs). */
  prompt: string;
  /** e.g. "Write at least 250 words." */
  wordRequirement: string;
}

/** Academic Writing Task 1: chart/diagram task. */
export interface Task1ExamData {
  taskLabel: string;
  instruction: string;
  /** Intro prompt before the visual (e.g. "The chart below shows..."). */
  prompt: string;
  /** Instruction after the visual (e.g. "Summarise the information..."). */
  summariseInstruction: string;
  wordRequirement: string;
}

/** Academic Writing Task 2: essay task. */
export interface Task2ExamData {
  taskLabel: string;
  instruction: string;
  /** Full essay prompt (one or more paragraphs). */
  prompt: string;
  wordRequirement: string;
}

/** Full Academic Writing exam data (Task 1 + Task 2). */
export interface AcademicWritingExamData {
  task1: Task1ExamData;
  task2: Task2ExamData;
}

export type ActiveWritingTask = "task1" | "task2";

/** Answers held per task for the duration of the exam. */
export interface WritingExamAnswers {
  task1: string;
  task2: string;
}
