"use client";

import Link from "next/link";
import { Flag, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIeltsState } from "@/lib/use-ielts-state";

export default function MissionPage() {
  const { state, band } = useIeltsState();

  const canStartWriting = state.unlockedTasks.includes("writingIntro");

  return (
    <div className="space-y-10 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Today&apos;s mission
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Follow the trail to complete your mixed reading and writing practice.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <Flag className="h-4 w-4 text-primary" />
              <span>Overview</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Complete two reading tasks, then unlock a Task 2 introduction.
            </CardDescription>
          </div>
          <div className="flex items-center gap-6 rounded-xl border border-border bg-surface-2 px-5 py-3">
            <div className="text-center sm:text-right">
              <div className="text-xs text-muted">Total XP</div>
              <div className="text-[15px] font-semibold text-text">
                {state.totalXP}
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center sm:text-right">
              <div className="text-xs text-muted">Band estimate</div>
              <div className="text-[15px] font-semibold text-text">
                {band.toFixed(1)}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-text">Tasks</h2>
        </div>
        <div className="space-y-3">
          <Card className="transition-transform hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-text">
                    True / False / Not Given
                  </span>
                  <Badge variant="outline">Reading</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Six statements based on a short passage.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">
                  {state.completedTasks.includes("tfng")
                    ? "Completed"
                    : "Not started"}
                </span>
                <Button asChild size="sm">
                  <Link href="/practice/reading/tfng">
                    {state.completedTasks.includes("tfng") ? "Review" : "Start"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-transform hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-text">
                    Fill in the Gaps
                  </span>
                  <Badge variant="outline">Reading</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Two short paragraphs with missing words and a word bank.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">
                  {state.completedTasks.includes("gapFill")
                    ? "Completed"
                    : "Not started"}
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
              canStartWriting ? "transition-transform hover:-translate-y-0.5 hover:shadow-md" : "border-dashed bg-surface-2"
            }
          >
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-text">
                    Writing Introduction — Task 2
                  </span>
                  <Badge variant="outline">Writing</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Write a short introduction for a tourism topic.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {canStartWriting ? (
                  <>
                    <span className="text-sm text-muted">
                      {state.completedTasks.includes("writingIntro")
                        ? "Completed"
                        : "Unlocked"}
                    </span>
                    <Button asChild size="sm">
                      <Link href="/practice/writing/intro">
                        {state.completedTasks.includes("writingIntro")
                          ? "Review"
                          : "Start"}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="outline">Locked</Badge>
                    <span className="text-sm text-muted">
                      Unlock after completing both reading tasks.
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted">
          Progress is stored locally in your browser.
        </span>
        <Link
          href="/"
          className="text-[15px] font-medium text-primary underline-offset-2 hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
