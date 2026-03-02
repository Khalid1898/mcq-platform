import { getActiveAttemptByQuizId } from "@/lib/attempts";

export async function GET(
  _req: Request,
  context: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await context.params;
  const id = (quizId ?? "").trim();

  if (!id) {
    return Response.json({ error: "quizId is required" }, { status: 400 });
  }

  const activeAttempt = await getActiveAttemptByQuizId(id);

  return Response.json({ activeAttempt }, { status: 200 });
}