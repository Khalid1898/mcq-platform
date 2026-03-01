// lib/quizzes.ts
import quizzesData from "../data/quizzes.json"; // ✅ keeps content out of code while still shipping with the app build

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  questionIds: string[];
};

const quizzes = quizzesData as Quiz[]; // ✅ runtime data is JSON; cast gives you typed access in TS

export async function getQuizzes(): Promise<Quiz[]> {
  return quizzes; // ✅ later swap JSON → DB without changing callers
}

export async function getQuizById(id: string): Promise<Quiz | undefined> {
  return quizzes.find((q) => q.id === id); // ✅ same behavior as before, just different storage
}