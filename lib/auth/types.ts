import type { User, UserRole, UserStatus } from "@prisma/client";

export type SafeUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "status" | "createdAt" | "updatedAt" | "emailVerifiedAt" | "lastLoginAt"
>;

export type SessionUser = {
  id: string;
  role: UserRole;
  status: UserStatus;
};

export type AuthResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

