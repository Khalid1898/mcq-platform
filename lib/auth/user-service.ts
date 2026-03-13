import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "./hash";
import type { AuthResult, SafeUser } from "./types";
import { UserRole, UserStatus } from "@prisma/client";

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResult<SafeUser>> {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Validation failed", fieldErrors: { email: "Email is required" } };
  }
  if (input.password.length < 8) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: { password: "Password must be at least 8 characters" },
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      error: "Email already in use",
      fieldErrors: { email: "This email is already registered" },
    };
  }

  const passwordHash = await hashPassword(input.password);

  const userCount = await prisma.user.count();
  const role = userCount === 0 ? UserRole.SUPER_ADMIN : UserRole.USER;
  const status =
    userCount === 0 ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim() || null,
      role,
      status,
    },
  });

  return {
    ok: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
    },
  };
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult<SafeUser>> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    return {
      ok: false,
      error: "Invalid credentials",
      fieldErrors: {
        email: !email ? "Email is required" : undefined,
        password: !input.password ? "Password is required" : undefined,
      },
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "Invalid email or password" };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid email or password" };
  }

  if (user.status === UserStatus.SUSPENDED) {
    return {
      ok: false,
      error: "Your account is suspended. Contact support.",
    };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    ok: true,
    data: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      emailVerifiedAt: updated.emailVerifiedAt,
      lastLoginAt: updated.lastLoginAt,
    },
  };
}

export async function changePassword(options: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult> {
  if (options.newPassword.length < 8) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: {
        newPassword: "Password must be at least 8 characters",
      },
    };
  }

  const user = await prisma.user.findUnique({ where: { id: options.userId } });
  if (!user) return { ok: false, error: "User not found" };

  const valid = await verifyPassword(
    options.currentPassword,
    user.passwordHash
  );
  if (!valid) {
    return {
      ok: false,
      error: "Current password is incorrect",
      fieldErrors: { currentPassword: "Current password is incorrect" },
    };
  }

  const passwordHash = await hashPassword(options.newPassword);
  await prisma.user.update({
    where: { id: options.userId },
    data: { passwordHash },
  });

  return { ok: true, data: null };
}

