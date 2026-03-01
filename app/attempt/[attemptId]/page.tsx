import { headers } from "next/headers";
import { notFound } from "next/navigation";
import AttemptClient from "./AttemptClient";
import { getQuizById } from "@/lib/quizzes";
import { getQuestionsByIds } from "@/lib/questions";

type Attempt = {
  id: string;
  quizId: string;
  answers: { questionId: string; selectedIndex: number }[];
  submittedAt: string | null;
  score: number | null;
  createdAt: string;
};

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchAttempt(attemptId: string): Promise<Attempt> {
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/attempts/${attemptId}`, {
    cache: "no-store", // ✅ always read latest (important for attempts)
  });

  if (res.status === 404) notFound();

  if (!res.ok) {
    // ✅ surface a clearer error than a silent notFound
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load attempt (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { attempt: Attempt };
  return data.attempt;
}

type Props = { params: Promise<{ attemptId: string }> };

export default async function AttemptPage({ params }: Props) {
  const { attemptId } = await params;

  // ✅ 1) Read attempt via API to avoid in-memory Map “split brain”
  const attempt = await fetchAttempt(attemptId);

  // ✅ 2) Quiz + questions are static JSON via lib (safe + fast)
  const quiz = await getQuizById(attempt.quizId);
  if (!quiz) notFound();

  const questions = await getQuestionsByIds(quiz.questionIds);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <AttemptClient
        attemptId={attemptId}
        questions={questions}
        initialAttempt={attempt}
      />
    </div>
  );
}