/**
 * Render mapping: question metadata → screen type.
 * Used by WritingQuestionRenderer to pick the correct layout.
 */

import type { WritingQuestion, WritingScreenType } from "./types";

/**
 * Returns the screen type that should render this question.
 * - academic + task1 => academic_task1 (visual/report)
 * - general_training + task1 => general_task1_letter
 * - any task2 => task2_essay
 */
export function getScreenType(question: WritingQuestion): WritingScreenType {
  if (question.examType === "academic" && question.taskType === "task1") {
    return "academic_task1";
  }
  if (
    question.examType === "general_training" &&
    question.taskType === "task1"
  ) {
    return "general_task1_letter";
  }
  if (question.taskType === "task2") {
    return "task2_essay";
  }
  return "task2_essay";
}

/** Human-readable labels for subtypes (for UI only) */
export const SUBTYPE_LABELS: Record<string, string> = {
  line_graph: "Line graph",
  bar_chart: "Bar chart",
  pie_chart: "Pie chart",
  table: "Table",
  process_diagram: "Process diagram",
  map: "Map",
  mixed_visual: "Mixed visual",
  formal_letter: "Formal letter",
  semi_formal_letter: "Semi-formal letter",
  informal_letter: "Informal letter",
  opinion: "Opinion",
  discussion: "Discussion",
  problem_solution: "Problem / solution",
  advantage_disadvantage: "Advantage / disadvantage",
  direct_question: "Direct question",
};
