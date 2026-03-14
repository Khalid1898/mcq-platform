"use client";

import Link from "next/link";
import { Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIeltsState } from "@/lib/use-ielts-state";

export default function ResultPage() {
  const { state, band } = useIeltsState();

  const lastScore = state.lastScore;
  const lastXP = state.lastXP ?? 0;

  return (
    <div className="space-y-10 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Result</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Review your latest task, XP gain, and updated skill progress.
        </p>
      </div>

      <Card className="border-2 border-primary/20 bg-emerald-50/60 transition-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-col gap-4 border-none sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg text-text">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Great work, keep the streak going</span>
            </CardTitle>
            <CardDescription className="text-[15px] text-muted">
              Each completed task boosts your confidence for exam day.
            </CardDescription>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-right">
              <div className="inline-flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide text-muted">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>XP gained</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-primary">
                +{lastXP}
              </div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center sm:text-right">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Band estimate
              </div>
              <div className="mt-1 text-2xl font-semibold text-text">
                {band.toFixed(1)}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-[15px]">Summary</CardTitle>
            <CardDescription className="mt-1">
              These numbers are stored in your browser so you can continue
              practising later.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[15px]">
            <div>
              <div className="text-xs text-muted">Total XP</div>
              <div className="font-semibold text-text">{state.totalXP}</div>
            </div>
            <div>
              <div className="text-xs text-muted">XP gained</div>
              <div className="font-semibold text-text">{lastXP}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Band estimate</div>
              <div className="font-semibold text-text">{band.toFixed(1)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 border-t border-border py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-muted">Score</div>
            <div className="text-xl font-semibold text-text">
              {lastScore === null ? "N/A" : `${lastScore}%`}
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Skill progress</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SkillProgressRow
            label="Reading"
            value={state.skillProgress.reading || 0}
          />
          <SkillProgressRow
            label="Writing"
            value={state.skillProgress.writing || 0}
          />
          <SkillProgressRow
            label="Listening"
            value={state.skillProgress.listening || 0}
          />
          <SkillProgressRow
            label="Speaking"
            value={state.skillProgress.speaking || 0}
          />
        </div>
      </section>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted">
          Your XP and task history are saved in localStorage.
        </span>
        <Button asChild size="sm">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

function SkillProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="space-y-2 py-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>{label}</span>
          <span className="font-medium text-text">{value}%</span>
        </div>
        <Progress value={value} />
      </CardContent>
    </Card>
  );
}
