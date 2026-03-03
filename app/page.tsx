"use client";

import Link from "next/link";
import { Flame, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkillCard } from "@/components/dashboard/skill-card";
import { useIeltsState } from "@/lib/use-ielts-state";

export default function DashboardPage() {
  const { ready, state, band } = useIeltsState();

  const totalXP = state.totalXP;

  const missionDescription =
    "Complete a focused mix of reading True/False/Not Given, a gap-fill exercise, and one Task 2 introduction.";

  const avgSkill =
    (state.skillProgress.reading +
      state.skillProgress.writing +
      state.skillProgress.listening +
      state.skillProgress.speaking) /
    4;

  const levelProgress = Math.max(
    0,
    Math.min(100, Number.isFinite(avgSkill) ? avgSkill : 0)
  );

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            IELTS Practice Dashboard
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
            Track your band progress and complete today&apos;s mission.
          </p>
        </div>
        <div className="flex items-center gap-6 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-right">
            <Zap className="hidden h-5 w-5 text-primary sm:inline" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Total XP
              </div>
              <div className="text-xl font-semibold text-text">
                {ready ? totalXP : "–"}
              </div>
            </div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="flex items-center gap-3 text-center sm:text-right">
            <Target className="hidden h-5 w-5 text-primary sm:inline" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Band estimate
              </div>
              <div className="text-xl font-semibold text-text">
                {ready ? band.toFixed(1) : "–"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border border-border bg-surface shadow-sm">
        <CardContent className="space-y-2 py-4">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-primary" />
              <span>Level progress</span>
            </span>
            <span className="text-[11px] text-text">
              {Math.round(levelProgress)}%
            </span>
          </div>
          <Progress value={levelProgress} />
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-emerald-50/50 transition-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-col gap-4 border-none sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge variant="default">Training journey</Badge>
            <CardTitle className="text-lg text-text">
              What are you training today?
            </CardTitle>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted">
              Pick your skills and complete a short adaptive session—one question at a time, with coach tips and XP.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <Button asChild size="lg">
              <Link href="/journey">Start my journey</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Your skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SkillCard
            title="Reading"
            subtitle="Para comprehension · T/F/NG · Matching"
            levelLabel={`Level ${Math.max(1, Math.round((state.skillProgress.reading || 0) / 10))}`}
            progress={state.skillProgress.reading || 0}
            highlight
          />
          <SkillCard
            title="Writing"
            subtitle="Intros · Coherence · Lexis"
            levelLabel={`Level ${Math.max(1, Math.round((state.skillProgress.writing || 0) / 10))}`}
            progress={state.skillProgress.writing || 0}
          />
          <SkillCard
            title="Listening"
            subtitle="Gap fills · MCQs · Diagrams"
            levelLabel={`Level ${Math.max(1, Math.round((state.skillProgress.listening || 0) / 10))}`}
            progress={state.skillProgress.listening || 0}
          />
          <SkillCard
            title="Speaking"
            subtitle="Cue cards · Discussion"
            levelLabel={`Level ${Math.max(1, Math.round((state.skillProgress.speaking || 0) / 10))}`}
            progress={state.skillProgress.speaking || 0}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-text">Today&apos;s trail</h2>
          <span className="text-sm text-muted">
            Tasks unlock as you complete reading.
          </span>
        </div>
        <div className="space-y-3">
          <Card>
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[15px] font-semibold text-text">
                  Reading Passage — Climate Change
                </div>
                <div className="mt-1 text-sm text-muted">
                  True / False / Not Given · 6 questions
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">
                  {state.completedTasks.includes("tfng") ? "Completed" : "Not started"}
                </span>
                <Button asChild size="sm">
                  <Link href="/practice/reading/tfng">
                    {state.completedTasks.includes("tfng") ? "Review" : "Start"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[15px] font-semibold text-text">
                  Fill in the Gaps — Urban Growth
                </div>
                <div className="mt-1 text-sm text-muted">
                  2 paragraphs · Word bank provided
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">
                  {state.completedTasks.includes("gapFill") ? "Completed" : "Not started"}
                </span>
                <Button asChild size="sm">
                  <Link href="/practice/reading/gap-fill">
                    {state.completedTasks.includes("gapFill") ? "Review" : "Start"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              state.unlockedTasks.includes("writingIntro")
                ? ""
                : "border-dashed bg-surface-2"
            }
          >
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[15px] font-semibold text-text">
                  Writing Introduction — Tourism
                </div>
                <div className="mt-1 text-sm text-muted">
                  Task 2 · Hook + thesis + outline
                </div>
              </div>
              <div className="flex items-center gap-4">
                {state.unlockedTasks.includes("writingIntro") ? (
                  <>
                    <span className="text-sm text-muted">
                      {state.completedTasks.includes("writingIntro")
                        ? "Completed"
                        : "Unlocked"}
                    </span>
                    <Button asChild size="sm">
                      <Link href="/practice/writing/intro">
                        {state.completedTasks.includes("writingIntro") ? "Review" : "Start"}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="outline">Locked</Badge>
                    <span className="text-sm text-muted">
                      Complete both reading tasks to unlock.
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
