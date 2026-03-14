"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { MilestoneStep } from "@/components/milestone-progress";

type PracticeProgressState = {
  steps: MilestoneStep[];
};

const PracticeProgressContext = createContext<{
  steps: MilestoneStep[];
  setSteps: (steps: MilestoneStep[]) => void;
}>({
  steps: [],
  setSteps: () => {},
});

export function PracticeProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PracticeProgressState>({ steps: [] });
  const setSteps = useCallback((steps: MilestoneStep[]) => {
    setState((prev) => ({ ...prev, steps }));
  }, []);

  return (
    <PracticeProgressContext.Provider value={{ steps: state.steps, setSteps }}>
      {children}
    </PracticeProgressContext.Provider>
  );
}

export function usePracticeProgress() {
  return useContext(PracticeProgressContext);
}
