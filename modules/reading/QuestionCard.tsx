"use client";

import { useState } from "react";
import type { ReadingQuestion } from "@/lib/content/reading";
import type { QuestionStatus } from "./useReadingSession";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

type Props = {
  question: ReadingQuestion;
  status: QuestionStatus;
  attempts: number;
  onSubmit: (
    answer: unknown,
    action?: "submit" | "skipParagraph" | "tryAgain" | "reveal"
  ) => void;
};

export function QuestionCard({ question, status, attempts, onSubmit }: Props) {
  const [tfngAnswer, setTfngAnswer] = useState<string>("");
  const [matchingAnswer, setMatchingAnswer] = useState<string>("");
  const [sentenceAnswer, setSentenceAnswer] = useState<string>("");
  const [showTips, setShowTips] = useState(false);

  const isCompleted = status === "completed";

  const handleSubmit = () => {
    if (question.type === "TFNG") {
      onSubmit(tfngAnswer, "submit");
    } else if (question.type === "MATCHING_INFO") {
      onSubmit(matchingAnswer, "submit");
    } else {
      onSubmit([sentenceAnswer], "submit");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {question.type === "TFNG"
          ? "True / False / Not Given"
          : question.type === "MATCHING_INFO"
            ? "Matching information"
            : "Sentence completion"}
      </div>
      <p className="mt-1 text-[15px] leading-relaxed text-text">
        {question.prompt}
      </p>

      {question.type === "TFNG" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(question.options ?? ["True", "False", "Not Given"]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTfngAnswer(opt)}
              className={`rounded-full border px-3 py-1 text-sm ${
                tfngAnswer === opt
                  ? "border-primary bg-primary/10 text-text"
                  : "border-border bg-surface text-muted"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "MATCHING_INFO" && (
        <div className="mt-2">
          <select
            value={matchingAnswer}
            onChange={(e) => setMatchingAnswer(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {(question.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {question.type === "SENTENCE_COMPLETION" && (
        <div className="mt-2">
          <input
            type="text"
            value={sentenceAnswer}
            onChange={(e) => setSentenceAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted">
            Use NO MORE THAN THREE WORDS.
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isCompleted}
        >
          Submit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSubmit(null, "skipParagraph")}
          disabled={isCompleted}
        >
          Not in this paragraph
        </Button>
        {status === "retry" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSubmit(null, "tryAgain")}
          >
            Try again
          </Button>
        )}
        {attempts >= 2 && !isCompleted && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSubmit(null, "reveal")}
          >
            Reveal answer
          </Button>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5">
        <button
          type="button"
          onClick={() => setShowTips((o) => !o)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left"
        >
          <Star className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-text">Coach tip</span>
          <span className="ml-auto text-xs text-muted">
            {showTips ? "Hide" : "Show"}
          </span>
        </button>
        {showTips && (
          <div className="space-y-2 border-t border-primary/20 px-3 py-2 text-xs leading-relaxed text-text">
            <div>
              <div className="font-semibold text-muted">
                What this question tests
              </div>
              <p>{question.coachTips.validates}</p>
            </div>
            <div>
              <div className="font-semibold text-muted">Common trap</div>
              <p>{question.coachTips.trap}</p>
            </div>
            <div>
              <div className="font-semibold text-muted">Mental model</div>
              <p>{question.coachTips.mentalModel}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

