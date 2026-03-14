"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clearJourneySkills, getJourneySkills } from "@/lib/journey-storage";
import { useIeltsState } from "@/lib/use-ielts-state";
import { DUMMY_TASK2_PROMPTS, WritingPrompt } from "@/modules/writing/prompts";
import { Task2IntroStudio } from "@/modules/writing/Task2IntroStudio";

export default function WritingIntroPage() {
  const router = useRouter();
  const { completeTask } = useIeltsState();

  const [showPrevious, setShowPrevious] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(
    DUMMY_TASK2_PROMPTS[0]?.id ?? "task2-001"
  );
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const journey = getJourneySkills();
    setShowPrevious(journey?.includes("reading") ?? false);
  }, []);

  const selectedPrompt: WritingPrompt =
    DUMMY_TASK2_PROMPTS.find((p) => p.id === selectedPromptId) ??
    DUMMY_TASK2_PROMPTS[0];

  const handleIntroComplete = () => {
    setHasCompletedIntro(true);
  };

  const handleFinishSession = () => {
    if (submitting) return;
    setSubmitting(true);

    completeTask({
      taskId: "writingIntro",
      score: null,
      maxScore: null,
      baseXP: 50,
      skillGains: {
        writing: 10,
      },
    });

    clearJourneySkills();
    router.push("/result");
  };

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Writing Task 2: Introduction studio
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Move through the steps to think, plan, and then write a clear Task 2 introduction.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-[15px]">Choose a practice prompt</CardTitle>
            <CardDescription className="mt-1 text-[13px] text-muted">
              These prompts are temporary and for development/testing only.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3">
            <label className="text-xs text-muted" htmlFor="prompt-select">
              Prompt
            </label>
            <select
              id="prompt-select"
              value={selectedPromptId}
              onChange={(e) => setSelectedPromptId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary sm:w-72"
            >
              {DUMMY_TASK2_PROMPTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="border-t border-border/60 bg-surface-2/60 text-xs text-muted">
          <p>
            In the future, prompts will be loaded from the writing database. The interaction
            flow on this page is designed to be reusable for other IELTS writing tasks.
          </p>
        </CardContent>
      </Card>

      <Task2IntroStudio
        prompt={selectedPrompt}
        onIntroComplete={() => handleIntroComplete()}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div>
          {showPrevious && (
            <Button variant="outline" size="lg" asChild>
              <Link href="/practice/theater" className="inline-flex items-center gap-1.5">
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </Link>
            </Button>
          )}
        </div>
        <Button
          size="lg"
          onClick={handleFinishSession}
          disabled={submitting || !hasCompletedIntro}
        >
          {hasCompletedIntro ? "Finish session and view result" : "Write an intro to finish"}
        </Button>
      </div>
    </div>
  );
}


