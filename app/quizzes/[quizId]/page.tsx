import { notFound } from "next/navigation";
import { headers } from "next/headers";
import StartQuizButton from "./StartQuizButton";

type Quiz = { id: string; title: string; topic: string };

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchQuizById(quizId: string): Promise<Quiz> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/quizzes/${quizId}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load quiz");
  const data = (await res.json()) as { quiz: Quiz };
  return data.quiz;
}

type Props = { params: Promise<{ quizId: string }> };

export default async function QuizDetail({ params }: Props) {
  const { quizId } = await params;
  const quiz = await fetchQuizById(quizId);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{quiz.title}</h1>
      <p>Topic: {quiz.topic}</p>
      <StartQuizButton quizId={quiz.id} />
    </main>
  );
}