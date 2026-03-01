"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  explanation: string;
};

type Attempt = {
  id: string;
  quizId: string;
  answers: { questionId: string; selectedIndex: number }[];
  submittedAt?: string | null;
  score?: number | null;
};

export default function AttemptClient({
  attemptId,
  questions,
  initialAttempt,
}: {
  attemptId: string;
  questions: Question[];
  initialAttempt: Attempt;
}) {
  const router = useRouter();

  const [idx, setIdx] = useState(0);

  const [answers, setAnswers] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>();
    for (const a of initialAttempt.answers) {
      m.set(a.questionId, a.selectedIndex);
    }
    return m;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = questions[idx];
  const selected = answers.get(q.id);

  // ✅ Save answer to backend
  async function save(questionId: string, selectedIndex: number) {
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, selectedIndex }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data?.error ?? "Failed to save answer");
      }

      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, selectedIndex);
        return next;
      });
    } catch (e: any) {
      setError(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Submit attempt (locks + computes score)
  async function submit() {
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to submit");
      }

      // ✅ Go to result page cleanly
      router.push(`/attempt/${attemptId}/result`);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  const answeredCount = answers.size;
  const totalCount = questions.length;

  // ✅ NEW: require all answered before submit
  const allAnswered = answeredCount === totalCount;

  return (
    <main className="p-6 space-y-4">
      <div className="text-sm opacity-70">
        Question {idx + 1} / {totalCount}
      </div>

      <h1 className="text-xl font-semibold">{q.prompt}</h1>

      <div className="grid gap-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => save(q.id, i)}
            disabled={saving}
            className={`rounded border px-3 py-2 text-left ${
              selected === i ? "border-black bg-gray-100" : "border-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* ✅ NEW: show hint only on last question */}
      {idx === totalCount - 1 && !allAnswered && (
        <div className="text-sm text-amber-600">
          Answer all questions before submitting.
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm opacity-60">
          Answered {answeredCount} / {totalCount}
        </div>

        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-2 disabled:opacity-50"
            onClick={() => setIdx((x) => Math.max(0, x - 1))}
            disabled={idx === 0 || saving}
          >
            Back
          </button>

          {idx < questions.length - 1 ? (
            <button
              className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
              onClick={() => setIdx((x) => Math.min(questions.length - 1, x + 1))}
              disabled={saving}
            >
              Next
            </button>
          ) : (
            <button
              className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
              onClick={submit}
              disabled={saving || !allAnswered} // ✅ NEW: block submit until all answered
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </main>
  );
}