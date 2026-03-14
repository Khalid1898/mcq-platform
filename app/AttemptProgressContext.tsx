"use client";

import { createContext, useCallback, useContext, useState } from "react";

type AttemptProgress = { current: number; total: number } | null;

const AttemptProgressContext = createContext<{
  progress: AttemptProgress;
  setProgress: (current: number, total: number) => void;
  clearProgress: () => void;
}>({
  progress: null,
  setProgress: () => {},
  clearProgress: () => {},
});

export function AttemptProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgressState] = useState<AttemptProgress>(null);
  const setProgress = useCallback((current: number, total: number) => {
    setProgressState({ current, total });
  }, []);
  const clearProgress = useCallback(() => {
    setProgressState(null);
  }, []);
  return (
    <AttemptProgressContext.Provider
      value={{ progress, setProgress, clearProgress }}
    >
      {children}
    </AttemptProgressContext.Provider>
  );
}

export function useAttemptProgress() {
  return useContext(AttemptProgressContext);
}
