import { getAttempt } from "@/lib/attempts";

export async function POST(
  _req: Request,
  context: { params: Promise<{ attemptId: string }> } // ✅ Next 16 async params
) {
  const { attemptId } = await context.params;
  const id = (attemptId ?? "").trim();

  const attempt = await getAttempt(id);
  if (!attempt) return Response.json({ error: "Attempt not found" }, { status: 404 });

  // ✅ Barebones “submit” response for now (until grading is implemented)
  return Response.json({
    ok: true,
    submittedAttemptId: id,
    attempt,
  });
}