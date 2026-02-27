"use client";

import { useEffect, useMemo, useState } from "react";

type Question = { id: string; prompt: string; options: string[]; explanation: string };
type Attempt = { id: string; quizId: string; answers: { questionId: string; selectedIndex: number }[] };

export default function AttemptClient({
  attemptId,
  questions,
  initialAttempt,
}: {
  attemptId: string;
  questions: Question[];
  initialAttempt: Attempt;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>();
    for (const a of initialAttempt.answers) m.set(a.questionId, a.selectedIndex);
    return m;
  });
  const [saving, setSaving] = useState(false);

  const q = questions[idx];
  const selected = answers.get(q.id);

  async function save(questionId: string, selectedIndex: number) {
    setSaving(true);
    try {
      const res = await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, selectedIndex }),
      });
      if (!res.ok) throw new Error("Failed to save answer");
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, selectedIndex);
        return next;
      });
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to submit");
      window.location.href = `/attempt/${attemptId}/result`;
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="text-sm opacity-70">
        Question {idx + 1} / {questions.length}
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
            disabled={saving}
          >
            Submit
          </button>
        )}
      </div>
    </main>
  );
}