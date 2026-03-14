// lib/attempts.ts
// ✅ In-memory attempts store (MVP)
// ✅ Safe backend boundary: API routes call this, UI never touches it directly.

export type AttemptAnswer = { questionId: string; selectedIndex: number };

export type Attempt = {
  id: string;
  quizId: string;
  answers: AttemptAnswer[];
  submittedAt: string | null;
  score: number | null;
  createdAt: string;
};

const attempts: Map<string, Attempt> =
  (globalThis as any).__mcq_attempts ??
  ((globalThis as any).__mcq_attempts = new Map<string, Attempt>());

export async function createAttempt(quizId: string): Promise<Attempt> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const attempt: Attempt = {
    id,
    quizId,
    answers: [],
    submittedAt: null,
    score: null,
    createdAt: new Date().toISOString(),
  };

  attempts.set(id, attempt);
  return attempt;
}

export async function getAttempt(attemptId: string): Promise<Attempt | null> {
  return attempts.get(attemptId) ?? null;
}

// ✅ NEW: get latest active (unsubmitted) attempt for a quiz
export async function getActiveAttemptByQuizId(
  quizId: string
): Promise<Attempt | null> {
  const candidates = Array.from(attempts.values()).filter(
    (a) => a.quizId === quizId && !a.submittedAt
  );

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return candidates[0] ?? null;
}

// ✅ Save/update an answer (idempotent per questionId)
// ✅ Block changes after submit
export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedIndex: number
): Promise<Attempt | null> {
  const attempt = attempts.get(attemptId);
  if (!attempt) return null;

  // ✅ Once submitted, answers are locked
  if (attempt.submittedAt) return attempt;

  const answers = [...attempt.answers];
  const existingIndex = answers.findIndex((a) => a.questionId === questionId);

  if (existingIndex >= 0) {
    answers[existingIndex] = { questionId, selectedIndex };
  } else {
    answers.push({ questionId, selectedIndex });
  }

  const updated: Attempt = { ...attempt, answers };
  attempts.set(attemptId, updated);
  return updated;
}

// ✅ Marks attempt submitted (lock)
// ✅ Does NOT compute score here (your /submit route should compute score once)
export async function submitAttempt(attemptId: string): Promise<Attempt | null> {
  const attempt = attempts.get(attemptId);
  if (!attempt) return null;

  // ✅ idempotent: if already submitted, keep it
  if (attempt.submittedAt) return attempt;

  const updated: Attempt = { ...attempt, submittedAt: new Date().toISOString() };
  attempts.set(attemptId, updated);
  return updated;
}

// ✅ Persist computed score
// ✅ Safe to call after submitAttempt() (or before, but normally after)
export async function setScore(
  attemptId: string,
  score: number
): Promise<Attempt | null> {
  const attempt = attempts.get(attemptId);
  if (!attempt) return null;

  const normalizedScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : 0;

  const updated: Attempt = { ...attempt, score: normalizedScore };
  attempts.set(attemptId, updated);
  return updated;
}
