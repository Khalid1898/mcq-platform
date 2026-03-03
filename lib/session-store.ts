import type { Session, SessionItem } from "./session-types";
import { getItemsForSkills } from "./question-bank";

const sessions: Map<string, Session> =
  (globalThis as any).__mcq_sessions ??
  ((globalThis as any).__mcq_sessions = new Map<string, Session>());

const XP_PER_CORRECT = 10;

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createSession(selectedSkills: string[]): Session {
  const skills = selectedSkills.filter((s): s is "reading" | "writing" | "listening" | "speaking" =>
    ["reading", "writing", "listening", "speaking"].includes(s)
  );
  const items = getItemsForSkills(skills.length ? skills : ["reading", "writing", "listening", "speaking"]);
  const session: Session = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    selectedSkills: skills,
    items,
    currentIndex: 0,
    xpEarned: 0,
    completed: false,
    answers: [],
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | null {
  return sessions.get(id) ?? null;
}

function evaluateSingleChoice(item: SessionItem, selectedIndex: number): boolean {
  const correct = item.correctAnswer as number;
  return typeof correct === "number" && selectedIndex === correct;
}

function evaluateTrueFalseNg(item: SessionItem, answers: Record<string, "true" | "false" | "not_given">): boolean {
  if (!item.statements) return false;
  return item.statements.every((s) => answers[s.id] === s.correct);
}

function evaluateGapFill(item: SessionItem, answers: Record<string, string>): boolean {
  if (!item.blanks) return false;
  return item.blanks.every((b) => (answers[b.id] ?? "").trim().toLowerCase() === b.correct.trim().toLowerCase());
}

function evaluateShortAnswer(_item: SessionItem, text: string): boolean {
  return text.trim().length > 0;
}

export function submitAnswer(
  sessionId: string,
  itemId: string,
  payload: { type: string; selectedIndex?: number; answers?: Record<string, string | "true" | "false" | "not_given">; text?: string }
): { correct: boolean; xpDelta: number; nextItem: SessionItem | null; sessionComplete: boolean } | null {
  const session = sessions.get(sessionId);
  if (!session || session.completed) return null;

  const item = session.items.find((i) => i.id === itemId);
  if (!item || session.items[session.currentIndex]?.id !== itemId) return null;

  let correct = false;
  if (item.type === "single_choice" && typeof payload.selectedIndex === "number") {
    correct = evaluateSingleChoice(item, payload.selectedIndex);
  } else if (item.type === "true_false_ng" && payload.answers) {
    correct = evaluateTrueFalseNg(item, payload.answers as Record<string, "true" | "false" | "not_given">);
  } else if (item.type === "gap_fill" && payload.answers) {
    correct = evaluateGapFill(item, payload.answers as Record<string, string>);
  } else if (item.type === "short_answer" && payload.text !== undefined) {
    correct = evaluateShortAnswer(item, payload.text);
  }

  const xpDelta = correct ? XP_PER_CORRECT : 0;
  session.xpEarned += xpDelta;
  session.answers.push({ itemId, correct, xpDelta });
  session.currentIndex += 1;

  const nextItem = session.items[session.currentIndex] ?? null;
  const sessionComplete = session.currentIndex >= session.items.length;
  if (sessionComplete) session.completed = true;

  return { correct, xpDelta, nextItem, sessionComplete };
}
