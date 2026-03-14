import type { SkillId } from "@/lib/session-types";

const KEY = "mcq-journey-skills";

export function setJourneySkills(skills: SkillId[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(skills));
  } catch {
    // ignore
  }
}

export function getJourneySkills(): SkillId[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SkillId[]) : null;
  } catch {
    return null;
  }
}

export function clearJourneySkills(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
