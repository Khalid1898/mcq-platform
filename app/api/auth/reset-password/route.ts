import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { consumePasswordResetToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/hash";

const schema = z.object({
  userId: z.string().min(1),
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const tokenResult = await consumePasswordResetToken({
    userId: parsed.data.userId,
    token: parsed.data.token,
  });

  if (!tokenResult.ok) {
    return NextResponse.json({ error: tokenResult.error }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

