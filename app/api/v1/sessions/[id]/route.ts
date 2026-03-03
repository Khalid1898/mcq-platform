import { getSession } from "@/lib/session-store";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = getSession(id?.trim() ?? "");

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const currentItem = session.items[session.currentIndex] ?? null;

  return Response.json({
    session: {
      id: session.id,
      createdAt: session.createdAt,
      selectedSkills: session.selectedSkills,
      items: session.items,
      currentIndex: session.currentIndex,
      xpEarned: session.xpEarned,
      completed: session.completed,
      answers: session.answers,
    },
    currentItem,
    progress: {
      current: session.currentIndex + (currentItem ? 0 : 1),
      total: session.items.length,
    },
    xp: session.xpEarned,
  });
}
