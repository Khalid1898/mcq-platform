"use client";

import {
  MilestoneProgress,
  SAMPLE_MILESTONE_STEPS,
} from "@/components/milestone-progress";

export default function ProgressDemoPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">
          Milestone progress (demo)
        </h1>
        <p className="mt-1 text-sm text-muted">
          Horizontal journey tracker for practice sessions. Shown when user
          starts practice.
        </p>
      </div>

      <section
        className="rounded-xl border border-border bg-surface px-5 py-5 shadow-sm"
        aria-labelledby="demo-progress-heading"
      >
        <h2
          id="demo-progress-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Practice Session Progress
        </h2>
        <MilestoneProgress
          steps={SAMPLE_MILESTONE_STEPS}
          ariaLabel="Practice session progress"
        />
      </section>
    </div>
  );
}
