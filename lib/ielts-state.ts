export type SkillId = "reading" | "writing" | "listening" | "speaking";

export type TaskId = "tfng" | "gapFill" | "writingIntro";

export type IeltsState = {
  totalXP: number;
  lastScore: number | null;
  lastXP: number | null;
  completedTasks: TaskId[];
  unlockedTasks: TaskId[];
  skillProgress: Record<SkillId, number>;
};

export const STORAGE_KEY = "ieltsStateV1";

const defaultState: IeltsState = {
  totalXP: 0,
  lastScore: null,
  lastXP: null,
  completedTasks: [],
  unlockedTasks: ["tfng", "gapFill"],
  skillProgress: {
    reading: 0,
    writing: 0,
    listening: 0,
    speaking: 0,
  },
};

export function loadState(): IeltsState {
  if (typeof window === "undefined") return { ...defaultState };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };

    const parsed = JSON.parse(raw) as Partial<IeltsState> | null;

    if (!parsed) return { ...defaultState };

    const merged: IeltsState = {
      ...defaultState,
      ...parsed,
      completedTasks: parsed.completedTasks ?? defaultState.completedTasks,
      unlockedTasks: parsed.unlockedTasks ?? defaultState.unlockedTasks,
      skillProgress: {
        ...defaultState.skillProgress,
        ...(parsed.skillProgress ?? {}),
      },
    };

    return merged;
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state: IeltsState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function awardTask({
  state,
  taskId,
  score,
  maxScore,
  baseXP,
  skillGains,
}: {
  state: IeltsState;
  taskId: TaskId;
  score: number | null;
  maxScore: number | null;
  baseXP: number;
  skillGains: Partial<Record<SkillId, number>>;
}): IeltsState {
  const completedTasks = state.completedTasks.includes(taskId)
    ? state.completedTasks
    : [...state.completedTasks, taskId];

  let unlockedTasks = [...state.unlockedTasks];

  const hasTfng = completedTasks.includes("tfng");
  const hasGapFill = completedTasks.includes("gapFill");
  const writingUnlocked = unlockedTasks.includes("writingIntro");

  if (hasTfng && hasGapFill && !writingUnlocked) {
    unlockedTasks = [...unlockedTasks, "writingIntro"];
  }

  const xpMultiplier =
    score !== null && maxScore && maxScore > 0 ? score / maxScore : 1;

  const gainedXP = Math.round(baseXP * xpMultiplier);

  const nextSkillProgress: Record<SkillId, number> = {
    ...state.skillProgress,
  };

  (Object.keys(skillGains) as SkillId[]).forEach((key) => {
    const gain = skillGains[key];
    if (typeof gain === "number" && gain !== 0) {
      const current = nextSkillProgress[key] ?? 0;
      const updated = Math.max(0, Math.min(100, current + gain));
      nextSkillProgress[key] = updated;
    }
  });

  return {
    ...state,
    totalXP: state.totalXP + gainedXP,
    lastScore: score,
    lastXP: gainedXP,
    completedTasks,
    unlockedTasks,
    skillProgress: nextSkillProgress,
  };
}

export function getBandEstimate(state: IeltsState): number {
  const base = 4;
  const fromXP = state.totalXP / 150;
  const avgSkill =
    (state.skillProgress.reading +
      state.skillProgress.writing +
      state.skillProgress.listening +
      state.skillProgress.speaking) /
    400;

  const band = base + fromXP * 0.7 + avgSkill * 2.3;
  const clamped = Math.max(3, Math.min(9, band));
  return Math.round(clamped * 10) / 10;
}

