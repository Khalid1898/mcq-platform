"use client";

import { useCallback, useEffect } from "react";
import { AcademicWritingExamLayout } from "@/components/writing-exam";
import type { AcademicWritingExamData } from "@/components/writing-exam";
import type { MilestoneStep } from "@/components/milestone-progress";
import { usePracticeProgress } from "@/app/PracticeProgressContext";

const EXAMPLE_EXAM: AcademicWritingExamData = {
  task1: {
    taskLabel: "WRITING TASK 1",
    instruction: "You should spend about 20 minutes on this task.",
    prompt:
      "The chart below shows the percentage of households using three different internet connection types between 2005 and 2020.",
    summariseInstruction:
      "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    wordRequirement: "Write at least 150 words.",
  },
  task2: {
    taskLabel: "WRITING TASK 2",
    instruction: "You should spend about 40 minutes on this task.",
    prompt: `Some people believe that working from home is beneficial for employees and employers, while others think it reduces productivity.

Discuss both views and give your own opinion.

Give reasons for your answer and include relevant examples from your own knowledge or experience.`,
    wordRequirement: "Write at least 250 words.",
  },
};

const WRITING_PRACTICE_STEPS: MilestoneStep[] = [
  {
    skill: "Writing",
    subtype: "Task 1 & 2",
    meta: "0 responses",
    status: "active",
    hasSubTaskProgress: false,
  },
];

export default function WritingPracticePage() {
  const { setSteps } = usePracticeProgress();

  useEffect(() => {
    setSteps(WRITING_PRACTICE_STEPS);
  }, [setSteps]);

  const handleSubTaskProgress = useCallback(() => {
    setSteps([
      {
        ...WRITING_PRACTICE_STEPS[0],
        hasSubTaskProgress: true,
      },
    ]);
  }, [setSteps]);

  return (
    <div className="-mx-2 -my-6 sm:-mx-4 md:-mx-6 lg:-mx-8">
      <AcademicWritingExamLayout
        examData={EXAMPLE_EXAM}
        onSubTaskProgress={handleSubTaskProgress}
      />
    </div>
  );
}
