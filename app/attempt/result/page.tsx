import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getQuizById } from "@/lib/quizzes";
import { getQuestionsByIds } from "@/lib/questions";

type Attempt = {
  id: string;
  quizId: string;
  answers: { questionId: string; selectedIndex: number }[];
  score: number | null;
  submittedAt: string | null;
};

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

export default async function ResultPage({ params }: Props) {
  const { attemptId } = await params;
  const attempt = await fetchAttempt(attemptId);

  const quiz = await getQuizById(attempt.quizId);
  if (!quiz) notFound();

  const questions = await getQuestionsByIds(quiz.questionIds);

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Result</h1>
        <p className="opacity-70">
          Score: <span className="font-semibold">{attempt.score ?? 0}</span> / {questions.length}
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const a = attempt.answers.find((x) => x.questionId === q.id);
          return (
            <div key={q.id} className="rounded border p-4 space-y-2">
              <div className="font-semibold">
                {i + 1}. {q.prompt}
              </div>
              <div className="text-sm">
                Your answer:{" "}
                <span className="font-medium">
                  {typeof a?.selectedIndex === "number" ? q.options[a.selectedIndex] : "Not answered"}
                </span>
              </div>
              <div className="text-sm opacity-80">Explanation: {q.explanation}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}