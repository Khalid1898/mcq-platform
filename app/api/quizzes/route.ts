import { getQuizzes } from "@/lib/quizzes";

export async function GET() {
  const quizzes = await getQuizzes();
  return Response.json({ quizzes });
}
