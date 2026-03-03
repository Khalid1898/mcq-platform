import type { SessionItem, SkillId } from "./session-types";

let itemsCache: SessionItem[] | null = null;

function loadItems(): SessionItem[] {
  if (itemsCache) return itemsCache;
  try {
    const data = require("../data/session-items.json") as RawSessionItem[];
    itemsCache = data.map(normalizeItem);
    return itemsCache;
  } catch {
    return [];
  }
}

type RawSessionItem = {
  id: string;
  type: string;
  skill: string;
  prompt: string;
  passage?: string;
  options?: string[];
  statements?: { id: string; text: string; correct: string }[];
  blanks?: { id: string; correct: string }[];
  wordBank?: string[];
  correctAnswer?: number | null;
  explanation: string;
  coachTips: { validates: string; trap: string; mentalModel: string };
};

function normalizeItem(raw: RawSessionItem): SessionItem {
  return {
    id: raw.id,
    type: raw.type as SessionItem["type"],
    skill: raw.skill as SkillId,
    prompt: raw.prompt,
    passage: raw.passage,
    options: raw.options,
    statements: raw.statements?.map((s) => ({
      ...s,
      correct: s.correct as "true" | "false" | "not_given",
    })),
    blanks: raw.blanks,
    wordBank: raw.wordBank,
    correctAnswer: raw.correctAnswer ?? null,
    explanation: raw.explanation,
    coachTips: raw.coachTips,
  };
}

const ITEMS_PER_SESSION_MIN = 1;
const ITEMS_PER_SESSION_MAX = 3;

export function getItemsForSkills(skills: SkillId[], count?: number): SessionItem[] {
  const pool = loadItems();
  const filtered = pool.filter((i) => skills.includes(i.skill));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const n = Math.min(
    count ?? Math.min(ITEMS_PER_SESSION_MAX, Math.max(ITEMS_PER_SESSION_MIN, shuffled.length)),
    shuffled.length
  );
  return shuffled.slice(0, n);
}
