import { getAttempt } from "@/lib/attempts";

export async function GET(_req: Request, ctx: { params: { attemptId: string } }) {
  const attempt = await getAttempt(ctx.params.attemptId);
  if (!attempt) return Response.json({ error: "Attempt not found" }, { status: 404 });
  return Response.json({ attempt });
}