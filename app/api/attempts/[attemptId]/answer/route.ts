import { getAttempt, saveAnswer } from "@/lib/attempts";

export async function POST(
  req: Request,
  context: { params: Promise<{ attemptId: string }> } // ✅ Next 16 async params
) {
  const { attemptId } = await context.params;
  const id = (attemptId ?? "").trim();

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const questionId = (body.questionId ?? "").trim();
  const selectedIndex = body.selectedIndex;

  if (!id) return Response.json({ error: "attemptId is required" }, { status: 400 });
  if (!questionId) return Response.json({ error: "questionId is required" }, { status: 400 });
  if (typeof selectedIndex !== "number") {
    return Response.json({ error: "selectedIndex must be a number" }, { status: 400 });
  }

  const existing = await getAttempt(id);
  if (!existing) {
    return Response.json({ error: "Attempt not found" }, { status: 404 });
  }

  // ✅ Clear behavior after submit: block changes with 409 but return current attempt
  if (existing.submittedAt) {
    return Response.json(
      { error: "Attempt already submitted", attempt: existing },
      { status: 409 }
    );
  }

  const updated = await saveAnswer(id, questionId, selectedIndex);
  if (!updated) {
    return Response.json({ error: "Attempt not found" }, { status: 404 });
  }

  return Response.json({ attempt: updated }, { status: 200 });
}