import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { assertAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db";

export async function GET() {
  const sessionUser = await getSessionUser();
  try {
    assertAdmin(sessionUser);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users }, { status: 200 });
}

