"use client";

import { useEffect, useState } from "react";
import { Check, Moon, RotateCw, Sun, X } from "lucide-react";
import { useTheme } from "@/app/ThemeProvider";
import { Input } from "@/components/ui/input";
import { WordLookupPopup } from "@/components/WordLookupPopup";
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

export function PassageOnlyView({ passage, correctAnswers }: Props) {
  const { theme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const [viewReady, setViewReady] = useState(false);
  const [fontScale, setFontScale] = useState(1);
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
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted">
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
        <div className="flex items-center justify-end gap-2 text-xs text-muted">
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
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
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

              return (
                <div key={card.id} className="w-full shrink-0">
                  <FlipCoachCard
                    card={card}
                    questions={
                      cardQuestions.length > 0 ? cardQuestions : undefined
                    }
                    section={section ?? undefined}
                    correctAnswers={correctAnswers}
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
                  />
                </div>
              );
            })}
          </aside>
        </div>
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
  onHighlightParagraph,
  fontScale,
  onRequestTranslation,
  translationState,
  getSimpleParagraphText,
  onSimpleEnglishParagraphHintChange,
  onViewRelatedParagraphToggle,
  isViewRelatedActive,
  onRetry,
}: FlipCoachCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showBackFace, setShowBackFace] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnoseQuestionOrder, setDiagnoseQuestionOrder] = useState<
    number | null
  >(null);
  const [showSimpleEnglish, setShowSimpleEnglish] = useState(false);
  const [simpleEnglishText, setSimpleEnglishText] = useState<string>("");

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

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

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
                className="flex flex-col gap-2 pr-1 leading-relaxed text-text"
                style={{ fontSize: `${12 * scale}px` }}
              >
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
                            <p className="min-w-0 flex-1 leading-relaxed text-text">
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
                                        q.type === "TFNG" &&
                                        q.order >= 1 &&
                                        q.order <= 5
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

        {showBackFace && showDiagnosisBack && diagnosisQuestion && (
          <div
            className="flip-card-face flip-card-back flex min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <>
                <div className="shrink-0 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-[11px] dark:border-amber-500/40 dark:bg-amber-500/15">
                  <p className="font-semibold text-text">
                    Question {diagnosisQuestion.order}
                  </p>
                  <p className="mt-0.5 leading-relaxed text-text">
                    {diagnosisQuestion.prompt}
                  </p>
                  <p className="mt-1 text-muted">
                    Your answer: {answers[diagnosisQuestion.id] ?? "—"}
                  </p>
                  <p className="mt-1 font-medium text-amber-700 dark:text-amber-300">
                    Let's diagnose the mistake.
                  </p>
                </div>
                <div className="min-w-0 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px] text-text">
                  <p className="font-semibold text-text">
                    What does the question mean in plain English?
                  </p>
                  <p className="mt-1">
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
                          className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted"
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
                      className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-center text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface ${
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
                      className="min-w-0 flex-1 rounded-lg bg-primary px-2.5 py-1.5 text-center text-[11px] font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface"
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
                    className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-center text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface ${
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
                    className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-center text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:ring-offset-surface ${
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
                  <div className="mt-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-text">
                    <p className="font-semibold text-text">
                      Simple English version
                    </p>
                    <p className="mt-1 text-text">{simpleEnglishText}</p>
                  </div>
                )}
                {translationState &&
                  translationState.questionOrder ===
                    diagnosisQuestion.order && (
                    <div className="mt-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-text">
                      <p className="font-semibold text-text">Translation</p>
                      <p className="mt-1 text-text">
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
      </div>
    </div>
  );
}
