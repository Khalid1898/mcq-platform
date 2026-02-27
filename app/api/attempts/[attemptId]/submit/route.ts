import { getQuestionsByIds } from "@/lib/questions";
import { getQuizById } from "@/lib/quizzes";
import { getAttempt, setScore, submitAttempt } from "@/lib/attempts";

export async function POST(_req: Request, ctx: { params: { attemptId: string } }) {
  const attempt = await getAttempt(ctx.params.attemptId);
  if (!attempt) return Response.json({ error: "Attempt not found" }, { status: 404 });

  try {
    const quiz = await getQuizById(attempt.quizId);
    if (!quiz) return Response.json({ error: "Quiz not found" }, { status: 404 });

    const questions = await getQuestionsByIds(quiz.questionIds);

    // score
    let score = 0;
    for (const q of questions) {
      const a = attempt.answers.find((x) => x.questionId === q.id);
      if (a && a.selectedIndex === q.correctIndex) score += 1;
    }

    await submitAttempt(attempt.id);
    const updated = await setScore(attempt.id, score);

    return Response.json({ attempt: updated, total: questions.length });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}