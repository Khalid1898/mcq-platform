"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgressHeader } from "@/components/session/ProgressHeader";
import { QuestionCard } from "@/components/session/QuestionCard";
import { AnswerFeedback } from "@/components/session/AnswerFeedback";
import type { SessionItem } from "@/lib/session-types";

type SessionState = {
  currentItem: SessionItem | null;
  progress: { current: number; total: number };
  xp: number;
};

type FeedbackState = {
  correct: boolean;
  explanation: string;
  coachInsights: { validates: string; trap: string; mentalModel: string } | null;
  xpDelta: number;
  surpriseLine: string | null;
};

const SURPRISE_LINES: string[] = [
  "Nice—your inference skill is improving.",
  "This question tests paraphrase detection.",
  "You're building the right habit here.",
];

export default function SessionPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [session, setSession] = useState<SessionState | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/v1/sessions/${id}`);
    if (!res.ok) {
      setSession(null);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSession({
      currentItem: data.currentItem,
      progress: data.progress,
      xp: data.xp,
    });
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleSubmit = async (answer: unknown) => {
    if (!session?.currentItem || !id) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/sessions/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: session.currentItem.id, answer }),
      });
      if (!res.ok) throw new Error("Submit failed");
      const data = await res.json();
      const item = session.currentItem;
      setFeedback({
        correct: data.correct,
        explanation: item.explanation,
        coachInsights: data.coachInsights,
        xpDelta: data.xpDelta ?? 0,
        surpriseLine: data.correct && Math.random() < 0.4 ? SURPRISE_LINES[Math.floor(Math.random() * SURPRISE_LINES.length)] : null,
      });
      if (data.sessionComplete) {
        setSessionComplete(true);
        setSubmitting(false);
        setTimeout(() => router.push(`/session/${id}/result`), 2500);
        return;
      }
      if (data.nextItem) {
        setSession((prev) =>
          prev
            ? {
                currentItem: data.nextItem,
                progress: { current: prev.progress.current + 1, total: prev.progress.total },
                xp: data.xpEarned ?? prev.xp,
              }
            : null
        );
      } else {
        await fetchSession();
      }
    } catch {
      setSubmitting(false);
    }
    setSubmitting(false);
  };

  const showNext = () => setFeedback(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center text-muted">
        Loading your session…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="text-muted">Session not found.</p>
        <a href="/journey" className="mt-4 inline-block text-primary hover:underline">
          Start a new journey
        </a>
      </div>
    );
  }

  const { currentItem, progress } = session;

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <ProgressHeader current={progress.current} total={progress.total} />
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {feedback ? (
          <>
            <AnswerFeedback
              correct={feedback.correct}
              explanation={feedback.explanation}
              coachInsights={feedback.coachInsights}
              xpDelta={feedback.xpDelta}
              surpriseLine={feedback.surpriseLine}
            />
            {!sessionComplete && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={showNext}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Next question →
                </button>
              </div>
            )}
            {sessionComplete && (
              <p className="mt-4 text-sm text-muted">Taking you to your results…</p>
            )}
          </>
        ) : currentItem ? (
          <QuestionCard
            item={currentItem}
            onSubmit={handleSubmit}
            disabled={submitting}
          />
        ) : (
          <p className="text-muted">Session complete. Redirecting…</p>
        )}
      </div>
    </div>
  );
}
