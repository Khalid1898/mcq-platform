import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "./hash";
import type { AuthResult } from "./types";

const RESET_TOKEN_BYTES = 32;
const VERIFY_TOKEN_BYTES = 32;

export async function createPasswordResetToken(
  userId: string
): Promise<AuthResult<{ token: string }>> {
  const rawToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = await hashPassword(rawToken);

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { ok: true, data: { token: rawToken } };
}

export async function consumePasswordResetToken(options: {
  userId: string;
  token: string;
}): Promise<AuthResult<null>> {
  const tokens = await prisma.passwordResetToken.findMany({
    where: { userId: options.userId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const t of tokens) {
    const match = await verifyPassword(options.token, t.tokenHash);
    if (match) {
      await prisma.passwordResetToken.update({
        where: { id: t.id },
        data: { usedAt: new Date() },
      });
      return { ok: true, data: null };
    }
  }

  return { ok: false, error: "Invalid or expired reset token" };
}

export async function createEmailVerificationToken(
  userId: string
): Promise<AuthResult<{ token: string }>> {
  const rawToken = randomBytes(VERIFY_TOKEN_BYTES).toString("hex");
  const tokenHash = await hashPassword(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { ok: true, data: { token: rawToken } };
}

export async function consumeEmailVerificationToken(options: {
  userId: string;
  token: string;
}): Promise<AuthResult<null>> {
  const tokens = await prisma.emailVerificationToken.findMany({
    where: { userId: options.userId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const t of tokens) {
    const match = await verifyPassword(options.token, t.tokenHash);
    if (match) {
      await prisma.emailVerificationToken.update({
        where: { id: t.id },
        data: { usedAt: new Date() },
      });
      return { ok: true, data: null };
    }
  }

  return { ok: false, error: "Invalid or expired verification token" };
}

