import { getSession, submitAnswer } from "@/lib/session-store";
import type { AnswerPayload } from "@/lib/session-types";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await context.params;
  const sid = sessionId?.trim() ?? "";
  if (!sid) return Response.json({ error: "Session id required" }, { status: 400 });

  let body: { itemId?: string; answer?: AnswerPayload } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const itemId = (body.itemId ?? "").trim();
  const answer = body.answer;
  if (!itemId || !answer) {
    return Response.json({ error: "itemId and answer are required" }, { status: 400 });
  }

  const session = getSession(sid);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  const payload =
    answer.type === "single_choice"
      ? { type: "single_choice", selectedIndex: (answer as { selectedIndex: number }).selectedIndex }
      : answer.type === "true_false_ng"
        ? { type: "true_false_ng", answers: (answer as { answers: Record<string, "true" | "false" | "not_given"> }).answers }
        : answer.type === "gap_fill"
          ? { type: "gap_fill", answers: (answer as { answers: Record<string, string> }).answers }
          : { type: "short_answer", text: (answer as { text: string }).text };

  const result = submitAnswer(sid, itemId, payload);
  if (!result) {
    return Response.json({ error: "Invalid item or session state" }, { status: 400 });
  }

  const sessionAfter = getSession(sid)!;
  const nextItem = result.nextItem;
  const itemJustAnswered = sessionAfter.items.find((i) => i.id === itemId);

  return Response.json({
    correctness: result.correct ? "correct" : "incorrect",
    correct: result.correct,
    coachInsights: itemJustAnswered?.coachTips ?? null,
    xpDelta: result.xpDelta,
    nextItem: result.sessionComplete ? null : nextItem,
    sessionComplete: result.sessionComplete,
    xpEarned: sessionAfter.xpEarned,
  });
}
