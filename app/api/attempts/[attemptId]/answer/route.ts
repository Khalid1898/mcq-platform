import { saveAnswer } from "@/lib/attempts";

export async function POST(req: Request, ctx: { params: { attemptId: string } }) {
  const body = (await req.json().catch(() => null)) as
    | { questionId?: string; selectedIndex?: number }
    | null;

  if (!body?.questionId || typeof body.selectedIndex !== "number") {
    return Response.json({ error: "questionId and selectedIndex are required" }, { status: 400 });
  }

  try {
    const attempt = await saveAnswer(ctx.params.attemptId, body.questionId, body.selectedIndex);
    return Response.json({ attempt });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}