import Link from "next/link";
import { headers } from "next/headers";

type Quiz = {
  id: string;
  title: string;
  topic: string;
};

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function fetchQuizzes(): Promise<Quiz[]> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/quizzes`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to load quizzes");

  const data = (await res.json()) as { quizzes: Quiz[] };
  return data.quizzes;
}

export default async function QuizCatalog() {
  const quizzes = await fetchQuizzes();

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Quiz Catalog
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Choose a quiz to practice. Your progress is saved as you go.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quizzes/${quiz.id}`}
            className="block rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-[15px] font-semibold text-text">{quiz.title}</h2>
            <p className="mt-1 text-sm text-muted">{quiz.topic}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
