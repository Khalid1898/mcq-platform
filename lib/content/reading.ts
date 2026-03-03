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

export type ReadingPassage = {
  id: string;
  title: string;
  level?: "easy" | "medium" | "hard";
  paragraphs: ReadingParagraph[];
  questions: ReadingQuestion[];
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

