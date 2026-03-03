"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SkillTiles } from "./SkillTiles";
import type { SkillId } from "@/lib/session-types";

export function JourneyStart() {
  const router = useRouter();
  const [selected, setSelected] = useState<SkillId[]>([]);

  const toggle = (skill: SkillId) => {
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleStart = () => {
    if (!selected.length) return;
    // For now, default reading journey goes straight to theater mode.
    router.push("/reading/theater");
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          What are you training today?
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Choose one or more skills. We&apos;ll build a short, focused session
          for you.
        </p>
      </div>

      <SkillTiles selected={selected} onToggle={toggle} />

      <div className="flex flex-col items-center gap-2">
        <Button
          size="lg"
          onClick={handleStart}
          disabled={selected.length === 0}
        >
          Start my journey
        </Button>
        <p className="text-xs text-muted">
          1–3 questions · one at a time · with coach tips.
        </p>
      </div>
    </div>
  );
}

