"use client";

import { CheckCircle, XCircle } from "lucide-react";
import type { CoachTips as CoachTipsType } from "@/lib/session-types";
import { CoachTip } from "./CoachTip";
import { cn } from "@/lib/utils";

type Props = {
  correct: boolean;
  explanation: string;
  coachInsights: CoachTipsType | null;
  xpDelta: number;
  surpriseLine?: string | null;
  className?: string;
};

export function AnswerFeedback({
  correct,
  explanation,
  coachInsights,
  xpDelta,
  surpriseLine,
  className,
}: Props) {
  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border-2 p-4",
          correct
            ? "border-success/50 bg-success/10"
            : "border-warning/50 bg-warning/10"
        )}
      >
        {correct ? (
          <CheckCircle className="h-8 w-8 shrink-0 text-success" />
        ) : (
          <XCircle className="h-8 w-8 shrink-0 text-warning" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text">
            {correct ? "Correct." : "Not quite."}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">
            {explanation}
          </p>
          {xpDelta > 0 && (
            <p className="mt-2 text-sm font-medium text-primary">+{xpDelta} XP</p>
          )}
        </div>
      </div>
      {surpriseLine && (
        <p className="text-center text-sm italic text-muted">{surpriseLine}</p>
      )}
      {coachInsights && <CoachTip tips={coachInsights} />}
    </div>
  );
}
