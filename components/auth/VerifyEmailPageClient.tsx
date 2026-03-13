"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const userId = searchParams.get("user");

  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">(
    token && userId ? "verifying" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !userId) return;
    const run = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Unable to verify email.");
          return;
        }
        setStatus("verified");
        setMessage("Your email has been verified.");
      } catch {
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
      }
    };
    void run();
  }, [token, userId]);

  const showAction = status === "verified" || status === "error";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" && (
          <p className="text-sm text-muted">
            We have sent you a verification link. Please open it from your
            email. If you arrived here without a link, request a new
            verification email from your profile.
          </p>
        )}
        {status === "verifying" && (
          <p className="text-sm text-muted">
            Verifying your email, please wait...
          </p>
        )}
        {status === "verified" && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {message ?? "We could not verify your email."}
          </p>
        )}
        {showAction && (
          <Button
            type="button"
            onClick={() => router.push("/dashboard")}
          >
            Continue to dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

