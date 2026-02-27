import { getAttempt } from "@/lib/attempts"; // keep your existing import path if different

export async function GET(
  _req: Request,
  context: { params: Promise<{ attemptId: string }> } // ✅ params is Promise in Next 16
) {
  const { attemptId } = await context.params; // ✅ unwrap
  const id = (attemptId ?? "").trim();

  const attempt = await getAttempt(id);

  if (!attempt) {
    return Response.json({ error: "Attempt not found" }, { status: 404 });
  }

  return Response.json({ attempt });
}