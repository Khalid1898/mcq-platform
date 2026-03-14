"use client";

import { Check } from "lucide-react";
import type { MilestoneProgressProps, MilestoneStatus } from "./types";

const CIRCLE_SIZE = 24;
const CONNECTOR_HEIGHT = 2;

function StepCircle({ status }: { status: MilestoneStatus }) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isUpcoming = status === "upcoming";

  return (
    <div
      className={`
        flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200
        ${isCompleted ? "border-success bg-success text-primary-foreground" : ""}
        ${isActive ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-bg animate-[pulse_2s_ease-in-out_infinite]" : ""}
        ${isUpcoming ? "border-border bg-surface text-muted" : ""}
      `}
      style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
      aria-hidden
    >
      {isCompleted ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <span className="sr-only">{status}</span>
      )}
    </div>
  );
}

function ConnectorLine({ completed }: { completed: boolean }) {
  return (
    <div
      className="flex flex-1 min-w-[12px] max-w-[32px] items-center px-0.5"
      style={{ height: CIRCLE_SIZE }}
      aria-hidden
    >
      <div
        className={`w-full rounded-full transition-colors ${
          completed ? "bg-success/70" : "bg-border"
        }`}
        style={{ height: CONNECTOR_HEIGHT }}
      />
    </div>
  );
}

function MilestoneStepBlock({
  step,
  isLast,
}: {
  step: { skill: string; subtype: string; meta: string; status: MilestoneStatus };
  isLast: boolean;
}) {
  const isActive = step.status === "active";
  const isUpcoming = step.status === "upcoming";

  return (
    <div className="flex min-w-[100px] max-w-[200px] flex-1 basis-0 items-stretch sm:min-w-[120px]">
      <div
        className={`
          group flex min-w-0 flex-1 flex-col items-center rounded-lg px-2 py-3 transition-all duration-200
          hover:bg-surface-2/50 hover:shadow-sm
          ${isActive ? "bg-surface-2/70" : ""}
        `}
      >
        <div
          className="flex w-full items-center"
          style={{ minHeight: CIRCLE_SIZE }}
        >
          <StepCircle status={step.status} />
          {!isLast && <ConnectorLine completed={step.status === "completed"} />}
        </div>
        <div className="mt-3 flex min-w-0 flex-1 flex-col items-center text-center">
          <span
            className={`
              text-[13px] font-semibold leading-tight
              ${isActive ? "text-primary" : ""}
              ${isUpcoming ? "text-muted" : ""}
              ${step.status === "completed" ? "text-text" : ""}
            `}
          >
            {step.skill}
          </span>
          <span className="mt-0.5 text-[12px] leading-tight text-muted">
            {step.subtype}
          </span>
          <span className="mt-0.5 text-[11px] leading-tight text-muted">
            {step.meta}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MilestoneProgress({
  steps,
  ariaLabel = "Practice session progress",
  className = "",
}: MilestoneProgressProps) {
  if (!steps.length) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={`w-full ${className}`}
    >
      <div className="flex items-stretch gap-0 overflow-x-auto pb-1">
        {steps.map((step, index) => (
          <MilestoneStepBlock
            key={`${step.skill}-${step.subtype}-${index}`}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </nav>
  );
}
