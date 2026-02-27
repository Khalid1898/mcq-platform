"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartQuizButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      if (!res.ok) throw new Error("Failed to start attempt");
      const data = (await res.json()) as { attempt: { id: string } };
      router.push(`/attempt/${data.attempt.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Starting..." : "Start Quiz"}
    </button>
  );
}