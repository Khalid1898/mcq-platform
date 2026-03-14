import type { WritingQuestion } from "./types";

/**
 * Sample writing questions for demo and development.
 * In production, load from API/storage and pass into WritingQuestionRenderer.
 */

export const SAMPLE_WRITING_QUESTIONS: WritingQuestion[] = [
  // 1. Academic Task 1 / line_graph
  {
    id: "ac-task1-line-001",
    examType: "academic",
    taskType: "task1",
    subtype: "line_graph",
    title: "Household internet connections 2005–2020",
    prompt:
      "The chart below shows the percentage of households using three different internet connection types between 2005 and 2020.",
    instructions: "You should spend about 20 minutes on this task.",
    summariseInstruction:
      "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    minimumWords: 150,
    suggestedMinutes: 20,
    difficulty: "medium",
    topic: "Technology",
    tags: ["line_graph", "trends"],
    imageUrl: undefined,
    imageAlt: undefined,
  },

  // 2. Academic Task 1 / process_diagram
  {
    id: "ac-task1-process-001",
    examType: "academic",
    taskType: "task1",
    subtype: "process_diagram",
    title: "Water cycle",
    prompt:
      "The diagram below shows how water is cycled from the ocean to the atmosphere and back to the ocean.",
    instructions: "You should spend about 20 minutes on this task.",
    summariseInstruction:
      "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    minimumWords: 150,
    suggestedMinutes: 20,
    difficulty: "medium",
    topic: "Environment",
    tags: ["process_diagram"],
    imageUrl: undefined,
    imageAlt: undefined,
  },

  // 3. General Training Task 1 / formal_letter
  {
    id: "gt-task1-formal-001",
    examType: "general_training",
    taskType: "task1",
    subtype: "formal_letter",
    title: "Complaint about a product",
    prompt: `You recently bought an item from a store. When you got home, you discovered that the item did not work properly.

Write a letter to the store manager. In your letter:
`,
    instructions: "You should spend about 20 minutes on this task.",
    minimumWords: 150,
    suggestedMinutes: 20,
    difficulty: "easy",
    topic: "Consumer",
    tags: ["formal_letter", "complaint"],
    bulletPoints: [
      "describe the item and say what the problem is",
      "explain why you need the item urgently",
      "say what you would like the manager to do",
    ],
  },

  // 4. Academic Task 2 / opinion
  {
    id: "ac-task2-opinion-001",
    examType: "academic",
    taskType: "task2",
    subtype: "opinion",
    title: "Working from home",
    prompt: `Some people believe that working from home is beneficial for employees and employers, while others think it reduces productivity.

Discuss both views and give your own opinion.

Give reasons for your answer and include relevant examples from your own knowledge or experience.`,
    instructions: "You should spend about 40 minutes on this task.",
    minimumWords: 250,
    suggestedMinutes: 40,
    difficulty: "medium",
    topic: "Work",
    tags: ["opinion", "work"],
  },

  // 5. General Training Task 2 / discussion
  {
    id: "gt-task2-discussion-001",
    examType: "general_training",
    taskType: "task2",
    subtype: "discussion",
    title: "Starting school age",
    prompt: `Some people think that children should begin formal education at a very early age, while others believe they should start school later.

Discuss both views and give your opinion.

Give reasons for your answer and include relevant examples from your own knowledge or experience.`,
    instructions: "You should spend about 40 minutes on this task.",
    minimumWords: 250,
    suggestedMinutes: 40,
    difficulty: "medium",
    topic: "Education",
    tags: ["discussion", "education"],
  },
];
