export type Quiz = {
    id: string;
    title: string;
    topic: string;
  };
  
  const quizzes: Quiz[] = [
    { id: "math-1", title: "Basic Math", topic: "Mathematics" },
    { id: "gcp-1", title: "GCP Fundamentals", topic: "Cloud" },
  ];
  
  // Simulate slow server fetch
  async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  export async function getQuizzes(): Promise<Quiz[]> {
    await delay(2000); // 2 second delay
    return quizzes;
  }
  
  export async function getQuizById(id: string): Promise<Quiz | undefined> {
    await delay(2000); // 2 second delay
    return quizzes.find((quiz) => quiz.id === id);
  }
  