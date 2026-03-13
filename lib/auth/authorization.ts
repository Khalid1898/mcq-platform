import { UserRole, UserStatus } from "@prisma/client";
import type { SessionUser } from "./types";

export function requireAuthenticated(user: SessionUser | null) {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  if (user.status === UserStatus.SUSPENDED) {
    throw new Error("ACCOUNT_SUSPENDED");
  }
}

export function assertAdmin(user: SessionUser | null) {
  requireAuthenticated(user);
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error("FORBIDDEN");
  }
}

export function assertSuperAdmin(user: SessionUser | null) {
  requireAuthenticated(user);
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error("FORBIDDEN");
  }
}

