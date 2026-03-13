"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WritingPrompt } from "./prompts";

type PositionChoice = "strongly-agree" | "partly-agree" | "strongly-disagree" | "not-sure";

type IntroFeedback = {
  clarityOfOpinion: string;
  introStructure: string;
  taskResponse: string;
  languageClarity: string;
  positiveNote: string;
  improvementSuggestion: string;
};

const STEPS = [
  "Read the question",
  "Ideas that come to mind",
  "Your position",
  "Main reason(s)",
  "Introduction blueprint",
  "Write your introduction",
  "Feedback",
] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Props = {
  prompt: WritingPrompt;
  onIntroComplete?: (args: { intro: string; feedback: IntroFeedback }) => void;
};

export function Task2IntroStudio({ prompt, onIntroComplete }: Props) {
  const [step, setStep] = useState<StepIndex>(0);

  const [ideas, setIdeas] = useState<string[]>([]);
  const [ideaInput, setIdeaInput] = useState("");

  const [position, setPosition] = useState<PositionChoice | null>(null);

  const [reasons, setReasons] = useState<string[]>([]);
  const [reasonInput, setReasonInput] = useState("");

  const [paraphrase, setParaphrase] = useState("");
  const [opinionSentence, setOpinionSentence] = useState("");
  const [previewSentence, setPreviewSentence] = useState("");

  const [intro, setIntro] = useState("");
  const [feedback, setFeedback] = useState<IntroFeedback | null>(null);
  const [feedbackCount, setFeedbackCount] = useState(0);

  const hasEnoughIdeas = ideas.length >= 3;
  const hasPosition = Boolean(position);
  const hasReason = reasons.some((r) => r.trim().length > 0);

  const canAdvanceFromIdeas = hasEnoughIdeas;
  const canAdvanceFromPosition = hasPosition;
  const canAdvanceFromReasons = hasReason;
  const canWriteIntro = hasEnoughIdeas && hasPosition && hasReason;

  const ideaPlaceholder = "Add a keyword or short phrase, then press Enter";

  const handleAddIdea = () => {
    const trimmed = ideaInput.trim();
    if (!trimmed) return;
    setIdeas((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed].slice(0, 12)
    );
    setIdeaInput("");
  };

  const handleAddReason = () => {
    const trimmed = reasonInput.trim();
    if (!trimmed) return;
    setReasons((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed].slice(0, 4)
    );
    setReasonInput("");
  };

  const wordCount = useMemo(
    () =>
      intro
        .trim()
        .split(/\\s+/)
        .filter(Boolean).length,
    [intro]
  );

  const generateFeedback = (): IntroFeedback => {
    const lower = intro.toLowerCase();
    const mentionsOpinion =
      lower.includes("i believe") ||
      lower.includes("i think") ||
      lower.includes("in my opinion") ||
      lower.includes("i agree") ||
      lower.includes("i disagree") ||
      lower.includes("this essay will");

    const hasTwoSentences = (intro.match(/[.!?]/g) || []).length >= 2;

    const clarityOfOpinion = mentionsOpinion
      ? "Your opinion is clear to the reader."
      : "Your opinion could be expressed more directly (for example: ‘In my view...’).";

    const introStructure = hasTwoSentences
      ? "Your introduction has the basic structure of 2–3 sentences."
      : "Aim for 2–3 sentences: paraphrase, opinion, and a brief preview.";

    const taskResponse =
      wordCount >= 35 && wordCount <= 70
        ? "The length is appropriate for a Task 2 introduction."
        : wordCount < 35
        ? "The introduction is a bit short – add one more sentence to fully answer the question."
        : "The introduction is quite long – you can save some ideas for the body paragraphs.";

    const languageClarity =
      intro.length === 0
        ? "Once you write your introduction, you will see language feedback here."
        : "Your language is mostly clear. Focus on keeping sentences simple and accurate rather than very complex.";

    const positiveNote =
      hasEnoughIdeas && hasReason
        ? "You used your brainstormed ideas and reasons to build the introduction, which is a strong habit."
        : "You started building an introduction – with a bit more planning, it can become even stronger.";

    const improvementSuggestion = !mentionsOpinion
      ? "Add one sentence that clearly states whether you agree, partly agree, or disagree."
      : hasTwoSentences
      ? "Consider adding a short preview of your main reason (for example: ‘This essay will argue that...’)."
      : "Try separating long sentences into two shorter ones to improve clarity.";

    return {
      clarityOfOpinion,
      introStructure,
      taskResponse,
      languageClarity,
      positiveNote,
      improvementSuggestion,
    };
  };

  const handleRequestFeedback = () => {
    const fb = generateFeedback();
    setFeedback(fb);
    setFeedbackCount((c) => c + 1);
    setStep(6);
    if (onIntroComplete && feedbackCount === 0) {
      onIntroComplete({ intro, feedback: fb });
    }
  };

  const handleReviseAndRetry = () => {
    setStep(5);
    setFeedback(null);
  };

  const stepLabel = STEPS[step];

  return (
    <div className="space-y-6">
      {/* Stepper: user must advance with explicit Next / Confirm actions */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <span className="text-sm font-medium text-text">
          Step {step + 1} of {STEPS.length}
        </span>
        <span className="text-sm text-muted">{stepLabel}</span>
        <div className="ml-auto flex gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i as StepIndex)}
              aria-label={`Go to step ${i + 1}: ${label}`}
              className={`h-2 w-2 rounded-full transition ${
                i === step
                  ? "bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-bg"
                  : i < step
                    ? "bg-primary/60 hover:bg-primary/80"
                    : "bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 0: Read the question */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Writing Task 2 prompt</CardTitle>
            <CardDescription className="mt-2 text-[15px] leading-relaxed text-muted">
              {prompt.prompt}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end border-t border-border pt-4">
            <Button onClick={() => setStep(1)}>Next: add your ideas</Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Ideas */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Ideas that come to mind</CardTitle>
            <CardDescription className="mt-1 text-[13px] text-muted">
              Add at least three keywords or short phrases. Then confirm to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddIdea();
                    }
                  }}
                  placeholder={ideaPlaceholder}
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddIdea}
                  disabled={!ideaInput.trim()}
                >
                  Add
                </Button>
              </div>
              {ideas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ideas.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() =>
                        setIdeas((prev) => prev.filter((item) => item !== idea))
                      }
                      className="group inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-text hover:border-primary/70 hover:bg-surface"
                    >
                      <span>{idea}</span>
                      <span className="text-[10px] text-muted group-hover:text-primary">
                        ×
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted">
                {ideas.length >= 3 ? (
                  <span>You’ve added enough ideas to move on.</span>
                ) : (
                  <span>
                    Add {Math.max(0, 3 - ideas.length)} more idea
                    {3 - ideas.length === 1 ? "" : "s"} to unlock the writing step.
                  </span>
                )}
              </p>
            <div className="flex justify-between border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)} disabled={!canAdvanceFromIdeas}>
                I'm done with ideas – Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Your position</CardTitle>
              <CardDescription className="mt-1 text-[13px] text-muted">
                Choose the opinion you will express. Then confirm to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <PositionOption
                  label="Strongly agree"
                  value="strongly-agree"
                  description="You mostly support the statement."
                  selected={position === "strongly-agree"}
                  onSelect={setPosition}
                />
                <PositionOption
                  label="Partly agree"
                  value="partly-agree"
                  description="You see both sides but lean towards agreement."
                  selected={position === "partly-agree"}
                  onSelect={setPosition}
                />
                <PositionOption
                  label="Strongly disagree"
                  value="strongly-disagree"
                  description="You mostly disagree with the statement."
                  selected={position === "strongly-disagree"}
                  onSelect={setPosition}
                />
                <PositionOption
                  label="Not sure yet"
                  value="not-sure"
                  description="You are still deciding. You can change later."
                  selected={position === "not-sure"}
                  onSelect={setPosition}
                />
              </div>
              <div className="flex justify-between border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canAdvanceFromPosition}>
                  Confirm position – Next
                </Button>
              </div>
            </CardContent>
          </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Main reason(s)</CardTitle>
              <CardDescription className="mt-1 text-[13px] text-muted">
                Add at least one reason that supports your position. Then confirm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddReason();
                    }
                  }}
                  placeholder="Add a short reason, then press Enter"
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddReason}
                  disabled={!reasonInput.trim()}
                >
                  Add
                </Button>
              </div>
              {reasons.length > 0 && (
                <ol className="list-decimal space-y-1 pl-5 text-sm text-text">
                  {reasons.map((reason) => (
                    <li key={reason} className="flex items-start justify-between gap-2">
                      <span>{reason}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setReasons((prev) => prev.filter((item) => item !== reason))
                        }
                        className="ml-2 text-[11px] text-muted hover:text-primary"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex justify-between border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!canAdvanceFromReasons}>
                  I'm done with reasons – Next
                </Button>
              </div>
            </CardContent>
          </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Introduction blueprint</CardTitle>
              <CardDescription className="mt-1 text-[13px] text-muted">
                Optionally plan in three moves. You can skip or fill in and then continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <BlueprintField
                  label="Paraphrase the question"
                  placeholder="Rewrite the topic in your own words."
                  value={paraphrase}
                  onChange={setParaphrase}
                />
                <BlueprintField
                  label="State your opinion"
                  placeholder="Make your position clear (e.g. I partly agree that...)."
                  value={opinionSentence}
                  onChange={setOpinionSentence}
                />
                <BlueprintField
                  label="Preview your main idea"
                  placeholder="Briefly show what your essay will focus on."
                  value={previewSentence}
                  onChange={setPreviewSentence}
                />
              </div>
              <div className="flex justify-between border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>Next: write your introduction</Button>
              </div>
            </CardContent>
          </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Write your introduction</CardTitle>
            <CardDescription className="mt-1 text-[13px] text-muted">
              Use your ideas, position, and reasons. Write 40–60 words, then get feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-surface p-3 text-xs text-muted">
              <p className="font-medium text-text">Your planning</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ideas.map((idea) => (
                  <span
                    key={idea}
                    className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] text-text"
                  >
                    {idea}
                  </span>
                ))}
                <span className="text-[11px] text-text">
                  · {position ? ({"strongly-agree": "Strongly agree", "partly-agree": "Partly agree", "strongly-disagree": "Strongly disagree", "not-sure": "Not sure"})[position] : "—"} · {reasons.length ? reasons.join("; ") : "—"}
                </span>
              </div>
            </div>
            <Textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Write 40–60 words. Paraphrase, state your opinion, preview your main idea."
              className="min-h-[120px]"
            />
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Word count: {wordCount}</span>
              <span>Suggested: 40–60 words</span>
            </div>
            <div className="flex justify-between border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button
                onClick={handleRequestFeedback}
                disabled={intro.trim().length < 20}
              >
                Get feedback on this introduction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 6 && feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Feedback on your introduction</CardTitle>
            <CardDescription className="mt-1 text-[13px] text-muted">
              Use this to improve. You can revise and get feedback again, or finish the session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-[13px]">
              <FeedbackRow label="Clarity of opinion" text={feedback.clarityOfOpinion} />
              <FeedbackRow label="Intro structure" text={feedback.introStructure} />
              <FeedbackRow label="Task response" text={feedback.taskResponse} />
              <FeedbackRow label="Language clarity" text={feedback.languageClarity} />
              <FeedbackRow label="Positive note" text={feedback.positiveNote} />
              <FeedbackRow
                label="One suggestion"
                text={feedback.improvementSuggestion}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={handleReviseAndRetry}>
                Revise and get feedback again
              </Button>
              <p className="w-full text-right text-xs text-muted sm:w-auto">
                When you're satisfied, use the &quot;Finish session&quot; button below the page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type PositionOptionProps = {
  label: string;
  value: PositionChoice;
  description: string;
  selected: boolean;
  onSelect: (value: PositionChoice) => void;
};

function PositionOption({
  label,
  value,
  description,
  selected,
  onSelect,
}: PositionOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left text-xs transition
        ${
          selected
            ? "border-primary bg-primary/5 text-text"
            : "border-border bg-surface text-text hover:border-primary/50"
        }`}
    >
      <span className="text-[13px] font-medium">{label}</span>
      <span className="mt-0.5 text-[11px] text-muted">{description}</span>
    </button>
  );
}

type BlueprintFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

function BlueprintField({
  label,
  placeholder,
  value,
  onChange,
}: BlueprintFieldProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-text">{label}</p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[60px]"
      />
    </div>
  );
}

type FeedbackRowProps = {
  label: string;
  text: string;
};

function FeedbackRow({ label, text }: FeedbackRowProps) {
  return (
    <div>
      <p className="text-[12px] font-medium text-text">{label}</p>
      <p className="text-[13px] text-muted">{text}</p>
    </div>
  );
}

