"use client";

import { useState } from "react";
import type { SessionItem } from "@/lib/session-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  item: SessionItem;
  onSubmit: (payload: unknown) => void;
  disabled?: boolean;
};

export function QuestionCard({ item, onSubmit, disabled }: Props) {
  const [singleChoice, setSingleChoice] = useState<number | null>(null);
  const [tfng, setTfng] = useState<Record<string, "true" | "false" | "not_given">>({});
  const [gapFill, setGapFill] = useState<Record<string, string>>({});
  const [shortAnswer, setShortAnswer] = useState("");

  const canSubmit =
    item.type === "single_choice"
      ? singleChoice !== null
      : item.type === "true_false_ng"
        ? item.statements?.every((s) => tfng[s.id] != null)
        : item.type === "gap_fill"
          ? item.blanks?.every((b) => (gapFill[b.id] ?? "").trim() !== "")
          : (shortAnswer.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit || disabled) return;
    if (item.type === "single_choice") onSubmit({ type: "single_choice", selectedIndex: singleChoice });
    else if (item.type === "true_false_ng") onSubmit({ type: "true_false_ng", answers: tfng });
    else if (item.type === "gap_fill") onSubmit({ type: "gap_fill", answers: gapFill });
    else onSubmit({ type: "short_answer", text: shortAnswer });
  };

  return (
    <div className="space-y-6">
      {item.passage && (
        <div className="rounded-xl border border-border bg-surface-2 p-4 text-[15px] leading-relaxed text-text">
          {item.passage}
        </div>
      )}
      <p className="text-lg font-medium text-text">{item.prompt}</p>

      {item.type === "single_choice" && item.options && (
        <ul className="space-y-2">
          {item.options.map((opt, i) => (
            <li key={i}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setSingleChoice(i)}
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-3 text-left text-[15px] transition-all",
                  singleChoice === i
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface hover:border-primary/50",
                  disabled && "pointer-events-none opacity-70"
                )}
              >
                <span className="mr-2 font-medium text-muted">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}

      {item.type === "true_false_ng" && item.statements && (
        <ul className="space-y-4">
          {item.statements.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <span className="w-full text-[15px] text-text sm:w-auto sm:flex-1">{s.text}</span>
              <div className="flex gap-2">
                {(["true", "false", "not_given"] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={disabled}
                    onClick={() => setTfng((prev) => ({ ...prev, [s.id]: val }))}
                    className={cn(
                      "rounded-lg border-2 px-3 py-1.5 text-sm font-medium capitalize",
                      tfng[s.id] === val
                        ? "border-primary bg-primary/10 text-text"
                        : "border-border bg-surface-2 text-muted hover:border-primary/50",
                      disabled && "pointer-events-none opacity-70"
                    )}
                  >
                    {val.replace("_", " ")}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {item.type === "gap_fill" && item.blanks && item.wordBank && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Choose from: {(item.wordBank ?? []).join(", ")}</p>
          <div className="flex flex-wrap gap-2">
            {item.blanks.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <label htmlFor={b.id} className="text-sm font-medium text-text">
                  Blank {b.id}:
                </label>
                <select
                  id={b.id}
                  disabled={disabled}
                  value={gapFill[b.id] ?? ""}
                  onChange={(e) => setGapFill((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  className="rounded-lg border-2 border-border bg-surface px-3 py-2 text-[15px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select</option>
                  {(item.wordBank ?? []).map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {item.type === "short_answer" && (
        <textarea
          placeholder="Type your answer..."
          disabled={disabled}
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          rows={3}
          className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-[15px] placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
        />
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit || disabled} size="lg" className="w-full sm:w-auto">
        Submit
      </Button>
    </div>
  );
}
