export type Question = {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    tags?: string[];
  };
  
  const questions: Question[] = [
    {
      id: "math-q1",
      prompt: "What is 7 + 8?",
      options: ["14", "15", "16", "17"],
      correctIndex: 1,
      explanation: "7 + 8 = 15.",
      tags: ["math", "addition"],
    },
    {
      id: "math-q2",
      prompt: "What is 9 × 6?",
      options: ["45", "54", "56", "64"],
      correctIndex: 1,
      explanation: "9 × 6 = 54.",
      tags: ["math", "multiplication"],
    },
    {
      id: "gcp-q1",
      prompt: "Which Google Cloud resource sits above Projects in the hierarchy?",
      options: ["Folder", "VPC", "Region", "Instance"],
      correctIndex: 0,
      explanation: "Resource hierarchy is Organization → Folder → Project → Resources.",
      tags: ["gcp", "governance"],
    },
    {
      id: "gcp-q2",
      prompt: "Which service is commonly used for pub/sub messaging in Google Cloud?",
      options: ["Cloud Tasks", "Cloud Pub/Sub", "Cloud Scheduler", "Cloud Functions"],
      correctIndex: 1,
      explanation: "Cloud Pub/Sub is the messaging service.",
      tags: ["gcp", "data"],
    },
  ];
  
  export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
    return ids.map((id) => {
      const q = questions.find((x) => x.id === id);
      if (!q) throw new Error(`Question not found: ${id}`);
      return q;
    });
  }
  
  export async function getQuestionById(id: string): Promise<Question | undefined> {
    return questions.find((q) => q.id === id);
  }