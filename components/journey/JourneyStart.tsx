"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SkillTiles } from "./SkillTiles";
import { setJourneySkills } from "@/lib/journey-storage";
import type { SkillId } from "@/lib/session-types";

const READY_SKILLS: SkillId[] = ["reading", "writing"];
const NOT_READY_SKILLS: SkillId[] = ["listening", "speaking"];

function onlyNotReady(skills: SkillId[]): boolean {
  return (
    skills.length > 0 &&
    skills.every((s) => NOT_READY_SKILLS.includes(s))
  );
}

function hasReady(skills: SkillId[]): boolean {
  return skills.some((s) => READY_SKILLS.includes(s));
}

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
    // Listening or speaking only → module not ready
    if (onlyNotReady(selected)) {
      const single = selected.length === 1 ? selected[0] : null;
      const q = single ? `?module=${single}` : "";
      router.push(`/practice/not-ready${q}`);
      return;
    }
    // At least one of reading/writing → start training (reading first, then writing)
    if (hasReady(selected)) {
      setJourneySkills(selected);
      if (selected.includes("reading")) {
        router.push("/practice/theater");
        return;
      }
      if (selected.includes("writing")) {
        router.push("/practice/writing/intro");
        return;
      }
    }
    router.push("/");
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

