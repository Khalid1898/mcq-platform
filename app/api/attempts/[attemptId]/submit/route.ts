import { getAttempt, setScore, submitAttempt } from "@/lib/attempts";
import { getQuizById } from "@/lib/quizzes";
import { getQuestionsByIds } from "@/lib/questions";

export async function POST(
  _req: Request,
  context: { params: Promise<{ attemptId: string }> } // ✅ Next 16 async params
) {
  const { attemptId } = await context.params;
  const id = (attemptId ?? "").trim();

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

  const answerMap = new Map<string, number>();
  for (const a of attempt.answers) answerMap.set(a.questionId, a.selectedIndex);

  // ✅ Enforce: must answer ALL quiz questions before submit (canonical list = quiz.questionIds)
  const unansweredQuestionIds = quiz.questionIds.filter(
    (qid) => !answerMap.has(qid)
  );

  if (unansweredQuestionIds.length > 0) {
    return Response.json(
      {
        error: "INCOMPLETE_ATTEMPT",
        missingQuestionIds: unansweredQuestionIds,
        attempt,
      },
      { status: 400 }
    );
  }

  let correct = 0;
  for (const q of questions) {
    const selected = answerMap.get(q.id);
    if (typeof selected === "number" && selected === (q as any).correctIndex) {
      correct++;
    }
  }

  const total = questions.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  await submitAttempt(id);
  const updated = await setScore(id, score);

  return Response.json(
    { attempt: updated, meta: { correct, total, score } },
    { status: 200 }
  );
}