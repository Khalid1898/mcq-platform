import { getQuizById } from "@/lib/quizzes";

export async function GET(
  _req: Request,
  ctx: { params: { quizId: string } }
) {
  const quizId = ctx.params.quizId;
  const quiz = await getQuizById(quizId);

  if (!quiz) {
    return new Response(JSON.stringify({ error: "Quiz not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return Response.json({ quiz });
}
