"use client";

import { WritingEditor } from "@/components/writing-exam";

export interface SharedWritingLayoutProps {
  /** Left panel: question/prompt content */
  leftPanel: React.ReactNode;
  /** Controlled editor value */
  value: string;
  /** Editor change handler */
  onChange: (value: string) => void;
  /** Placeholder for the editor */
  editorPlaceholder?: string;
  /** Aria label for the editor */
  editorAriaLabel?: string;
}

/**
 * Shared split layout for all writing screens: left question panel, right editor.
 * Exam-like, minimal styling.
 */
export function SharedWritingLayout({
  leftPanel,
  value,
  onChange,
  editorPlaceholder = "Write your answer here...",
  editorAriaLabel = "Writing answer",
}: SharedWritingLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] min-h-[480px] flex-col bg-neutral-100 dark:bg-neutral-950 md:flex-row">
      <aside
        className="w-full border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 md:w-[40%] md:min-w-[280px] md:max-w-[480px]"
        aria-label="Question"
      >
        <div className="h-full overflow-y-auto px-6 py-6">{leftPanel}</div>
      </aside>
      <main
        className="flex min-h-[320px] flex-1 flex-col border-t border-neutral-200 p-4 md:border-t-0 md:min-w-0 dark:border-neutral-800"
        aria-label="Answer"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <WritingEditor
            value={value}
            onChange={onChange}
            placeholder={editorPlaceholder}
            aria-label={editorAriaLabel}
            showCharacterCount
          />
        </div>
      </main>
    </div>
  );
}
