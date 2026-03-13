import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/auth/user-service";
import { createSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const result = await authenticateUser(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await createSession(
    {
      id: result.data.id,
      role: result.data.role,
      status: result.data.status,
    },
    {
      rememberMe: parsed.data.rememberMe,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    }
  );

  return NextResponse.json(
    {
      user: {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        role: result.data.role,
        status: result.data.status,
        createdAt: result.data.createdAt,
        lastLoginAt: result.data.lastLoginAt,
      },
    },
    { status: 200 }
  );
}

