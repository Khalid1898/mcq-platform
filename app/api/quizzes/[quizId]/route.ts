import { getQuizById } from "@/lib/quizzes";

export async function GET(
  _req: Request,
  context: { params: Promise<{ quizId: string }> } // ✅ params is a Promise in Next 16
) {
  const { quizId: raw } = await context.params; // ✅ unwrap it

  const quizId = (raw ?? "").trim();

  // ✅ DEBUG
  console.log("API quizId raw:", JSON.stringify(raw));
  console.log("API quizId trimmed:", JSON.stringify(quizId));

  const quiz = await getQuizById(quizId);

  if (!quiz) {
    return new Response(
      JSON.stringify({ error: "Quiz not found", debug: { raw, trimmed: quizId } }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return Response.json({ quiz });
}