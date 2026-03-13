import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import type { SessionUser } from "./types";

const SESSION_COOKIE = "mcq_session";
const SESSION_ID_BYTES = 32;

const AUTH_SECRET = process.env.AUTH_SECRET;

function sign(value: string): string {
  if (!AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not set");
  }
  const h = Buffer.from(
    require("crypto")
      .createHmac("sha256", AUTH_SECRET)
      .update(value)
      .digest("hex"),
    "utf8"
  );
  const v = Buffer.from(value, "utf8");
  return `${value}.${h.toString("hex")}`;
}

function unsign(signed: string): string | null {
  if (!AUTH_SECRET) return null;
  const [value, sig] = signed.split(".");
  if (!value || !sig) return null;
  const expected = require("crypto")
    .createHmac("sha256", AUTH_SECRET)
    .update(value)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(sig, "utf8");
  if (
    expectedBuf.length !== actualBuf.length ||
    !timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return null;
  }
  return value;
}

export async function createSession(
  user: SessionUser,
  opts?: { rememberMe?: boolean; ip?: string; userAgent?: string }
) {
  const sessionId = randomBytes(SESSION_ID_BYTES).toString("hex");
  const now = new Date();
  const maxAgeDays = opts?.rememberMe ? 30 : 1;
  const expiresAt = new Date(now.getTime() + maxAgeDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      expiresAt,
      ip: opts?.ip,
      userAgent: opts?.userAgent,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sign(sessionId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeDays * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return;
  const sessionId = unsign(raw);
  cookieStore.delete(SESSION_COOKIE);
  if (!sessionId) return;
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const sessionId = unsign(raw);
  if (!sessionId) return null;

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      expiresAt: { gt: new Date() },
      user: {
        status: { not: "SUSPENDED" },
      },
    },
    include: {
      user: true,
    },
  });
  if (!session) return null;

  return {
    id: session.user.id,
    role: session.user.role,
    status: session.user.status,
  };
}

