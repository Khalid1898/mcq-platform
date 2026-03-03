"use client";

import { useCallback, useEffect, useState } from "react";
import {
  IeltsState,
  awardTask,
  getBandEstimate,
  loadState,
  saveState,
  type SkillId,
  type TaskId,
} from "./ielts-state";

type UseIeltsState = {
  ready: boolean;
  state: IeltsState;
  band: number;
  refresh: () => void;
  completeTask: (options: {
    taskId: TaskId;
    score: number | null;
    maxScore: number | null;
    baseXP: number;
    skillGains: Partial<Record<SkillId, number>>;
  }) => void;
};

const initial: IeltsState = loadState();

export function useIeltsState(): UseIeltsState {
  const [state, setState] = useState<IeltsState>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  const refresh = useCallback(() => {
    setState(loadState());
  }, []);

  const completeTask: UseIeltsState["completeTask"] = useCallback(
    (options) => {
      setState((prev) => awardTask({ state: prev, ...options }));
    },
    []
  );

  const band = getBandEstimate(state);

  return { ready, state, band, refresh, completeTask };
}

