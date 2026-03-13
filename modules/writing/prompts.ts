export type WritingTaskType =
  | "task2-opinion"
  | "task2-discussion"
  | "task2-advantages"
  | "task2-problem-solution"
  | "task2-two-part"
  // Reserved for future expansion
  | "task1-chart"
  | "task1-process"
  | "task1-map"
  | "gt-letter-complaint"
  | "gt-letter-request"
  | "gt-letter-informal";

export type WritingPrompt = {
  id: string;
  taskType: WritingTaskType;
  prompt: string;
  label: string;
  level?: "easy" | "medium" | "hard";
};

// Temporary development prompts for the guided Task 2 intro flow.
// In production, these should come from the writing question database.
export const DUMMY_TASK2_PROMPTS: WritingPrompt[] = [
  {
    id: "task2-001",
    taskType: "task2-opinion",
    label: "Technology and social interaction",
    prompt:
      "Some people believe that technology has made people less social. To what extent do you agree or disagree?",
  },
  {
    id: "task2-002",
    taskType: "task2-opinion",
    label: "Public transport vs new roads",
    prompt:
      "Governments should spend more money on public transport rather than building new roads. To what extent do you agree or disagree?",
  },
  {
    id: "task2-003",
    taskType: "task2-discussion",
    label: "Starting school early or later",
    prompt:
      "Some people think that children should begin formal education at a very early age, while others believe they should start school later. Discuss both views and give your opinion.",
  },
  {
    id: "task2-004",
    taskType: "task2-advantages",
    label: "Working from home with technology",
    prompt:
      "Many people work from home using modern technology. Do the advantages outweigh the disadvantages?",
  },
  {
    id: "task2-005",
    taskType: "task2-problem-solution",
    label: "Traffic congestion in cities",
    prompt:
      "In many cities, traffic congestion is becoming a serious problem. What are the main causes of this issue, and what solutions can be implemented?",
  },
  {
    id: "task2-006",
    taskType: "task2-two-part",
    label: "People living longer",
    prompt:
      "In many countries, people are living longer than before. What problems might this cause for society, and how can these problems be solved?",
  },
];

