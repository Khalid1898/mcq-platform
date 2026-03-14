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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getJourneySkills } from "@/lib/journey-storage";
import { useIeltsState } from "@/lib/use-ielts-state";

type Blank = {
  id: string;
  answer: string;
};

const BLANKS: Blank[] = [
  { id: "b1", answer: "population" },
  { id: "b2", answer: "infrastructure" },
  { id: "b3", answer: "commuting" },
  { id: "b4", answer: "green" },
];

const WORD_BANK = [
  "population",
  "infrastructure",
  "commuting",
  "green",
  "tourism",
  "housing",
];

export default function GapFillPage() {
  const router = useRouter();
  const { completeTask } = useIeltsState();

  const [values, setValues] = useState<Record<string, string>>(() =>
    BLANKS.reduce<Record<string, string>>((acc, b) => {
      acc[b.id] = "";
      return acc;
    }, {})
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const allFilled = BLANKS.every((b) => values[b.id].trim().length > 0);

  const handleSubmit = () => {
    if (!allFilled || submitting) return;
    setSubmitting(true);

    let correctCount = 0;
    BLANKS.forEach((b) => {
      const given = values[b.id].trim().toLowerCase();
      if (given === b.answer.toLowerCase()) correctCount += 1;
    });

    const percent = Math.round((correctCount / BLANKS.length) * 100);

    completeTask({
      taskId: "gapFill",
      score: percent,
      maxScore: 100,
      baseXP: 40,
      skillGains: {
        reading: 8 * (percent / 100),
      },
    });

    const journey = getJourneySkills();
    if (journey?.includes("writing")) {
      router.push("/practice/writing/intro");
    } else {
      router.push("/result");
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Reading: Fill in the Gaps
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Complete the paragraphs using the word bank. Each word is used once.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[15px]">Word bank</CardTitle>
          <CardDescription className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
            {WORD_BANK.map((word) => (
              <Badge key={word} variant="outline">
                {word}
              </Badge>
            ))}
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="space-y-4 text-[15px] leading-relaxed text-text">
        <p>
          Over the last century, rapid{" "}
          <span className="font-semibold">[1]</span> growth has transformed many
          small towns into dense megacities. As more people move to urban
          areas, local governments struggle to expand{" "}
          <span className="font-semibold">[2]</span> such as transport, schools,
          and hospitals quickly enough.
        </p>
        <p>
          Long daily{" "}
          <span className="font-semibold">[3]</span> times are now common in
          many cities, leaving workers tired before they even reach the office.
          To create more liveable places, some planners are prioritising{" "}
          <span className="font-semibold">[4]</span> spaces where residents can
          relax, exercise, and meet their neighbours.
        </p>
      </section>

      <section className="space-y-4">
        {BLANKS.map((b, index) => (
          <div
            key={b.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm font-medium text-muted">
              Blank {index + 1}
            </div>
            <div className="w-full max-w-xs">
              <Input
                value={values[b.id]}
                onChange={(e) => handleChange(b.id, e.target.value)}
                placeholder="Type a word from the bank"
              />
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted">
          {BLANKS.filter((b) => values[b.id].trim().length > 0).length} /{" "}
          {BLANKS.length} blanks filled
        </div>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
        >
          Submit and view result
        </Button>
      </div>
    </div>
  );
}

