import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";

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
    return (
      <div className="mx-auto max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold text-text">Not submitted yet</h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Go back and submit your attempt first.
        </p>
        <Link
          href={`/attempt/${attemptId}`}
          className="inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to attempt
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Result</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Your attempt has been submitted. Score and details are below.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              Attempt ID
            </div>
            <div className="mt-1 font-mono text-[15px] text-text">{attempt.id}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              Score
            </div>
            <div className="mt-1 text-3xl font-semibold text-primary">
              {attempt.score ?? 0}%
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              Submitted
            </div>
            <div className="mt-1 text-[15px] text-text">{attempt.submittedAt}</div>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <Link
            href="/quizzes"
            className="inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}
