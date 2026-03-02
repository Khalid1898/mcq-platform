"use client";

import { useEffect, useMemo, useState } from "react";
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

  // Track visited questions (for skipped detection)
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = questions[idx];
  const selected = answers.get(q.id);

  useEffect(() => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(q.id);
      return next;
    });
  }, [q.id]);

  const answeredCount = answers.size;
  const totalCount = questions.length;
  const allAnswered = answeredCount === totalCount;

  const unansweredIndexes = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < questions.length; i++) {
      if (!answers.has(questions[i].id)) list.push(i);
    }
    return list;
  }, [answers, questions]);

  const skippedIndexes = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < questions.length; i++) {
      const id = questions[i].id;
      if (visited.has(id) && !answers.has(id)) list.push(i);
    }
    return list;
  }, [visited, answers, questions]);

  function goToQuestion(i: number) {
    if (saving) return;
    setIdx(Math.max(0, Math.min(totalCount - 1, i)));
  }

  function goNext() {
    if (saving) return;
    setIdx((x) => Math.min(totalCount - 1, x + 1));
  }

  function goPrev() {
    if (saving) return;
    setIdx((x) => Math.max(0, x - 1));
  }

  function skip() {
    if (saving) return;
    if (idx < totalCount - 1) goNext();
  }

  function goToNextUnanswered() {
    if (saving) return;
    if (unansweredIndexes.length === 0) return;

    const next = unansweredIndexes.find((i) => i > idx);
    goToQuestion(typeof next === "number" ? next : unansweredIndexes[0]);
  }

  function goToFirstSkipped() {
    if (saving) return;
    if (skippedIndexes.length === 0) return;
    goToQuestion(skippedIndexes[0]);
  }

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

        throw new Error(
          typeof apiErr === "string" ? apiErr : "Failed to submit"
        );
      }

      router.push(`/attempt/${attemptId}/result`);
      router.refresh();
    } catch (e: unknown) {
      setError(errMsg(e, "Submit failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium">
          Question {idx + 1} / {totalCount}
          <span className="ml-2 text-gray-600">
            (Answered {answeredCount} / {totalCount})
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={goToNextUnanswered}
            disabled={saving || unansweredIndexes.length === 0}
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
          >
            Next Unanswered
          </button>

          <button
            type="button"
            onClick={goToFirstSkipped}
            disabled={saving || skippedIndexes.length === 0}
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
          >
            Review Skipped
          </button>
        </div>
      </div>

      {/* Question Palette */}
      <div className="rounded border bg-white p-3">
        <div className="mb-2 text-sm font-semibold">Questions</div>

        <div className="flex flex-wrap gap-2">
          {questions.map((qq, i) => {
            const isCurrent = i === idx;
            const isAnswered = answers.has(qq.id);
            const isSkipped = visited.has(qq.id) && !isAnswered;

            const base =
              "h-9 w-9 rounded text-sm flex items-center justify-center transition";

            const ring = isCurrent ? "ring-2 ring-black ring-offset-2" : "";

            let cls = "border border-gray-300 text-gray-700";

            if (isAnswered) cls = "bg-black text-white border-black";
            else if (isSkipped) cls = "bg-yellow-400 text-black border-yellow-500";

            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => goToQuestion(i)}
                disabled={saving}
                className={`${base} ${cls} ${ring} disabled:opacity-50`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <h1 className="text-xl font-semibold">{q.prompt}</h1>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;

          return (
            <label
              key={i}
              className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2 transition ${
                isSelected
                  ? "border-black bg-gray-100 font-semibold"
                  : "border-gray-300 hover:border-black"
              } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                className="mt-1"
                checked={isSelected}
                disabled={saving}
                onChange={() => save(q.id, i)}
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={saving || idx === 0}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        {/* ✅ If all answered, show Submit from ANY page */}
        {allAnswered ? (
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded border px-3 py-2 disabled:opacity-50"
          >
            Submit
          </button>
        ) : idx < totalCount - 1 ? (
          <>
            <button
              type="button"
              onClick={skip}
              disabled={saving}
              className="rounded border px-3 py-2 disabled:opacity-50"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={saving}
              className="rounded border px-3 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={saving || !allAnswered}
            className="rounded border px-3 py-2 disabled:opacity-50"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}