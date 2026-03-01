"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  quizId: string;
};

export default function StartQuizButton({ quizId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        console.error("Start quiz failed:", res.status, data);
        alert(data?.error ?? `Start quiz failed (${res.status})`);
        return;
      }

      const attemptId = data?.attempt?.id as string | undefined;
      if (!attemptId) {
        console.error("Start quiz response missing attempt.id:", data);
        alert("Start quiz failed: missing attempt id");
        return;
      }

      // ✅ Always go to /attempt/<attemptId> (attemptId is never stale because it's newly created)
      router.push(`/attempt/${attemptId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={loading}
      className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Starting..." : "Start Quiz"}
    </button>
  );
}