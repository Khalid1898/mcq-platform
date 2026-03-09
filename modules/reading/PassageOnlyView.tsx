"use client";

import { useEffect, useState } from "react";
import { Check, Moon, RotateCw, Sun, X } from "lucide-react";
import { useTheme } from "@/app/ThemeProvider";
import { Input } from "@/components/ui/input";
import type {
  ReadingPassage,
  ReadingQuestion,
  ReadingQuestionSection,
} from "@/lib/content/reading";

type Props = {
  passage: ReadingPassage;
  /** Question order (1-based) → correct answer. Used for immediate green/red feedback. */
  correctAnswers?: Record<number, string>;
};

/**
 * REQUIRED FLIP CARD BEHAVIOUR (do not break when changing layout/styling/content):
 * - Front side shows one text (frontTitle). User sees it by default.
 * - On click, the card flips (3D rotateY animation) and reveals the back side.
 * - Back side shows different text (backTitle). Click again flips back to front.
 * - No mirroring: both sides must show readable text (not mirrored). Uses CSS
 *   .flip-card, .flip-card-inner, .flip-card-face, .flip-card-back + backface-visibility.
 * Any change (e.g. adding images, new copy) must preserve: front text → click → flip → back text.
 */

type CoachCard = {
  id: string;
  frontTitle: string;
  backTitle: string;
};

const COACH_CARDS: CoachCard[] = [
  {
    id: "card-1",
    frontTitle:
      "Click to set what you should do before reading a single line.",
    backTitle: "Back of card 1 – fill with your own coaching later.",
  },
  {
    id: "card-2",
    frontTitle: "Click to define your time‑plan tip.",
    backTitle: "Back of card 2 – your content goes here.",
  },
  {
    id: "card-3",
    frontTitle: "Click to define how to use the question types.",
    backTitle: "Back of card 3 – your content goes here.",
  },
];

export function PassageOnlyView({ passage, correctAnswers }: Props) {
  const { theme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const [viewReady, setViewReady] = useState(false);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setViewReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full px-2 py-4 sm:px-4 md:px-6 lg:px-8">
      <div className="mb-3 flex items-center justify-end gap-2 text-xs text-muted">
        {themeReady && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text shadow-sm transition-colors hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg dark:border-border dark:bg-surface-2 dark:hover:bg-surface"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark mode</span>
              </>
            )}
          </button>
        )}
      </div>

      <div
        className={`transition-opacity duration-[3000ms] ease-out ${
          viewReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
          <article>
            <h1 className="text-lg font-semibold text-text">{passage.title}</h1>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-text">
              {passage.paragraphs.map((p) => (
                <p key={p.id}>{p.text}</p>
              ))}
            </div>
          </article>

          <aside className="hidden md:flex max-h-[80vh] flex-col gap-4 overflow-y-auto pr-1">
            {COACH_CARDS.map((card, index) => {
              const sections = passage.questionSections ?? [];
              const section = sections[index] ?? null;
              const [startOrder, endOrder] = section
                ? [section.startOrder, section.endOrder]
                : [[1, 5], [6, 9], [10, 13]][index] ?? [1, 5];
              const cardQuestions = passage.questions.filter(
                (q) => q.order >= startOrder && q.order <= endOrder
              );
              return (
                <div key={card.id} className="w-full shrink-0">
                  <FlipCoachCard
                    card={card}
                    questions={
                      cardQuestions.length > 0 ? cardQuestions : undefined
                    }
                    section={section ?? undefined}
                    correctAnswers={correctAnswers}
                  />
                </div>
              );
            })}
          </aside>
        </div>
      </div>
    </div>
  );
}

type FlipCoachCardProps = {
  card: CoachCard;
  questions?: ReadingQuestion[];
  /** When set, this card shows this section's title, subtitle, instructions, and the questions list. */
  section?: ReadingQuestionSection;
  /** Question order → correct answer; used for immediate green/red feedback. */
  correctAnswers?: Record<number, string>;
};

/** Returns whether user answer matches correct answer (case-insensitive for TFNG and sentence completion). */
function isAnswerCorrect(
  questionType: ReadingQuestion["type"],
  userAnswer: string,
  correctAnswer: string
): boolean {
  if (!userAnswer.trim()) return false;
  const u = userAnswer.trim();
  const c = correctAnswer.trim();
  if (questionType === "TFNG" || questionType === "SENTENCE_COMPLETION") {
    return u.toLowerCase() === c.toLowerCase();
  }
  return u === c; // MATCHING_INFO: exact (letter)
}

/** 3D flip card: front text → click → flip → back text. See REQUIRED FLIP CARD BEHAVIOUR above. */
function FlipCoachCard({
  card,
  questions,
  section,
  correctAnswers,
}: FlipCoachCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showBackFace, setShowBackFace] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnoseQuestionOrder, setDiagnoseQuestionOrder] = useState<
    number | null
  >(null);

  // Avoid showing the back/OK face in the initial server render,
  // so we don't flash it on refresh before hydration.
  useEffect(() => {
    setShowBackFace(true);
  }, []);

  const hasQuestions = questions && questions.length > 0;
  const q1 = questions?.find((q) => q.order === 1);

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAnswerSelect = (q: ReadingQuestion, value: string) => {
    setAnswer(q.id, value);
    if (
      q.order === 1 &&
      correctAnswers?.[1] &&
      !isAnswerCorrect(q.type, value, correctAnswers[1])
    ) {
      setDiagnoseQuestionOrder(1);
      setFlipped(true);
    }
  };

  return (
    <button
      type="button"
      onClick={() => setFlipped((prev) => !prev)}
      className={`flip-card group relative w-full cursor-pointer rounded-2xl bg-transparent p-0 text-left ${
        hasQuestions ? "block h-auto min-h-[180px]" : "min-h-[180px]"
      } ${flipped ? "is-flipped" : ""}`}
    >
      <div
        className={`flip-card-inner w-full rounded-2xl border border-border bg-surface shadow-md dark:shadow-none dark:ring-1 dark:ring-border ${
          hasQuestions ? "expand-height min-h-[180px]" : "h-full min-h-[180px]"
        }`}
      >
        <div
          className={`flip-card-face flip-card-front flex flex-col gap-2 px-4 py-3 ${
            hasQuestions ? "min-h-[180px]" : "h-full"
          }`}
        >
          {hasQuestions ? (
            <>
              <div className="flex flex-col gap-2 pr-1 text-[12px] leading-relaxed text-text">
                {section ? (
                  <>
                    <h3 className="text-[14px] font-semibold text-text">
                      {section.title}
                    </h3>
                    <p className="text-[12px] font-medium text-text">
                      {section.subtitle}
                    </p>
                    <ul className="list-none space-y-1 pl-0 text-[11px] text-muted">
                      {section.instructions.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                    <div className="mt-2 space-y-4" onClick={(e) => e.stopPropagation()}>
                      {questions.map((q) => {
                        const correctAnswer = correctAnswers?.[q.order];
                        const userAnswer = answers[q.id] ?? "";
                        const hasAnswered = userAnswer.trim() !== "";
                        const isCorrect =
                          correctAnswer != null &&
                          hasAnswered &&
                          isAnswerCorrect(q.type, userAnswer, correctAnswer);
                        const isWrong = hasAnswered && !isCorrect;
                        return (
                        <div key={q.id} className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-text">
                              <span className="font-semibold">{q.order}.</span>{" "}
                              {q.prompt}
                            </p>
                            {hasAnswered &&
                              (isCorrect ? (
                                <Check
                                  className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
                                  aria-label="Correct"
                                />
                              ) : (
                                <X
                                  className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
                                  aria-label="Incorrect"
                                />
                              ))}
                          </div>
                          {q.type === "TFNG" && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(q.options ?? ["True", "False", "Not Given"]).map(
                                (opt) => {
                                  const selected = answers[q.id] === opt;
                                  const showGreen = selected && isCorrect;
                                  const showRed = selected && isWrong;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() =>
                                        q.order === 1
                                          ? handleAnswerSelect(q, opt)
                                          : setAnswer(q.id, opt)
                                      }
                                      className={`rounded-md border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 ${
                                        showGreen
                                          ? "border-green-600 bg-green-100 text-green-800 dark:border-green-500 dark:bg-green-950/50 dark:text-green-200"
                                          : showRed
                                            ? "border-red-600 bg-red-100 text-red-800 dark:border-red-500 dark:bg-red-950/50 dark:text-red-200"
                                            : selected
                                              ? "border-primary bg-primary/15 text-primary dark:bg-primary/25"
                                              : "border-border bg-surface text-muted hover:border-border/80 hover:bg-surface-2"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          )}
                          {q.type === "MATCHING_INFO" && (
                            <select
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswer(q.id, e.target.value)
                              }
                              className={`w-full max-w-[6rem] rounded-lg border-2 px-3 py-2 text-[13px] font-medium text-text focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                isCorrect
                                  ? "border-green-600 bg-green-100 dark:border-green-500 dark:bg-green-950/50 focus:ring-green-500"
                                  : isWrong
                                    ? "border-red-600 bg-red-100 dark:border-red-500 dark:bg-red-950/50 focus:ring-red-500"
                                    : "border-border bg-surface focus:border-primary focus:ring-primary/20"
                              }`}
                            >
                              <option value="">—</option>
                              {(q.options ?? ["A", "B", "C", "D", "E", "F", "G", "H"]).map(
                                (opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                )
                              )}
                            </select>
                          )}
                          {q.type === "SENTENCE_COMPLETION" && (
                            <Input
                              type="text"
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswer(q.id, e.target.value)
                              }
                              placeholder="One or two words"
                              className={`h-10 min-h-0 text-[13px] ${
                                isCorrect
                                  ? "border-2 border-green-600 bg-green-100 dark:border-green-500 dark:bg-green-950/50"
                                  : isWrong
                                    ? "border-2 border-red-600 bg-red-100 dark:border-red-500 dark:bg-red-950/50"
                                    : ""
                              }`}
                            />
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="shrink-0 border-b border-border pb-2">
                      <h3 className="text-[14px] font-semibold text-text">
                        Questions {questions[0]?.order ?? 1}–
                        {questions[questions.length - 1]?.order ?? questions.length}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted">
                        Answer the questions below. Choose your answer from the
                        passage.
                      </p>
                    </div>
                    <div className="mt-2 space-y-4 pr-1" onClick={(e) => e.stopPropagation()}>
                      {questions.map((q) => {
                        const correctAnswer = correctAnswers?.[q.order];
                        const userAnswer = answers[q.id] ?? "";
                        const hasAnswered = userAnswer.trim() !== "";
                        const isCorrect =
                          correctAnswer != null &&
                          hasAnswered &&
                          isAnswerCorrect(q.type, userAnswer, correctAnswer);
                        const isWrong = hasAnswered && !isCorrect;
                        return (
                        <div key={q.id} className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-text">
                              <span className="font-semibold">{q.order}.</span>{" "}
                              {q.prompt}
                            </p>
                            {hasAnswered &&
                              (isCorrect ? (
                                <Check
                                  className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
                                  aria-label="Correct"
                                />
                              ) : (
                                <X
                                  className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
                                  aria-label="Incorrect"
                                />
                              ))}
                          </div>
                          {q.type === "TFNG" && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(q.options ?? ["True", "False", "Not Given"]).map(
                                (opt) => {
                                  const selected = answers[q.id] === opt;
                                  const showGreen = selected && isCorrect;
                                  const showRed = selected && isWrong;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() =>
                                        q.order === 1
                                          ? handleAnswerSelect(q, opt)
                                          : setAnswer(q.id, opt)
                                      }
                                      className={`rounded-md border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 ${
                                        showGreen
                                          ? "border-green-600 bg-green-100 text-green-800 dark:border-green-500 dark:bg-green-950/50 dark:text-green-200"
                                          : showRed
                                            ? "border-red-600 bg-red-100 text-red-800 dark:border-red-500 dark:bg-red-950/50 dark:text-red-200"
                                            : selected
                                              ? "border-primary bg-primary/15 text-primary dark:bg-primary/25"
                                              : "border-border bg-surface text-muted hover:border-border/80 hover:bg-surface-2"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          )}
                          {q.type === "MATCHING_INFO" && (
                            <select
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswer(q.id, e.target.value)
                              }
                              className={`w-full max-w-[6rem] rounded-lg border-2 px-3 py-2 text-[13px] font-medium text-text focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                isCorrect
                                  ? "border-green-600 bg-green-100 dark:border-green-500 dark:bg-green-950/50 focus:ring-green-500"
                                  : isWrong
                                    ? "border-red-600 bg-red-100 dark:border-red-500 dark:bg-red-950/50 focus:ring-red-500"
                                    : "border-border bg-surface focus:border-primary focus:ring-primary/20"
                              }`}
                            >
                              <option value="">—</option>
                              {(q.options ?? ["A", "B", "C", "D", "E", "F", "G", "H"]).map(
                                (opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                )
                              )}
                            </select>
                          )}
                          {q.type === "SENTENCE_COMPLETION" && (
                            <Input
                              type="text"
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswer(q.id, e.target.value)
                              }
                              placeholder="One or two words"
                              className={`h-10 min-h-0 text-[13px] ${
                                isCorrect
                                  ? "border-2 border-green-600 bg-green-100 dark:border-green-500 dark:bg-green-950/50"
                                  : isWrong
                                    ? "border-2 border-red-600 bg-red-100 dark:border-red-500 dark:bg-red-950/50"
                                    : ""
                              }`}
                            />
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              <div
                className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-400/90 px-3 py-2 text-amber-900 shadow-md ring-2 ring-amber-500/30 dark:border-amber-600 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-500/40"
                aria-hidden="true"
              >
                <RotateCw className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                <span className="text-xs font-semibold">
                  Click here and rotate the card
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[13px] font-semibold text-text">
                {card.frontTitle}
              </div>
              <div
                className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-400/90 px-3 py-2 text-amber-900 shadow-md ring-2 ring-amber-500/30 dark:border-amber-600 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-500/40"
                aria-hidden="true"
              >
                <RotateCw className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                <span className="text-xs font-semibold">
                  Click here and rotate the card
                </span>
              </div>
            </>
          )}
        </div>

        {showBackFace && (
          <div
            className="flip-card-face flip-card-back flex flex-col gap-3 overflow-y-auto px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            {diagnoseQuestionOrder === 1 ? (
              <>
                {q1 && (
                  <div className="shrink-0 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-[11px] dark:border-amber-500/40 dark:bg-amber-500/15">
                    <p className="font-semibold text-text">Question 1</p>
                    <p className="mt-0.5 leading-relaxed text-text">
                      {q1.prompt}
                    </p>
                    <p className="mt-1 text-muted">
                      Your answer: {answers[q1.id] ?? "—"}
                    </p>
                    <p className="mt-1 font-medium text-amber-700 dark:text-amber-300">
                      Let's diagnose the mistake.
                    </p>
                  </div>
                )}
                <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px] text-text">
                  <p className="font-semibold text-text">
                    What does the question mean in plain English?
                  </p>
                  <p className="mt-1">
                    When people concentrate deeply on a task, do they notice
                    time more or less?
                  </p>
                  <div className="mt-2 space-y-0.5 pl-1">
                    <p>More</p>
                    <p>Less</p>
                    <p>Not mentioned</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Clear Q1 answer so the learner can retry.
                    setAnswers((prev) =>
                      q1 ? { ...prev, [q1.id]: "" } : prev
                    );
                    setDiagnoseQuestionOrder(null);
                    setFlipped(false);
                  }}
                  className="shrink-0 self-start rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface"
                >
                  Retry this question
                </button>
              </>
            ) : (
              <>
                <div className="text-[13px] font-semibold text-text">
                  {card.backTitle}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlipped(false);
                  }}
                  className="h-12 w-12 shrink-0 rounded-lg bg-primary font-semibold text-primary-foreground shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface"
                >
                  OK
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
