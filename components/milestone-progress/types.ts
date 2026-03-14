/**
 * Milestone progress component – types for IELTS-style practice journey tracker.
 */

export type MilestoneStatus = "completed" | "active" | "upcoming";

export interface MilestoneStep {
  /** Main skill label, e.g. Reading, Writing, Listening, Speaking */
  skill: string;
  /** Subtask type, e.g. TFNG, Paragraph Matching, Task 1 */
  subtype: string;
  /** Small progress/status text, e.g. "13 questions", "3 of 7 complete" */
  meta: string;
  status: MilestoneStatus;
  /** When true and status is "active", show as in-progress (e.g. green). When false, active step shows grey until user completes one sub task. */
  hasSubTaskProgress?: boolean;
}

export interface MilestoneProgressProps {
  steps: MilestoneStep[];
  /** Optional aria label for the progress track */
  ariaLabel?: string;
  className?: string;
}
