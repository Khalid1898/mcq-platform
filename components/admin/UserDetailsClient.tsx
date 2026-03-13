"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminUser = Pick<
  User,
  | "id"
  | "email"
  | "name"
  | "role"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "emailVerifiedAt"
  | "lastLoginAt"
>;

export default function UserDetailsClient({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const runAction = async (action: string) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to perform this action.");
        return;
      }
      setMessage("User updated.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const canSuspend = user.status !== "SUSPENDED";
  const canActivate = user.status !== "ACTIVE";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">User details</h2>
          <p className="text-sm text-muted">
            Inspect and manage an individual account.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-xs font-medium text-primary hover:underline"
        >
          Back to users
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user.email}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Name
              </p>
              <p className="text-sm text-text">{user.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Role
              </p>
              <p className="mt-1">
                <Badge variant="outline">{user.role}</Badge>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Status
              </p>
              <p className="mt-1">
                <Badge
                  variant={
                    user.status === "ACTIVE"
                      ? "success"
                      : user.status === "SUSPENDED"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {user.status}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Email verification
              </p>
              <p className="mt-1 text-sm text-text">
                {user.emailVerifiedAt
                  ? `Verified on ${new Date(
                      user.emailVerifiedAt
                    ).toLocaleString()}`
                  : "Not verified"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Created
              </p>
              <p className="text-sm text-text">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Last login
              </p>
              <p className="text-sm text-text">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">
              Admin actions
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={canSuspend ? "outline" : "ghost"}
                disabled={busy || !canSuspend}
                onClick={() => runAction("suspend")}
              >
                Suspend
              </Button>
              <Button
                type="button"
                size="sm"
                variant={canActivate ? "outline" : "ghost"}
                disabled={busy || !canActivate}
                onClick={() => runAction("activate")}
              >
                Activate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => runAction("verify_email")}
              >
                Mark email verified
              </Button>
            </div>
            <p className="text-xs text-muted">
              Role changes and super-admin operations are restricted to
              super-admins and are fully audited.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {message && (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

