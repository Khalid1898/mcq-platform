"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIeltsState } from "@/lib/use-ielts-state";

type AnswerOption = "true" | "false" | "notGiven";

const STATEMENTS: { id: string; text: string; correct: AnswerOption }[] = [
  {
    id: "s1",
    text: "Climate change is described as having no impact on sea levels.",
    correct: "false",
  },
  {
    id: "s2",
    text: "The passage states that extreme weather events are becoming more frequent.",
    correct: "true",
  },
  {
    id: "s3",
    text: "According to the passage, all scientists agree on the exact rate of warming.",
    correct: "notGiven",
  },
  {
    id: "s4",
    text: "Some cities are investing in flood defenses to prepare for rising seas.",
    correct: "true",
  },
  {
    id: "s5",
    text: "The passage claims that climate policies have already reversed global warming.",
    correct: "false",
  },
  {
    id: "s6",
    text: "The author suggests that individual lifestyle changes can contribute to solutions.",
    correct: "true",
  },
];

export default function ReadingTfngPage() {
  const router = useRouter();
  const { state, completeTask } = useIeltsState();

  const [answers, setAnswers] = useState<Record<string, AnswerOption | null>>(
    () =>
      STATEMENTS.reduce<Record<string, AnswerOption | null>>((acc, s) => {
        acc[s.id] = null;
        return acc;
      }, {})
  );
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = STATEMENTS.every((s) => answers[s.id] !== null);

  const handleChange = (id: string, value: AnswerOption) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);

    let correctCount = 0;
    STATEMENTS.forEach((s) => {
      if (answers[s.id] === s.correct) correctCount += 1;
    });

    const percent = Math.round((correctCount / STATEMENTS.length) * 100);

    completeTask({
      taskId: "tfng",
      score: percent,
      maxScore: 100,
      baseXP: 40,
      skillGains: {
        reading: 8 * (percent / 100),
      },
    });

    router.push("/result");
  };

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Reading: True / False / Not Given
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Read the passage and decide whether each statement agrees with the
          passage, contradicts it, or is not mentioned.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[15px]">Passage: Climate Change and Coastal Cities</CardTitle>
          <CardDescription className="mt-2 text-[15px] leading-relaxed text-muted">
            Coastal cities around the world are facing increasing pressure from
            rising sea levels and more frequent extreme weather events.
            Although scientists still debate the precise rate of warming, there
            is broad agreement that unchecked emissions will continue to raise
            global temperatures. Many cities are already investing in flood
            defenses and early-warning systems, while national governments argue
            over long-term climate policies. Alongside these large-scale
            efforts, everyday choices such as reducing energy use and choosing
            low-carbon transport can also contribute to meaningful change.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        {STATEMENTS.map((s, index) => (
          <Card key={s.id}>
            <CardContent className="space-y-4 py-5">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-sm font-medium text-muted">
                  {index + 1}.
                </span>
                <p className="text-[15px] leading-relaxed text-text">{s.text}</p>
              </div>

              <div className="flex flex-wrap gap-3 pl-5">
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-[15px] text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-emerald-50/50 has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
                  <input
                    type="radio"
                    name={s.id}
                    className="h-4 w-4 accent-primary"
                    checked={answers[s.id] === "true"}
                    onChange={() => handleChange(s.id, "true")}
                  />
                  <span>True</span>
                </label>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-[15px] text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-emerald-50/50 has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
                  <input
                    type="radio"
                    name={s.id}
                    className="h-4 w-4 accent-primary"
                    checked={answers[s.id] === "false"}
                    onChange={() => handleChange(s.id, "false")}
                  />
                  <span>False</span>
                </label>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-[15px] text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-emerald-50/50 has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
                  <input
                    type="radio"
                    name={s.id}
                    className="h-4 w-4 accent-primary"
                    checked={answers[s.id] === "notGiven"}
                    onChange={() => handleChange(s.id, "notGiven")}
                  />
                  <span>Not Given</span>
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted">
          {Object.values(answers).filter(Boolean).length} / {STATEMENTS.length}{" "}
          answered
        </div>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
        >
          Submit and view result
        </Button>
      </div>
    </div>
  );
}

