import fs from "fs/promises";
import path from "path";

export type ReadingQuestionType =
  | "TFNG"
  | "MATCHING_INFO"
  | "SENTENCE_COMPLETION";

export type ReadingCoachTips = {
  validates: string;
  trap: string;
  mentalModel: string;
};

export type ReadingQuestion = {
  id: string;
  type: ReadingQuestionType;
  order: number;
  paragraphHint?: number;
  prompt: string;
  options?: string[];
  blanks?: string[];
  correctAnswer: string | string[] | Record<string, unknown>;
  explanation: string;
  coachTips: ReadingCoachTips;
};

export type ReadingParagraph = {
  id: string;
  text: string;
};

/** Section heading and instructions shown before a block of questions (e.g. Questions 1–5, TRUE/FALSE, Write: ...). */
export type ReadingQuestionSection = {
  /** First question order (1-based) in this section. */
  startOrder: number;
  /** Last question order (1-based) inclusive. */
  endOrder: number;
  /** e.g. "Questions 1–5" */
  title: string;
  /** e.g. "TRUE / FALSE / NOT GIVEN" */
  subtitle: string;
  /** Instruction lines shown verbatim (exam-style), e.g. ["Write:", "TRUE if the statement agrees with the passage", ...]. */
  instructions: string[];
};

export type ReadingPassage = {
  id: string;
  title: string;
  level?: "easy" | "medium" | "hard";
  paragraphs: ReadingParagraph[];
  questions: ReadingQuestion[];
  /** Optional: section titles and instructions for the question list (card 1). */
  questionSections?: ReadingQuestionSection[];
};

export async function loadReadingPassage(
  id: string
): Promise<ReadingPassage> {
  const filePath = path.join(
    process.cwd(),
    "content",
    "reading",
    `${id}.json`
  );
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as ReadingPassage;
  return parsed;
}

/** Answer key: question order (1-based) → correct answer string. */
export type ReadingPassageAnswers = {
  passageId: string;
  byOrder: Record<string, string>;
};

/** Load answer key for a passage. Returns map of question order → correct answer. */
export async function loadReadingPassageAnswers(
  passageId: string
): Promise<Record<number, string>> {
  const filePath = path.join(
    process.cwd(),
    "content",
    "reading",
    `${passageId}-answers.json`
  );
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as ReadingPassageAnswers;
  const result: Record<number, string> = {};
  for (const [key, value] of Object.entries(parsed.byOrder ?? {})) {
    const order = Number(key);
    if (!Number.isNaN(order)) result[order] = value;
  }
  return result;
}

