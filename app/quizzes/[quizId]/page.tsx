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
    <main className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          {quiz.title}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">Topic: {quiz.topic}</p>
      </div>
      <StartQuizButton quizId={quiz.id} />
    </main>
  );
}
