"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useIeltsState } from "@/lib/use-ielts-state";

export default function WritingIntroPage() {
  const router = useRouter();
  const { completeTask } = useIeltsState();

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wordCount = useMemo(
    () =>
      text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
    [text]
  );

  const handleSubmit = () => {
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

    router.push("/result");
  };

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Writing Task 2: Introduction
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Write a concise introduction that includes a clear overview of the
          topic and your position.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[15px]">Prompt</CardTitle>
          <CardDescription className="mt-2 text-[15px] leading-relaxed text-muted">
            Many countries are investing heavily in tourism to boost their
            economies. Some people believe this brings more problems than
            benefits to local communities. To what extent do you agree or
            disagree?
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[15px]">Your introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write 40–60 words focusing on paraphrasing the question and stating your opinion."
          />
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Word count: {wordCount}</span>
            <span>Suggested range: 40–60 words</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end border-t border-border pt-6">
        <Button size="lg" onClick={handleSubmit} disabled={submitting || wordCount < 20}>
          Submit and view result
        </Button>
      </div>
    </div>
  );
}

