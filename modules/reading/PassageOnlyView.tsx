"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Home, Moon, RotateCw, Sun, X } from "lucide-react";
import { useTheme } from "@/app/ThemeProvider";
import { ScrollAreaAlwaysVisible } from "@/components/ScrollAreaAlwaysVisible";
import { Input } from "@/components/ui/input";
import { WordLookupPopup } from "@/components/WordLookupPopup";
import type {
  ReadingPassage,
  ReadingQuestion,
  ReadingQuestionSection,
} from "@/lib/content/reading";
import {
  MATCHING_CORRECTION_CONFIG,
  type MatchingCorrectionStep,
} from "@/content/reading/matching-correction-config";
import type { MilestoneStep } from "@/components/milestone-progress";
import { getJourneySkills } from "@/lib/journey-storage";
import { usePracticeProgress } from "@/app/PracticeProgressContext";

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
    backTitle: "",
  },
  {
    id: "card-2",
    frontTitle: "Click to define your time‑plan tip.",
    backTitle: "",
  },
  {
    id: "card-3",
    frontTitle: "Click to define how to use the question types.",
    backTitle: "",
  },
];

/** Build practice progress steps from passage sections and current answers. No step is completed until all questions in that section are answered. */
function buildPracticeStepsFromPassage(
  passage: ReadingPassage,
  answers: Record<string, string>
): MilestoneStep[] {
  const sections = passage.questionSections ?? [];
  if (sections.length === 0) return [];

  return sections.map((sec, index) => {
    const total = sec.endOrder - sec.startOrder + 1;
    const questionsInSection = passage.questions.filter(
      (q) => q.order >= sec.startOrder && q.order <= sec.endOrder
    );
    const answeredCount = questionsInSection.filter(
      (q) => typeof answers[q.id] === "string" && answers[q.id].trim() !== ""
    ).length;
    // Only green when user has actually answered every question in this section (never when 0 answered).
    const isCompleted =
      total > 0 && answeredCount > 0 && answeredCount === total;
    const isFirstIncomplete =
      !isCompleted &&
      (index === 0 ||
        sections.slice(0, index).every((s) => {
          const sTotal = s.endOrder - s.startOrder + 1;
          const sAnswered = passage.questions.filter(
            (q) =>
              q.order >= s.startOrder &&
              q.order <= s.endOrder &&
              typeof answers[q.id] === "string" &&
              answers[q.id].trim() !== ""
          ).length;
          return sTotal > 0 && sAnswered > 0 && sAnswered === sTotal;
        }));
    const status = isCompleted
      ? "completed"
      : isFirstIncomplete
        ? "active"
        : "upcoming";

    return {
      skill: sec.title,
      subtype: sec.subtitle,
      meta: `${answeredCount} of ${total} complete`,
      status,
      // Grey until this subtask is fully completed (no green/primary for "in progress").
      hasSubTaskProgress: status === "completed" ? undefined : false,
    };
  });
}

export function PassageOnlyView({ passage, correctAnswers }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { setSteps } = usePracticeProgress();
  const [themeReady, setThemeReady] = useState(false);
  const [viewReady, setViewReady] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [highlightedParagraphId, setHighlightedParagraphId] = useState<
    string | null
  >(null);
  const [simpleEnglishParagraphId, setSimpleEnglishParagraphId] = useState<
    string | null
  >(null);
  const [translationParagraphId, setTranslationParagraphId] = useState<
    string | null
  >(null);
  const [viewRelatedParagraphId, setViewRelatedParagraphId] = useState<
    string | null
  >(null);
  const [showContinueFooter, setShowContinueFooter] = useState(false);
  const [lookupState, setLookupState] = useState<{
    word: string;
    definition: string;
    synonyms: string[];
    x: number;
    y: number;
    open: boolean;
    loading: boolean;
  }>({
    word: "",
    definition: "",
    synonyms: [],
    x: 0,
    y: 0,
    open: false,
    loading: false,
  });

  useEffect(() => {
    const journey = getJourneySkills();
    setShowContinueFooter((journey?.length ?? 0) > 0);
  }, []);

  const practiceSteps = useMemo(
    () => buildPracticeStepsFromPassage(passage, answers),
    [passage, answers]
  );

  useEffect(() => {
    if (practiceSteps.length > 0) setSteps(practiceSteps);
  }, [practiceSteps, setSteps]);

  const [translationState, setTranslationState] = useState<{
    questionOrder: number | null;
    text: string;
    translatedText: string;
    loading: boolean;
  }>({
    questionOrder: null,
    text: "",
    translatedText: "",
    loading: false,
  });

  useEffect(() => {
    setThemeReady(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setViewReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("reading-font-scale");
    if (!stored) return;
    const parsed = Number(stored);
    if (!Number.isNaN(parsed) && parsed >= 0.85 && parsed <= 1.4) {
      setFontScale(parsed);
    }
  }, []);

  const updateFontScale = (next: number) => {
    const clamped = Math.min(1.4, Math.max(0.85, next));
    setFontScale(clamped);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "reading-font-scale",
        String(clamped.toFixed(2))
      );
    }
  };

  const handleWordLookup = async (word: string, x: number, y: number) => {
    const cleaned = word.trim().replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (!cleaned) return;

    setLookupState((prev) => ({
      ...prev,
      word: cleaned,
      definition: "",
      synonyms: [],
      x,
      y,
      open: true,
      loading: true,
    }));

    try {
      const res = await fetch(
        `/api/dictionary?word=${encodeURIComponent(cleaned)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          (data && (data.debug || data.error || data.message)) ||
            `Lookup failed with status ${res.status}`
        );
      }
      setLookupState((prev) => ({
        ...prev,
        definition: data.definition ?? "",
        synonyms: Array.isArray(data.synonyms) ? data.synonyms : [],
        loading: false,
      }));
    } catch (error) {
      console.error("Word lookup failed on client", error);
      setLookupState((prev) => ({
        ...prev,
        definition:
          error instanceof Error
            ? error.message
            : "There was a problem looking up this word locally.",
        synonyms: [],
        loading: false,
      }));
    }
  };

  return (
    <div className="w-full px-2 py-4 sm:px-4 md:px-6 lg:px-8">
      <div className="mb-3 grid grid-cols-3 items-center gap-2 text-xs text-muted">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text shadow-sm transition-colors hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg dark:border-border dark:bg-surface-2 dark:hover:bg-surface"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-[11px]">Text size</span>
            <div className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-surface px-1 py-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => updateFontScale(fontScale - 0.1)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-medium text-text hover:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Decrease text size"
              >
                A-
              </button>
              <div className="h-4 w-px bg-border/70" />
              <button
                type="button"
                onClick={() => updateFontScale(1)}
                className="inline-flex h-6 w-8 items-center justify-center rounded-lg text-[11px] font-medium text-text hover:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Reset text size"
              >
                A
              </button>
              <div className="h-4 w-px bg-border/70" />
              <button
                type="button"
                onClick={() => updateFontScale(fontScale + 0.1)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-medium text-text hover:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 justify-center">
          {practiceSteps.length > 0 && (
            <nav
              aria-label="Practice session progress"
              className="flex w-full max-w-[420px] items-start justify-center overflow-x-auto pb-0.5"
            >
              <div className="flex items-stretch gap-0">
                {practiceSteps.map((step, index) => (
                  <div
                    key={`${step.skill}-${step.subtype}-${index}`}
                    className="flex min-w-0 flex-1 basis-0 flex-col items-center"
                  >
                    <div className="flex w-full items-center">
                      <div
                        className={`
                          flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] transition-all
                          ${step.status === "completed" ? "border-success bg-success text-primary-foreground" : ""}
                          ${step.status === "active" && step.hasSubTaskProgress ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-bg" : ""}
                          ${step.status === "active" && !step.hasSubTaskProgress ? "border-border bg-surface text-muted" : ""}
                          ${step.status === "upcoming" ? "border-border bg-surface text-muted" : ""}
                        `}
                      >
                        {step.status === "completed" ? (
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                        ) : (
                          <span className="font-medium">{index + 1}</span>
                        )}
                      </div>
                      {index < practiceSteps.length - 1 && (
                        <div
                          className={`mx-0.5 h-0.5 min-w-[8px] flex-1 max-w-[20px] rounded-full ${
                            step.status === "completed" ? "bg-success/70" : "bg-border"
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="mt-1.5 flex min-w-0 flex-col items-center text-center">
                      <span
                        className={`
                          block text-[11px] font-semibold leading-tight
                          ${step.status === "active" && step.hasSubTaskProgress ? "text-primary" : ""}
                          ${step.status === "active" && !step.hasSubTaskProgress ? "text-muted" : ""}
                          ${step.status === "upcoming" ? "text-muted" : ""}
                          ${step.status === "completed" ? "text-text" : ""}
                        `}
                      >
                        {step.skill} / {step.subtype}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-tight text-muted">
                        {step.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </nav>
          )}
        </div>

        <div className="flex justify-end gap-2 text-xs text-muted">
          {themeReady && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text shadow-sm transition-colors hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg dark:border-border dark:bg-surface-2 dark:hover:bg-surface"
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
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
      </div>

      <div
        className={`transition-opacity duration-[3000ms] ease-out ${
          viewReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
          <ScrollAreaAlwaysVisible className="max-h-[90vh]">
            <article
              onDoubleClick={(event) => {
                const selection = window.getSelection();
                const text = selection ? selection.toString() : "";
                if (!text.trim()) return;
                handleWordLookup(text, event.clientX, event.clientY);
              }}
            >
              <h1 className="text-lg font-semibold text-text">{passage.title}</h1>
              <div className="mt-4 space-y-4 leading-relaxed text-text">
              {passage.paragraphs.map((p, index) => {
                const isFlashHighlighted = highlightedParagraphId === p.id;
                const isSimpleHighlighted = simpleEnglishParagraphId === p.id;
                const isTranslationHighlighted = translationParagraphId === p.id;
                const isViewRelatedHighlighted =
                  viewRelatedParagraphId === p.id;
                const isLinkedHighlighted =
                  isSimpleHighlighted ||
                  isTranslationHighlighted ||
                  isViewRelatedHighlighted;
                return (
                  <p
                    key={p.id}
                    id={`passage-paragraph-${p.id}`}
                    className={`relative rounded-md px-1 transition-colors ${
                      isFlashHighlighted ? "paragraph-highlight-flash" : ""
                    } ${
                      isLinkedHighlighted
                        ? "bg-surface-2/80 border-l-2 border-primary/70 pl-2 dark:bg-surface-2/60"
                        : ""
                    }`}
                    style={{
                      fontSize: `${15 * fontScale}px`,
                    }}
                  >
                    {isLinkedHighlighted && (
                      <span className="mr-1 inline-block align-middle text-[13px] font-semibold text-primary">
                        →
                      </span>
                    )}
                    {p.text}
                  </p>
                );
              })}
              </div>
            </article>
          </ScrollAreaAlwaysVisible>

          <aside className="hidden md:flex max-h-[90vh] flex-col pr-1">
            <ScrollAreaAlwaysVisible className="max-h-[90vh] min-h-0 flex-1">
              <div className="flex flex-col gap-4">
            {COACH_CARDS.map((card, index) => {
              const sections = passage.questionSections ?? [];
              const section = sections[index] ?? null;
              // Always use fixed ranges per card index so each card shows only its questions (1–5, 6–9, 10–13).
              const CARD_RANGES: [number, number][] = [
                [1, 5],
                [6, 9],
                [10, 13],
              ];
              const [startOrder, endOrder] =
                CARD_RANGES[index] ?? CARD_RANGES[0];
              const cardQuestions = passage.questions.filter(
                (q) => q.order >= startOrder && q.order <= endOrder
              );
              const handleHighlightParagraph = (paragraphHint?: number) => {
                if (!paragraphHint) return;
                const idx = paragraphHint - 1; // paragraphHint is 1-based
                const target = passage.paragraphs[idx];
                if (!target) return;

                setHighlightedParagraphId(target.id);

                const el = document.getElementById(
                  `passage-paragraph-${target.id}`
                );
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }

                window.setTimeout(() => {
                  setHighlightedParagraphId((current) =>
                    current === target.id ? null : current
                  );
                }, 1200);
              };

              const handleRequestTranslation = (questionOrder: number) => {
                // Toggle off: if this question's translation is already visible and not loading, hide it.
                if (
                  translationState.questionOrder === questionOrder &&
                  !translationState.loading
                ) {
                  setTranslationState({
                    questionOrder: null,
                    text: "",
                    translatedText: "",
                    loading: false,
                  });
                  setTranslationParagraphId(null);
                  return;
                }

                const q = passage.questions.find(
                  (qq) => qq.order === questionOrder
                );
                if (!q || q.paragraphHint == null) return;

                // Highlight the related paragraph as part of translation flow.
                handleHighlightParagraph(q.paragraphHint);

                const idx = q.paragraphHint - 1;
                const para = passage.paragraphs[idx];
                if (!para) return;
                setTranslationParagraphId(para.id);
                setTranslationState({
                  questionOrder,
                  text: para.text,
                  translatedText: "",
                  loading: true,
                });
                void (async () => {
                  try {
                    const res = await fetch("/api/translate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        text: para.text,
                        sourceLang: "en",
                        // TODO: choose based on user-native language later.
                        targetLang: "bn",
                      }),
                    });
                    const data = await res.json();
                    setTranslationState((prev) => ({
                      ...prev,
                      translatedText: data.translatedText ?? "",
                      loading: false,
                    }));
                  } catch {
                    setTranslationState((prev) => ({
                      ...prev,
                      translatedText:
                        "There was a problem translating this paragraph.",
                      loading: false,
                    }));
                  }
                })();
              };

              const getSimpleParagraphText = (paragraphHint: number): string | null => {
                const idx = paragraphHint - 1;
                const source =
                  passage.simpleParagraphs && passage.simpleParagraphs.length > idx
                    ? passage.simpleParagraphs
                    : passage.paragraphs;
                const para = source[idx];
                return para?.text ?? null;
              };

              const handleSimpleEnglishParagraphHintChange = (
                paragraphHint: number | null
              ) => {
                if (paragraphHint == null) {
                  setSimpleEnglishParagraphId(null);
                  return;
                }
                const idx = paragraphHint - 1;
                const basePara = passage.paragraphs[idx];
                setSimpleEnglishParagraphId(basePara?.id ?? null);
              };

              const handleViewRelatedParagraphToggle = (paragraphHint: number) => {
                const idx = paragraphHint - 1;
                const target = passage.paragraphs[idx];
                if (!target) return;
                if (viewRelatedParagraphId === target.id) {
                  setViewRelatedParagraphId(null);
                  return;
                }
                setViewRelatedParagraphId(target.id);
                const el = document.getElementById(
                  `passage-paragraph-${target.id}`
                );
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                setHighlightedParagraphId(target.id);
                window.setTimeout(() => {
                  setHighlightedParagraphId((current) =>
                    current === target.id ? null : current
                  );
                }, 1200);
              };

              const isViewRelatedActiveForHint = (hint: number) => {
                const p = passage.paragraphs[hint - 1];
                return p ? viewRelatedParagraphId === p.id : false;
              };

              const handleRetry = () => {
                setViewRelatedParagraphId(null);
                setTranslationParagraphId(null);
                setTranslationState({
                  questionOrder: null,
                  text: "",
                  translatedText: "",
                  loading: false,
                });
              };

              const paragraphTextByLetter: Record<string, string> = {};
              passage.paragraphs.forEach((p, i) => {
                const letter = String.fromCharCode(65 + i);
                paragraphTextByLetter[letter] = p.text;
              });

              return (
                <div key={card.id} className="w-full shrink-0">
                  <FlipCoachCard
                    card={card}
                    questions={
                      cardQuestions.length > 0 ? cardQuestions : undefined
                    }
                    section={section ?? undefined}
                    correctAnswers={correctAnswers}
                    paragraphTextByLetter={paragraphTextByLetter}
                    onHighlightParagraph={handleHighlightParagraph}
                    fontScale={fontScale}
                    onRequestTranslation={handleRequestTranslation}
                    translationState={{
                      questionOrder: translationState.questionOrder,
                      translatedText: translationState.translatedText,
                      loading: translationState.loading,
                    }}
                    getSimpleParagraphText={getSimpleParagraphText}
                    onSimpleEnglishParagraphHintChange={
                      handleSimpleEnglishParagraphHintChange
                    }
                    onViewRelatedParagraphToggle={handleViewRelatedParagraphToggle}
                    isViewRelatedActive={isViewRelatedActiveForHint}
                    onRetry={handleRetry}
                    answers={answers}
                    onAnswerChange={(questionId, value) =>
                      setAnswers((prev) => ({ ...prev, [questionId]: value }))
                    }
                  />
                </div>
              );
            })}
              </div>
            </ScrollAreaAlwaysVisible>
          </aside>
        </div>

        {showContinueFooter && (
          <footer className="mt-8 flex shrink-0 justify-center border-t border-border bg-surface/80 py-6">
            <button
              type="button"
              onClick={() => {
                const journey = getJourneySkills();
                if (journey?.includes("writing")) {
                  router.push("/practice/writing/intro");
                } else {
                  router.push("/result");
                }
              }}
              className="rounded-xl border-2 border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
            >
              Continue to next
            </button>
          </footer>
        )}
      </div>
      {lookupState.open && (
        <WordLookupPopup
          word={lookupState.word}
          definition={
            lookupState.loading && !lookupState.definition
              ? "Looking up word..."
              : lookupState.definition || "No definition found."
          }
          synonyms={lookupState.synonyms}
          x={lookupState.x}
          y={lookupState.y}
          onClose={() =>
            setLookupState((prev) => ({ ...prev, open: false }))
          }
        />
      )}
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
  /** Paragraph text by letter (A–H) for Matching correction back (trap vs correct, evidence). */
  paragraphTextByLetter?: Record<string, string>;
  /** Highlight a passage paragraph using its 1-based paragraphHint (if available). */
  onHighlightParagraph?: (paragraphHint?: number) => void;
  /** Font scale factor shared with the passage for comfortable reading. */
  fontScale?: number;
  /** Trigger a translation of a specific question's paragraph text (by order). */
  onRequestTranslation?: (questionOrder: number) => void;
  /** Current translation state for the passage, used to show translation on the back. */
  translationState?: {
    questionOrder: number | null;
    translatedText: string;
    loading: boolean;
  };
  /** Return the simple-English text for a paragraphHint (1-based), if available. */
  getSimpleParagraphText?: (paragraphHint: number) => string | null;
  /** Notify parent which paragraph (by 1-based hint) the simple-English version is showing for, or null to clear. */
  onSimpleEnglishParagraphHintChange?: (paragraphHint: number | null) => void;
  /** Toggle persistent arrow+highlight for the related paragraph (view related). */
  onViewRelatedParagraphToggle?: (paragraphHint: number) => void;
  /** Whether the given paragraph hint is currently "view related" highlighted. */
  isViewRelatedActive?: (paragraphHint: number) => boolean;
  /** Called when user clicks Retry; parent can clear view-related/translation state. */
  onRetry?: () => void;
  /** When set, parent owns answer state for progress tracking. */
  answers?: Record<string, string>;
  onAnswerChange?: (questionId: string, value: string) => void;
};

/** Highlights a phrase inside a text string for evidence display. */
function EvidenceHighlight({ text, phrase }: { text: string; phrase: string }) {
  const i = text.indexOf(phrase);
  if (i === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, i)}
      <mark className="rounded bg-amber-400/60 px-0.5 font-medium text-amber-950 dark:bg-amber-300/50 dark:text-amber-950">
        {phrase}
      </mark>
      {text.slice(i + phrase.length)}
    </span>
  );
}

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

/** Plain-English explanation for each TFNG question (1–5) on the diagnosis back. */
const DIAGNOSIS_PLAIN_ENGLISH: Record<
  number,
  { question: string; options?: string[] }
> = {
  1: {
    question:
      "When people concentrate deeply on a task, do they notice time more or less?",
    options: ["More", "Less", "Not mentioned"],
  },
  2: {
    question:
      "When people feel fear or excitement, can events feel like they are happening in slow motion?",
    options: ["Yes", "No", "The passage doesn't say"],
  },
  3: {
    question:
      "Does the brain store all experiences in memory with equal detail?",
    options: ["Yes", "No", "The passage doesn't say"],
  },
  4: {
    question:
      "Do some psychologists think that time feels faster as we get older because each year becomes a smaller part of our life?",
    options: ["Yes", "No", "The passage doesn't say"],
  },
  5: {
    question:
      "In cultures where punctuality is very important, do people become more aware of time passing?",
    options: ["Yes", "No", "The passage doesn't say"],
  },
};

/** 3D flip card: front text → click → flip → back text. See REQUIRED FLIP CARD BEHAVIOUR above. */
function FlipCoachCard({
  card,
  questions,
  section,
  correctAnswers,
  paragraphTextByLetter,
  onHighlightParagraph,
  fontScale,
  onRequestTranslation,
  translationState,
  getSimpleParagraphText,
  onSimpleEnglishParagraphHintChange,
  onViewRelatedParagraphToggle,
  isViewRelatedActive,
  onRetry,
  answers: answersProp,
  onAnswerChange,
}: FlipCoachCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showBackFace, setShowBackFace] = useState(false);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const answers = answersProp ?? localAnswers;
  const setAnswer = useCallback(
    (questionId: string, value: string) => {
      if (onAnswerChange) {
        onAnswerChange(questionId, value);
      } else {
        setLocalAnswers((prev) => ({ ...prev, [questionId]: value }));
      }
    },
    [onAnswerChange]
  );
  const [diagnoseQuestionOrder, setDiagnoseQuestionOrder] = useState<
    number | null
  >(null);
  const [matchingDiagnoseQuestionOrder, setMatchingDiagnoseQuestionOrder] =
    useState<number | null>(null);
  const [showSimpleEnglish, setShowSimpleEnglish] = useState(false);
  const [simpleEnglishText, setSimpleEnglishText] = useState<string>("");

  /** Matching correction flow: reset when the diagnosed question changes. */
  const [meaningBlocksClicked, setMeaningBlocksClicked] = useState(0);
  const [stage2CorrectChosen, setStage2CorrectChosen] = useState(false);
  const [stage2TrapChosen, setStage2TrapChosen] = useState(false);
  const [evidenceRevealed, setEvidenceRevealed] = useState(false);
  useEffect(() => {
    setMeaningBlocksClicked(0);
    setStage2CorrectChosen(false);
    setStage2TrapChosen(false);
    setEvidenceRevealed(false);
  }, [matchingDiagnoseQuestionOrder]);

  // Avoid showing the back/OK face in the initial server render,
  // so we don't flash it on refresh before hydration.
  useEffect(() => {
    setShowBackFace(true);
  }, []);

  const hasQuestions = questions && questions.length > 0;
  const scale = fontScale ?? 1;
  const diagnosisQuestion =
    diagnoseQuestionOrder != null
      ? questions?.find((q) => q.order === diagnoseQuestionOrder)
      : null;
  const showDiagnosisBack =
    diagnoseQuestionOrder != null &&
    (questions?.some((q) => q.order === diagnoseQuestionOrder) ?? false);

  const matchingDiagnoseQuestion =
    matchingDiagnoseQuestionOrder != null
      ? questions?.find((q) => q.order === matchingDiagnoseQuestionOrder)
      : null;
  const showMatchingDiagnosisBack =
    matchingDiagnoseQuestionOrder != null &&
    (questions?.some((q) => q.order === matchingDiagnoseQuestionOrder) ?? false);

  const handleAnswerSelect = (q: ReadingQuestion, value: string) => {
    setAnswer(q.id, value);
    if (
      q.type === "TFNG" &&
      q.order >= 1 &&
      q.order <= 5 &&
      correctAnswers?.[q.order] &&
      !isAnswerCorrect(q.type, value, correctAnswers[q.order])
    ) {
      setDiagnoseQuestionOrder(q.order);
      setFlipped(true);
    }
  };

  const handleMatchingAnswerSelect = (q: ReadingQuestion, value: string) => {
    setAnswer(q.id, value);
    if (
      q.type === "MATCHING_INFO" &&
      q.order >= 6 &&
      q.order <= 9 &&
      correctAnswers?.[q.order] &&
      !isAnswerCorrect(q.type, value, correctAnswers[q.order])
    ) {
      setMatchingDiagnoseQuestionOrder(q.order);
      setFlipped(true);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setFlipped((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((prev) => !prev);
        }
      }}
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
              <div
                className="flex flex-col gap-2 pr-1 text-text"
                style={{ fontSize: `${13 * scale}px`, lineHeight: 1.6 }}
              >
                {section ? (
                  <>
                    <h3 className="text-[15px] font-semibold text-text leading-snug">
                      {section.title}
                    </h3>
                    <p className="text-[13px] font-medium text-text leading-snug">
                      {section.subtitle}
                    </p>
                    <ul className="list-none space-y-1 pl-0 text-[12px] text-muted leading-relaxed">
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
                            <p className="min-w-0 flex-1 text-text" style={{ lineHeight: 1.55 }}>
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
                                        q.type === "TFNG" &&
                                        q.order >= 1 &&
                                        q.order <= 5
                                          ? handleAnswerSelect(q, opt)
                                          : setAnswer(q.id, opt)
                                      }
                                      className={`rounded-md border px-2.5 py-1.5 text-[12px] font-medium uppercase tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 ${
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
                                handleMatchingAnswerSelect(q, e.target.value)
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
                      <h3 className="text-[15px] font-semibold text-text leading-snug">
                        Questions {questions[0]?.order ?? 1}–
                        {questions[questions.length - 1]?.order ?? questions.length}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-muted leading-relaxed">
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
                            <p className="min-w-0 flex-1 text-[13px] text-text" style={{ lineHeight: 1.55 }}>
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
                                        q.type === "TFNG" &&
                                        q.order >= 1 &&
                                        q.order <= 5
                                          ? handleAnswerSelect(q, opt)
                                          : setAnswer(q.id, opt)
                                      }
                                      className={`rounded-md border px-2.5 py-1.5 text-[12px] font-medium uppercase tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 ${
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
                                handleMatchingAnswerSelect(q, e.target.value)
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
              <div className="text-[14px] font-semibold text-text leading-snug">
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

        {showBackFace && showDiagnosisBack && diagnosisQuestion && (
          <div
            className="flip-card-face flip-card-back flex min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <>
                <div className="shrink-0 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2.5 text-[12px] dark:border-amber-500/40 dark:bg-amber-500/15">
                  <p className="font-semibold text-text leading-snug">
                    Question {diagnosisQuestion.order}
                  </p>
                  <p className="mt-0.5 text-text leading-relaxed" style={{ lineHeight: 1.55 }}>
                    {diagnosisQuestion.prompt}
                  </p>
                  <p className="mt-1 text-muted leading-relaxed">
                    Your answer: {answers[diagnosisQuestion.id] ?? "—"}
                  </p>
                  <p className="mt-1 font-medium text-amber-700 dark:text-amber-300">
                    Let's diagnose the mistake.
                  </p>
                </div>
                <div className="min-w-0 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px] text-text">
                  <p className="font-semibold text-text leading-snug">
                    What does the question mean in plain English?
                  </p>
                  <p className="mt-1 leading-relaxed" style={{ lineHeight: 1.55 }}>
                    {DIAGNOSIS_PLAIN_ENGLISH[diagnosisQuestion.order]?.question ??
                      "Re-read the related paragraph and check whether the statement agrees with, contradicts, or is not mentioned in the passage."}
                  </p>
                  {(DIAGNOSIS_PLAIN_ENGLISH[diagnosisQuestion.order]?.options
                    ?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {DIAGNOSIS_PLAIN_ENGLISH[
                        diagnosisQuestion.order
                      ]?.options?.map((opt, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex min-w-0 flex-nowrap items-stretch gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          diagnosisQuestion.paragraphHint &&
                          onViewRelatedParagraphToggle
                        ) {
                          onViewRelatedParagraphToggle(
                            diagnosisQuestion.paragraphHint
                          );
                        }
                      }}
                      className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-center text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface ${
                        isViewRelatedActive?.(diagnosisQuestion.paragraphHint ?? 0)
                          ? "border-primary bg-primary/15 text-primary dark:bg-primary/25"
                          : "border-border bg-surface text-text hover:bg-surface-2"
                      }`}
                    >
                      View related paragraph
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSimpleEnglish(false);
                        setSimpleEnglishText("");
                        if (onSimpleEnglishParagraphHintChange) {
                          onSimpleEnglishParagraphHintChange(null);
                        }
                        onRetry?.();
                        setFlipped(false);
                        window.setTimeout(() => {
                          setDiagnoseQuestionOrder(null);
                        }, 1000);
                      }}
                      className="min-w-0 flex-1 rounded-lg bg-primary px-2.5 py-1.5 text-center text-[12px] font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface"
                    >
                      Retry this question
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex min-w-0 flex-nowrap items-stretch gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        diagnosisQuestion?.paragraphHint &&
                        getSimpleParagraphText
                      ) {
                        if (showSimpleEnglish) {
                          setShowSimpleEnglish(false);
                          if (onSimpleEnglishParagraphHintChange) {
                            onSimpleEnglishParagraphHintChange(null);
                          }
                          return;
                        }
                        const text = getSimpleParagraphText(
                          diagnosisQuestion.paragraphHint
                        );
                        if (text) {
                          setSimpleEnglishText(text);
                          setShowSimpleEnglish(true);
                          if (onSimpleEnglishParagraphHintChange) {
                            onSimpleEnglishParagraphHintChange(
                              diagnosisQuestion.paragraphHint
                            );
                          }
                        } else {
                          setSimpleEnglishText(
                            "A simple-English version of this paragraph is not available."
                          );
                          setShowSimpleEnglish(true);
                        }
                      }
                    }}
                    className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-center text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface ${
                      showSimpleEnglish
                        ? "border-primary bg-primary/15 text-primary dark:bg-primary/25"
                        : "border-border bg-surface text-text hover:bg-surface-2"
                    }`}
                  >
                    Simple English paragraph
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRequestTranslation && diagnosisQuestion.order) {
                        onRequestTranslation(diagnosisQuestion.order);
                      }
                    }}
                    className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-center text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface ${
                      translationState &&
                      translationState.questionOrder === diagnosisQuestion.order &&
                      !translationState.loading
                        ? "border-primary bg-primary/15 text-primary dark:bg-primary/25"
                        : "border-border bg-surface text-text hover:bg-surface-2"
                    }`}
                  >
                    Translate paragraph
                  </button>
                </div>
                {showSimpleEnglish && simpleEnglishText && (
                  <div className="mt-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px] text-text">
                    <p className="font-semibold text-text leading-snug">
                      Simple English version
                    </p>
                    <p className="mt-1 text-text leading-relaxed" style={{ lineHeight: 1.55 }}>{simpleEnglishText}</p>
                  </div>
                )}
                {translationState &&
                  translationState.questionOrder ===
                    diagnosisQuestion.order && (
                    <div className="mt-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px] text-text">
                      <p className="font-semibold text-text leading-snug">Translation</p>
                      <p className="mt-1 text-text leading-relaxed" style={{ lineHeight: 1.55 }}>
                        {translationState.loading
                          ? "Translating paragraph..."
                          : translationState.translatedText ||
                            "No translation available."}
                      </p>
                    </div>
                  )}
            </>
          </div>
        )}

        {showBackFace && showMatchingDiagnosisBack && matchingDiagnoseQuestion && (() => {
          const config = MATCHING_CORRECTION_CONFIG[matchingDiagnoseQuestion.order] as MatchingCorrectionStep | undefined;
          const blocksComplete = config ? meaningBlocksClicked >= config.meaningBlocks.length : false;
          const canShowAnswer = blocksComplete && stage2CorrectChosen && evidenceRevealed;

          return (
          <div
            className="flip-card-face flip-card-back flex min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2.5 text-[12px] dark:border-amber-500/40 dark:bg-amber-500/15">
              <p className="font-semibold text-text leading-snug">
                Question {matchingDiagnoseQuestion.order}
              </p>
              <p className="mt-0.5 text-text leading-relaxed" style={{ lineHeight: 1.55 }}>
                {matchingDiagnoseQuestion.prompt}
              </p>
              <p className="mt-1 text-muted leading-relaxed">
                Your answer: {answers[matchingDiagnoseQuestion.id] ?? "—"}
              </p>
              {canShowAnswer && (
                <p className="mt-1 font-medium text-amber-700 dark:text-amber-300">
                  Correct answer: {correctAnswers?.[matchingDiagnoseQuestion.order] ?? "—"}
                </p>
              )}
            </div>

            {config && (
              <>
                {/* Stage 1 — Question decomposition: click through meaning blocks */}
                <div className="min-w-0 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px] text-text">
                  <p className="font-semibold text-text leading-snug">
                    Stage 1 — Question decomposition
                  </p>
                  <p className="mt-1 text-muted leading-snug">
                    Click each meaning block so you process the full question.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {config.meaningBlocks.map((block, i) => {
                      const revealed = i < meaningBlocksClicked;
                      const isCurrent = i === meaningBlocksClicked;
                      const disabled = !isCurrent && !revealed;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={disabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent && meaningBlocksClicked < config.meaningBlocks.length) {
                              setMeaningBlocksClicked((c) => c + 1);
                            }
                          }}
                          className={`rounded-lg border px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-60 disabled:pointer-events-none ${
                            revealed
                              ? "border-green-600/50 bg-green-500/15 text-text dark:border-green-500/50 dark:bg-green-500/20"
                              : "border-border bg-surface text-text hover:border-primary/50 hover:bg-surface-2"
                          }`}
                        >
                          {revealed ? `✓ ${block}` : isCurrent ? `Click: ${block}` : `—`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stage 2 — Trap confrontation: choose correct paragraph */}
                {blocksComplete && (
                  <div className="min-w-0 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px] text-text">
                    <p className="font-semibold text-text leading-snug">
                      Stage 2 — Trap confrontation
                    </p>
                    <p className="mt-1 leading-relaxed" style={{ lineHeight: 1.55 }}>
                      {config.comparisonPrompt}
                    </p>
                    {stage2TrapChosen && !stage2CorrectChosen && (
                      <p className="mt-2 rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-800 dark:text-amber-200">
                        {config.trapReasonShort} Which one actually matches?
                      </p>
                    )}
                    {stage2CorrectChosen && (
                      <p className="mt-2 rounded border border-green-600/40 bg-green-500/10 px-2 py-1.5 text-[11px] text-green-800 dark:text-green-200">
                        {config.correctReasonShort}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStage2TrapChosen(true);
                        }}
                        className={`rounded-lg border-2 px-3 py-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          stage2CorrectChosen ? "border-border bg-surface-2 text-muted" : "border-border bg-surface text-text hover:border-primary/50"
                        }`}
                      >
                        Paragraph {config.trapLetter}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStage2CorrectChosen(true);
                        }}
                        className={`rounded-lg border-2 px-3 py-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          stage2CorrectChosen ? "border-green-600 bg-green-500/20 text-green-800 dark:text-green-200" : "border-border bg-surface text-text hover:border-primary/50"
                        }`}
                      >
                        Paragraph {config.correctLetter}
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 3 — Evidence alignment */}
                {stage2CorrectChosen && (
                  <div className="min-w-0 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px] text-text">
                    <p className="font-semibold text-text leading-snug">
                      Stage 3 — Evidence alignment
                    </p>
                    {!evidenceRevealed ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvidenceRevealed(true);
                        }}
                        className="mt-2 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Reveal the evidence
                      </button>
                    ) : (
                      <p className="mt-2 leading-relaxed" style={{ lineHeight: 1.55 }}>
                        <EvidenceHighlight text={config.evidenceContext} phrase={config.evidencePhrase} />
                      </p>
                    )}
                  </div>
                )}

                {/* Stage 4 — Takeaway (and answer shown above when canShowAnswer) */}
                {evidenceRevealed && (
                  <div className="min-w-0 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[12px] text-text">
                    <p className="font-semibold text-text leading-snug">
                      Stage 4 — Strategy takeaway
                    </p>
                    <p className="mt-1 leading-relaxed font-medium text-primary" style={{ lineHeight: 1.55 }}>
                      {config.takeaway}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry?.();
                  setFlipped(false);
                  window.setTimeout(() => {
                    setMatchingDiagnoseQuestionOrder(null);
                  }, 1000);
                }}
                className="w-full rounded-lg bg-primary px-2.5 py-1.5 text-center text-[12px] font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface"
              >
                Retry this question
              </button>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}
