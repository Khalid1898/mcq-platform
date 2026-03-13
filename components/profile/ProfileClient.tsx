"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { User } from "@prisma/client";

type ProfileUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "status" | "createdAt" | "updatedAt" | "emailVerifiedAt"
>;

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to update profile.");
        return;
      }
      setMessage("Profile updated.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordMessage(null);
    setPasswordError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(
          data.error || "We could not change your password with those details."
        );
        return;
      }
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const sendVerification = async () => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to send verification email.");
        return;
      }
      setMessage(
        "If your email is unverified, a verification link has been sent."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={updateProfile}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <p className="text-xs text-muted">
              Role: <span className="font-medium">{user.role}</span> · Status:{" "}
              <span className="font-medium">{user.status}</span>
            </p>
            {user.emailVerifiedAt ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Email verified on {new Date(user.emailVerifiedAt).toLocaleString()}
              </p>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <p className="text-amber-700 dark:text-amber-300">
                  Email not verified yet.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={sendVerification}
                >
                  Resend link
                </Button>
              </div>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {message && (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {message}
              </p>
            )}
            <Button
              type="submit"
              className="mt-1"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={changePassword}>
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {passwordError}
              </p>
            )}
            {passwordMessage && (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {passwordMessage}
              </p>
            )}
            <Button
              type="submit"
              disabled={changingPassword}
            >
              {changingPassword ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

