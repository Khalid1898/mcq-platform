/**
 * IELTS Writing question type system.
 * Supports Academic and General Training with task- and subtype-based rendering.
 */

export const EXAM_TYPES = ["academic", "general_training"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export const TASK_TYPES = ["task1", "task2"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

/** Academic Task 1: visual/report types */
export const ACADEMIC_TASK1_SUBTYPES = [
  "line_graph",
  "bar_chart",
  "pie_chart",
  "table",
  "process_diagram",
  "map",
  "mixed_visual",
] as const;
export type AcademicTask1Subtype = (typeof ACADEMIC_TASK1_SUBTYPES)[number];

/** General Training Task 1: letter types */
export const GENERAL_TASK1_SUBTYPES = [
  "formal_letter",
  "semi_formal_letter",
  "informal_letter",
] as const;
export type GeneralTask1Subtype = (typeof GENERAL_TASK1_SUBTYPES)[number];

/** Task 2: essay types (shared by Academic and General Training) */
export const TASK2_SUBTYPES = [
  "opinion",
  "discussion",
  "problem_solution",
  "advantage_disadvantage",
  "direct_question",
] as const;
export type Task2Subtype = (typeof TASK2_SUBTYPES)[number];

/** All writing subtypes (for validation / unions) */
export type WritingSubtype =
  | AcademicTask1Subtype
  | GeneralTask1Subtype
  | Task2Subtype;

/** Screen type selected by the renderer from question metadata */
export const WRITING_SCREEN_TYPES = [
  "academic_task1",
  "general_task1_letter",
  "task2_essay",
] as const;
export type WritingScreenType = (typeof WRITING_SCREEN_TYPES)[number];

/** Common fields for every writing question */
export interface BaseWritingQuestion {
  id: string;
  examType: ExamType;
  taskType: TaskType;
  subtype: WritingSubtype;
  title?: string;
  prompt: string;
  instructions: string;
  minimumWords: number;
  suggestedMinutes: number;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
  tags?: string[];
}

/** Academic Task 1: visual (chart/diagram/map) with optional image */
export interface AcademicTask1Question extends BaseWritingQuestion {
  examType: "academic";
  taskType: "task1";
  subtype: AcademicTask1Subtype;
  /** Report instruction after the visual, e.g. "Summarise the information..." */
  summariseInstruction: string;
  imageUrl?: string;
  imageAlt?: string;
}

/** General Training Task 1: letter with bullet points */
export interface GeneralTask1Question extends BaseWritingQuestion {
  examType: "general_training";
  taskType: "task1";
  subtype: GeneralTask1Subtype;
  /** Letter bullet points the candidate must address */
  bulletPoints?: string[];
}

/** Task 2: essay (Academic or General Training) */
export interface Task2Question extends BaseWritingQuestion {
  taskType: "task2";
  subtype: Task2Subtype;
  examType: ExamType;
}

/** Union of all question shapes for type-safe handling */
export type WritingQuestion =
  | AcademicTask1Question
  | GeneralTask1Question
  | Task2Question;

/** Type guard: Academic Task 1 */
export function isAcademicTask1(
  q: WritingQuestion
): q is AcademicTask1Question {
  return q.examType === "academic" && q.taskType === "task1";
}

/** Type guard: General Training Task 1 */
export function isGeneralTask1(
  q: WritingQuestion
): q is GeneralTask1Question {
  return q.examType === "general_training" && q.taskType === "task1";
}

/** Type guard: Task 2 (any exam type) */
export function isTask2(q: WritingQuestion): q is Task2Question {
  return q.taskType === "task2";
}
