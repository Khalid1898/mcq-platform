import { createAttempt } from "@/lib/attempts";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { quizId?: string } | null;
  if (!body?.quizId) return Response.json({ error: "quizId is required" }, { status: 400 });

  try {
    const attempt = await createAttempt(body.quizId);
    return Response.json({ attempt });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}