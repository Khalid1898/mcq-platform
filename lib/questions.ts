// lib/questions.ts
import questionsData from "../data/questions.json"; // ✅ content stored as data, not embedded in TS modules

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tags?: string[];
};

const questions = questionsData as Question[]; // ✅ typed view over JSON

export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  return ids.map((id) => {
    const q = questions.find((x) => x.id === id);
    if (!q) throw new Error(`Question not found: ${id}`); // ✅ fail fast for bad quiz.questionIds
    return q;
  });
}

export async function getQuestionById(id: string): Promise<Question | undefined> {
  return questions.find((q) => q.id === id);
}