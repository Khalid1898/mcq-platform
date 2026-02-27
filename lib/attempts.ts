import { getQuizById } from "@/lib/quizzes";

export type AttemptAnswer = { questionId: string; selectedIndex: number };

export type Attempt = {
  id: string;
  quizId: string;
  answers: AttemptAnswer[];
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
};

const attempts = new Map<string, Attempt>();

export async function createAttempt(quizId: string): Promise<Attempt> {
  const quiz = await getQuizById(quizId);
  if (!quiz) throw new Error("Quiz not found");

  const attempt: Attempt = {
    id: crypto.randomUUID(),
    quizId,
    answers: [],
    score: null,
    startedAt: new Date().toISOString(),
    submittedAt: null,
  };

  attempts.set(attempt.id, attempt);
  return attempt;
}

export async function getAttempt(attemptId: string): Promise<Attempt | undefined> {
  return attempts.get(attemptId);
}

export async function saveAnswer(attemptId: string, questionId: string, selectedIndex: number): Promise<Attempt> {
  const attempt = attempts.get(attemptId);
  if (!attempt) throw new Error("Attempt not found");
  if (attempt.submittedAt) throw new Error("Attempt already submitted");

  const existing = attempt.answers.find((a) => a.questionId === questionId);
  if (existing) existing.selectedIndex = selectedIndex;
  else attempt.answers.push({ questionId, selectedIndex });

  attempts.set(attemptId, attempt);
  return attempt;
}

export async function submitAttempt(attemptId: string): Promise<Attempt> {
  const attempt = attempts.get(attemptId);
  if (!attempt) throw new Error("Attempt not found");
  if (attempt.submittedAt) return attempt;

  const quiz = await getQuizById(attempt.quizId);
  if (!quiz) throw new Error("Quiz not found");

  // score is calculated in the API layer where we have questions; here we just lock it
  attempt.submittedAt = new Date().toISOString();
  attempts.set(attemptId, attempt);
  return attempt;
}

export async function setScore(attemptId: string, score: number): Promise<Attempt> {
  const attempt = attempts.get(attemptId);
  if (!attempt) throw new Error("Attempt not found");
  attempt.score = score;
  attempts.set(attemptId, attempt);
  return attempt;
}