import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  consumeEmailVerificationToken,
  createEmailVerificationToken,
} from "@/lib/auth/tokens";
import { getSessionUser } from "@/lib/auth/session";

const requestSchema = z.object({
  email: z.string().email().optional(),
});

const verifySchema = z.object({
  userId: z.string().min(1),
  token: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (body && "token" in body) {
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await consumeEmailVerificationToken(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser && !parsed.data.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const user =
    (sessionUser &&
      (await prisma.user.findUnique({ where: { id: sessionUser.id } }))) ||
    (parsed.data.email &&
      (await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      })));

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const tokenResult = await createEmailVerificationToken(user.id);
  if (!tokenResult.ok) {
    return NextResponse.json(
      { error: tokenResult.error },
      { status: 500 }
    );
  }

  const verifyUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/verify-email?token=${encodeURIComponent(
    tokenResult.data.token
  )}&user=${encodeURIComponent(user.id)}`;
  console.log("[auth] Email verification link:", verifyUrl);

  return NextResponse.json(
    { message: "Verification email sent if the account exists." },
    { status: 200 }
  );
}

