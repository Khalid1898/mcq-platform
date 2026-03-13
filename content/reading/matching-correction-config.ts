/**
 * Config for the Matching Information correction flow (back-of-card).
 * One entry per question order (e.g. 6–9). Content authors can add more
 * passages/questions by adding entries and paragraph text mapping.
 */

export type MatchingCorrectionStep = {
  /** Stage 1: 2–3 meaning blocks the learner must click through. */
  meaningBlocks: string[];
  /** Stage 2: The paragraph letter (A–H) that is the likely trap. */
  trapLetter: string;
  /** Stage 2: The correct paragraph letter. */
  correctLetter: string;
  /** Stage 2: Prompt for comparing trap vs correct. */
  comparisonPrompt: string;
  /** Stage 2: Short reason the trap is tempting (shown if learner picks trap). */
  trapReasonShort: string;
  /** Stage 2: Short reason the correct paragraph matches (shown after correct choice). */
  correctReasonShort: string;
  /** Stage 3: Exact phrase from the passage to highlight as evidence. */
  evidencePhrase: string;
  /** Stage 3: Full sentence or snippet containing the evidence (for display). */
  evidenceContext: string;
  /** Stage 4: One short reusable rule. */
  takeaway: string;
};

export type MatchingCorrectionConfig = Record<number, MatchingCorrectionStep>;

/** Correction config for passage-001, questions 6–9. */
export const MATCHING_CORRECTION_CONFIG: MatchingCorrectionConfig = {
  6: {
    meaningBlocks: [
      "new experiences (novelty)",
      "how long a period seems",
      "in hindsight / looking back later",
    ],
    trapLetter: "C",
    correctLetter: "D",
    comparisonPrompt:
      "Which paragraph links new experiences to how long a period feels when you look back?",
    trapReasonShort:
      "Paragraph C also mentions memory, but it's about emotion and encoding—not novelty making a period feel longer in retrospect.",
    correctReasonShort:
      "Paragraph D explicitly links novelty (e.g. travel) to feeling longer in retrospect because of more unique memories.",
    evidencePhrase: "often feel longer in retrospect because they contain more unique memories",
    evidenceContext:
      "Periods filled with novelty—such as traveling to a new country—often feel longer in retrospect because they contain more unique memories.",
    takeaway: "Match the full meaning chain, not one shared keyword.",
  },
  7: {
    meaningBlocks: [
      "specific parts of the brain",
      "named regions or structures",
      "processing time / temporal processing",
    ],
    trapLetter: "A",
    correctLetter: "G",
    comparisonPrompt:
      "Which paragraph gives named brain regions involved in time processing?",
    trapReasonShort:
      "Paragraph A talks about the brain and time in general but does not name specific brain parts.",
    correctReasonShort:
      "Paragraph G names the basal ganglia and prefrontal cortex and links them to temporal processing.",
    evidencePhrase: "networks in the basal ganglia and prefrontal cortex that appear to regulate temporal processing",
    evidenceContext:
      "Recent research using brain imaging techniques has identified networks in the basal ganglia and prefrontal cortex that appear to regulate temporal processing.",
    takeaway:
      "When the prompt asks for 'specific parts,' broad relevance is not enough; named evidence wins.",
  },
  8: {
    meaningBlocks: [
      "emotional intensity (fear, excitement, etc.)",
      "affect memory formation",
      "how memories are created / encoded",
    ],
    trapLetter: "D",
    correctLetter: "C",
    comparisonPrompt:
      "Which paragraph links emotional intensity to how memories are formed or encoded?",
    trapReasonShort:
      "Paragraph D discusses memory and novelty, but the cause is new experiences—not emotional intensity.",
    correctReasonShort:
      "Paragraph C describes how emotionally intense events are encoded into memory with greater detail.",
    evidencePhrase: "emotionally intense events are encoded into memory with greater detail",
    evidenceContext:
      "Neuroscientists suggest that this may not be because the brain processes information more slowly, but because emotionally intense events are encoded into memory with greater detail.",
    takeaway:
      "When two paragraphs share a theme, the real key is the cause named in the prompt.",
  },
  9: {
    meaningBlocks: [
      "social or cultural habits",
      "punctuality, scheduling, or culture",
      "influence perception of time",
    ],
    trapLetter: "A",
    correctLetter: "F",
    comparisonPrompt:
      "Which paragraph is about culture or social habits affecting how people experience time?",
    trapReasonShort:
      "Paragraph A mentions cultural expectations briefly but is about general time perception, not habits or punctuality.",
    correctReasonShort:
      "Paragraph F focuses on cultural factors: punctuality, scheduling, and how different cultures shape time perception.",
    evidencePhrase: "Cultural factors may also shape how time is experienced",
    evidenceContext:
      "Cultural factors may also shape how time is experienced. In societies that emphasize punctuality and strict scheduling, time is treated as a limited commodity.",
    takeaway:
      "First identify the domain of the question: emotion, memory, brain, age, or culture.",
  },
};
