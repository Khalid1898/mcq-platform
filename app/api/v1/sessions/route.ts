import { createSession } from "@/lib/session-store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { selectedSkills?: string[]; preferences?: Record<string, unknown> } | null;
  const selectedSkills = Array.isArray(body?.selectedSkills) ? body.selectedSkills : [];

  const session = createSession(selectedSkills);
  const firstItem = session.items[0] ?? null;
  const totalItems = session.items.length;

  return Response.json({
    sessionId: session.id,
    firstItem,
    totalItems,
    sessionMeta: {
      createdAt: session.createdAt,
      selectedSkills: session.selectedSkills,
    },
  });
}
