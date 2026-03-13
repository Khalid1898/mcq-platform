import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { assertAdmin, assertSuperAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db";

const schema = z.object({
  action: z.enum([
    "suspend",
    "activate",
    "verify_email",
    "promote_admin",
    "demote_admin",
  ]),
});

type Params = {
  id: string;
};

export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  const sessionUser = await getSessionUser();
  try {
    assertAdmin(sessionUser);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.id === sessionUser?.id) {
    return NextResponse.json(
      { error: "You cannot modify your own admin status." },
      { status: 400 }
    );
  }

  const isSuperAdmin = sessionUser?.role === "SUPER_ADMIN";

  if (
    (parsed.data.action === "promote_admin" ||
      parsed.data.action === "demote_admin") &&
    !isSuperAdmin
  ) {
    try {
      assertSuperAdmin(sessionUser);
    } catch {
      return NextResponse.json(
        { error: "Only super admins can change roles." },
        { status: 403 }
      );
    }
  }

  let updated;

  if (parsed.data.action === "suspend") {
    updated = await prisma.user.update({
      where: { id: target.id },
      data: { status: "SUSPENDED" },
    });
  } else if (parsed.data.action === "activate") {
    updated = await prisma.user.update({
      where: { id: target.id },
      data: { status: "ACTIVE" },
    });
  } else if (parsed.data.action === "verify_email") {
    updated = await prisma.user.update({
      where: { id: target.id },
      data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
    });
  } else if (parsed.data.action === "promote_admin") {
    updated = await prisma.user.update({
      where: { id: target.id },
      data: { role: "ADMIN" },
    });
  } else if (parsed.data.action === "demote_admin") {
    updated = await prisma.user.update({
      where: { id: target.id },
      data: { role: "USER" },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: sessionUser?.id,
      targetUserId: target.id,
      action: parsed.data.action,
      metadata: {},
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    },
  });

  return NextResponse.json(
    {
      user: {
        id: updated?.id,
        email: updated?.email,
        name: updated?.name,
        role: updated?.role,
        status: updated?.status,
      },
    },
    { status: 200 }
  );
}

