import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth/tokens";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const tokenResult = await createPasswordResetToken(user.id);
    if (tokenResult.ok) {
      const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${encodeURIComponent(
        tokenResult.data.token
      )}&user=${encodeURIComponent(user.id)}`;
      console.log("[auth] Password reset link:", resetUrl);
    }
  }

  return NextResponse.json(
    {
      message:
        "If an account exists for that email, a password reset link has been sent.",
    },
    { status: 200 }
  );
}

