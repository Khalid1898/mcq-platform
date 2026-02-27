export type Quiz = {
    id: string;
    title: string;
    topic: string;
    questionIds: string[];
  };
  
  const quizzes: Quiz[] = [
    {
      id: "math-1",
      title: "Basic Math",
      topic: "Mathematics",
      questionIds: ["math-q1", "math-q2"],
    },
    {
      id: "gcp-1",
      title: "GCP Fundamentals",
      topic: "Cloud",
      questionIds: ["gcp-q1", "gcp-q2"],
    },
  ];
  
  export async function getQuizzes(): Promise<Quiz[]> {
    return quizzes;
  }
  
  export async function getQuizById(id: string): Promise<Quiz | undefined> {
    return quizzes.find((q) => q.id === id);
  }