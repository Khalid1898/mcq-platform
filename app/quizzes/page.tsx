import Link from "next/link";
import { headers } from "next/headers";

type Quiz = {
  id: string;
  title: string;
  topic: string;
};

async function getBaseUrl() {
  const h = await headers(); // ✅ headers() is async in your Next version
  const host = h.get("host"); // e.g. localhost:3000
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchQuizzes(): Promise<Quiz[]> {
  const baseUrl = await getBaseUrl(); // ✅ await
  const res = await fetch(`${baseUrl}/api/quizzes`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to load quizzes");

  const data = (await res.json()) as { quizzes: Quiz[] };
  return data.quizzes;
}

export default async function QuizCatalog() {
  const quizzes = await fetchQuizzes();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quiz Catalog</h1>

      <div className="grid gap-6">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quizzes/${quiz.id}`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{quiz.title}</h2>
            <p className="text-gray-500">{quiz.topic}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
