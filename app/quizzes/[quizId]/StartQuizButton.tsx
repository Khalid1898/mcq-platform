"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

      const data = await res.json().catch(() => ({} as Record<string, unknown>));

      if (!res.ok) {
        console.error("Start quiz failed:", res.status, data);
        alert((data as { error?: string })?.error ?? `Start quiz failed (${res.status})`);
        return;
      }

      const attemptId = (data as { attempt?: { id?: string } })?.attempt?.id;
      if (!attemptId) {
        console.error("Start quiz response missing attempt.id:", data);
        alert("Start quiz failed: missing attempt id");
        return;
      }

      router.push(`/attempt/${attemptId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleStart}
      disabled={loading}
      size="lg"
    >
      {loading ? "Starting…" : "Start quiz"}
    </Button>
  );
}
