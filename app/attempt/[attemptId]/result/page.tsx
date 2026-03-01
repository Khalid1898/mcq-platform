import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Attempt = {
  id: string;
  quizId: string;
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

  if (!attempt.submittedAt) {
    // ✅ user hit result page without submitting
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Not submitted yet</h1>
        <p className="mt-2 text-gray-600">Go back and submit your attempt first.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Result</h1>
      <div className="mt-4 rounded border p-4">
        <div className="text-gray-600">Attempt ID</div>
        <div className="font-mono">{attempt.id}</div>

        <div className="mt-4 text-gray-600">Score</div>
        <div className="text-3xl font-bold">{attempt.score ?? 0}%</div>

        <div className="mt-4 text-gray-600">Submitted</div>
        <div>{attempt.submittedAt}</div>
      </div>
    </div>
  );
}