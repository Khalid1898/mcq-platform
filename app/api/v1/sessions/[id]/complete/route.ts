import { getSession } from "@/lib/session-store";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = getSession(id?.trim() ?? "");

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const correctCount = session.answers.filter((a) => a.correct).length;
  const total = session.items.length;
  const summary = {
    xpEarned: session.xpEarned,
    correctCount,
    total,
    completed: session.completed,
    skillsTrained: session.selectedSkills,
  };

  const recommendations: string[] = [];
  const wrongBySkill = new Map<string, number>();
  for (let i = 0; i < session.answers.length; i++) {
    if (!session.answers[i].correct) {
      const skill = session.items[i]?.skill ?? "reading";
      wrongBySkill.set(skill, (wrongBySkill.get(skill) ?? 0) + 1);
    }
  }
  if (wrongBySkill.size > 0) {
    const top = [...wrongBySkill.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) recommendations.push(`Focus a bit more on ${top[0]} next time.`);
  }
  recommendations.push("Run another short session to keep the momentum.");

  return Response.json({
    summary,
    recommendations,
  });
}
