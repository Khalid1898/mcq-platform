import { headers } from "next/headers";
import { notFound } from "next/navigation";
import AttemptClient from "./AttemptClient";
import { getQuizById } from "@/lib/quizzes";
import { getQuestionsByIds } from "@/lib/questions";

type Attempt = { id: string; quizId: string; answers: { questionId: string; selectedIndex: number }[] };

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchAttempt(attemptId: string): Promise<Attempt> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/attempts/${attemptId}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load attempt");
  const data = (await res.json()) as { attempt: Attempt };
  return data.attempt;
}

type Props = { params: Promise<{ attemptId: string }> };

export default async function AttemptPage({ params }: Props) {
  const { attemptId } = await params;
  const attempt = await fetchAttempt(attemptId);

  const quiz = await getQuizById(attempt.quizId);
  if (!quiz) notFound();

  const questions = await getQuestionsByIds(quiz.questionIds);

  return <AttemptClient attemptId={attemptId} questions={questions} initialAttempt={attempt} />;
}