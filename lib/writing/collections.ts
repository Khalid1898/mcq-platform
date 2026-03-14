/**
 * Writing question collections and loader utilities.
 * Aggregates file-based content; one question = one object, multiple questions = arrays per subtype.
 */

import type { ExamType, TaskType, WritingQuestion, WritingSubtype } from "./types";
import { academicTask1LineGraphQuestions } from "@/content/writing/academic-task1-line-graph";
import { academicTask1ProcessDiagramQuestions } from "@/content/writing/academic-task1-process-diagram";
import { generalTask1FormalLetterQuestions } from "@/content/writing/general-task1-formal-letter";
import { academicTask2OpinionQuestions } from "@/content/writing/academic-task2-opinion";
import { academicTask2DiscussionQuestions } from "@/content/writing/academic-task2-discussion";

// Re-export named arrays (multiple questions per subtype)
export { academicTask1LineGraphQuestions } from "@/content/writing/academic-task1-line-graph";
export { academicTask1ProcessDiagramQuestions } from "@/content/writing/academic-task1-process-diagram";
export { generalTask1FormalLetterQuestions } from "@/content/writing/general-task1-formal-letter";
export { academicTask2OpinionQuestions } from "@/content/writing/academic-task2-opinion";
export { academicTask2DiscussionQuestions } from "@/content/writing/academic-task2-discussion";

/** Flat list of all writing questions from all collections */
export const ALL_WRITING_QUESTIONS: WritingQuestion[] = [
  ...academicTask1LineGraphQuestions,
  ...academicTask1ProcessDiagramQuestions,
  ...generalTask1FormalLetterQuestions,
  ...academicTask2OpinionQuestions,
  ...academicTask2DiscussionQuestions,
];

/**
 * Get a single question by id. Returns undefined if not found.
 * Use the returned object with <WritingQuestionRenderer question={question} />.
 */
export function getQuestionById(id: string): WritingQuestion | undefined {
  return ALL_WRITING_QUESTIONS.find((q) => q.id === id);
}

/**
 * Get all questions that match the given subtype.
 */
export function getQuestionsBySubtype(
  subtype: WritingSubtype
): WritingQuestion[] {
  return ALL_WRITING_QUESTIONS.filter((q) => q.subtype === subtype);
}

/**
 * Get all questions for the given exam type (academic or general_training).
 */
export function getQuestionsByExamType(
  examType: ExamType
): WritingQuestion[] {
  return ALL_WRITING_QUESTIONS.filter((q) => q.examType === examType);
}

/**
 * Get all questions for the given task type (task1 or task2).
 */
export function getQuestionsByTaskType(
  taskType: TaskType
): WritingQuestion[] {
  return ALL_WRITING_QUESTIONS.filter((q) => q.taskType === taskType);
}
