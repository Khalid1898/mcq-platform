import { notFound } from "next/navigation";
import { headers } from "next/headers";

type Quiz = {
  id: string;
  title: string;
  topic: string;
};

async function getBaseUrl() {
  const h = await headers(); // ✅ await
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchQuizById(quizId: string): Promise<Quiz> {
  const baseUrl = await getBaseUrl(); // ✅ await
  const res = await fetch(`${baseUrl}/api/quizzes/${quizId}`, {
    cache: "no-store",
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load quiz");

  const data = (await res.json()) as { quiz: Quiz };
  return data.quiz;
}

type Props = {
  params: Promise<{ quizId: string }>;
};

export default async function QuizDetail({ params }: Props) {
  const { quizId } = await params;
  const quiz = await fetchQuizById(quizId);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
      <p className="mb-6 text-gray-600">Topic: {quiz.topic}</p>

      <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
        Start Quiz
      </button>
    </div>
  );
}


