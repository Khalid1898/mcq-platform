/**
 * Template objects for providing writing material.
 * Copy one of these and fill in the values, or use as a reference for API/CMS/JSON.
 *
 * @see docs/WRITING-MATERIAL-TEMPLATE.md for full field reference
 */

import type {
  AcademicTask1Question,
  GeneralTask1Question,
  Task2Question,
} from "./types";

/** Template: Academic Task 1 (chart/diagram/map). Subtype must be one of: line_graph, bar_chart, pie_chart, table, process_diagram, map, mixed_visual */
export const ACADEMIC_TASK1_TEMPLATE: Omit<AcademicTask1Question, "id"> & {
  id: string;
} = {
  id: "<unique-id>",
  examType: "academic",
  taskType: "task1",
  subtype: "line_graph",
  title: "",
  prompt: "",
  instructions: "You should spend about 20 minutes on this task.",
  summariseInstruction:
    "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  minimumWords: 150,
  suggestedMinutes: 20,
  difficulty: "medium",
  topic: "",
  tags: [],
  imageUrl: undefined,
  imageAlt: undefined,
};

/** Template: General Training Task 1 (letter). Subtype must be: formal_letter, semi_formal_letter, informal_letter */
export const GENERAL_TASK1_TEMPLATE: Omit<GeneralTask1Question, "id"> & {
  id: string;
} = {
  id: "<unique-id>",
  examType: "general_training",
  taskType: "task1",
  subtype: "formal_letter",
  title: "",
  prompt: "",
  instructions: "You should spend about 20 minutes on this task.",
  minimumWords: 150,
  suggestedMinutes: 20,
  difficulty: "easy",
  topic: "",
  tags: [],
  bulletPoints: [],
};

/** Template: Task 2 essay (Academic or General Training). Subtype must be: opinion, discussion, problem_solution, advantage_disadvantage, direct_question */
export const TASK2_TEMPLATE: Omit<Task2Question, "id"> & { id: string } = {
  id: "<unique-id>",
  examType: "academic",
  taskType: "task2",
  subtype: "opinion",
  title: "",
  prompt: "",
  instructions: "You should spend about 40 minutes on this task.",
  minimumWords: 250,
  suggestedMinutes: 40,
  difficulty: "medium",
  topic: "",
  tags: [],
};
