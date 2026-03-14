"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ModuleNotReadyPage() {
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get("module"); // "listening" | "speaking" or null
  const label =
    moduleParam === "listening"
      ? "Listening"
      : moduleParam === "speaking"
        ? "Speaking"
        : "This module";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
        <Construction className="h-8 w-8 text-muted" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-text">
          {label} is not ready yet
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          We&apos;re still building this part of the practice. Try Reading or
          Writing to train today.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
