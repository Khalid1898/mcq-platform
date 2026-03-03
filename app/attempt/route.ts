import { getAttempt, setScore, submitAttempt } from "@/lib/attempts";
import { getQuizById } from "@/lib/quizzes";
import { getQuestionsByIds } from "@/lib/questions";

export async function POST(
  req: Request,
  _context: { params: Promise<Record<string, never>> }
) {
  const body = (await req.json().catch(() => ({}))) as { attemptId?: string };
  const id = (body?.attemptId ?? "").trim();
  if (!id) {
    return Response.json({ error: "attemptId is required" }, { status: 400 });
  }

  const attempt = await getAttempt(id);
  if (!attempt) {
    return Response.json({ error: "Attempt not found" }, { status: 404 });
  }

  // ✅ idempotent: if already submitted AND scored, return it
  if (attempt.submittedAt && typeof attempt.score === "number") {
    return Response.json(
      { attempt, meta: { alreadySubmitted: true } },
      { status: 200 }
    );
  }

  const quiz = await getQuizById(attempt.quizId);
  if (!quiz) {
    return Response.json(
      { error: "Quiz not found", quizId: attempt.quizId },
      { status: 404 }
    );
  }

  const questions = await getQuestionsByIds(quiz.questionIds);

  // answers are stored as [{ questionId, selectedIndex }]
  const answerMap = new Map<string, number>();
  for (const a of attempt.answers) answerMap.set(a.questionId, a.selectedIndex);

  let correct = 0;
  for (const q of questions) {
    const selected = answerMap.get(q.id);

    // ✅ your questions use correctIndex
    if (typeof selected === "number" && selected === (q as any).correctIndex) {
      correct++;
    }
  }

  const total = questions.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  // ✅ lock + persist score
  await submitAttempt(id);
  const updated = await setScore(id, score);

  return Response.json(
    { attempt: updated, meta: { correct, total, score } },
    { status: 200 }
  );
}