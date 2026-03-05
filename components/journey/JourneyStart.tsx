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
          Train your mind for IELTS
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Walk into the exam like you wrote the question paper.
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
      </div>
    </div>
  );
}

