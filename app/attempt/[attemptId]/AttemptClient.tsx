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

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function errMsg(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

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

      const data = await safeJson(res);

      if (!res.ok) {
        const apiErr =
          typeof data === "object" && data !== null && "error" in data
            ? (data as { error?: unknown }).error
            : undefined;

        throw new Error(
          typeof apiErr === "string" ? apiErr : "Failed to save answer"
        );
      }

      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, selectedIndex);
        return next;
      });
    } catch (e: unknown) {
      setError(errMsg(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const apiErr =
          typeof data === "object" && data !== null && "error" in data
            ? (data as { error?: unknown }).error
            : undefined;

        throw new Error(typeof apiErr === "string" ? apiErr : "Failed to submit");
      }

      router.push(`/attempt/${attemptId}/result`);
      router.refresh();
    } catch (e: unknown) {
      setError(errMsg(e, "Submit failed"));
    } finally {
      setSaving(false);
    }
  }

  const answeredCount = answers.size;
  const totalCount = questions.length;
  const allAnswered = answeredCount === totalCount;

  return (
    <div className="space-y-6">
      <div className="text-sm font-medium">
        Question {idx + 1} / {totalCount}
      </div>

      <h1 className="text-xl font-semibold">{q.prompt}</h1>

      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => save(q.id, i)}
            disabled={saving}
            className={`w-full rounded border px-3 py-2 text-left transition ${
              selected === i
                ? "border-black bg-gray-100"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="text-sm text-gray-600">
        Answered {answeredCount} / {totalCount}
      </div>

      {idx === totalCount - 1 && !allAnswered && (
        <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
          Answer all questions before submitting.
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIdx((x) => Math.max(0, x - 1))}
          disabled={idx === 0 || saving}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Back
        </button>

        {idx < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setIdx((x) => Math.min(questions.length - 1, x + 1))}
            disabled={saving}
            className="rounded border px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={saving || !allAnswered}
            className="rounded border px-3 py-2 disabled:opacity-50"
            title={!allAnswered ? "Answer all questions to submit" : undefined}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}