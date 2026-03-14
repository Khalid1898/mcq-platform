"use client";

import { WordCounter } from "./WordCounter";

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export interface WritingEditorProps {
  /** Controlled value. */
  value: string;
  /** Called when the user types. */
  onChange: (value: string) => void;
  /** Placeholder when empty. */
  placeholder?: string;
  /** Accessibility label. */
  "aria-label"?: string;
  /** Whether to show character count in the status row. */
  showCharacterCount?: boolean;
}

/**
 * Right-panel writing workspace: large textarea with live word count (and optional character count).
 * Styled like a document editor for exam conditions.
 */
export function WritingEditor({
  value,
  onChange,
  placeholder = "Write your answer here...",
  "aria-label": ariaLabel = "Writing answer",
  showCharacterCount = true,
}: WritingEditorProps) {
  const wordCount = countWords(value);
  const characterCount = value.length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col rounded-sm border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <textarea
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[280px] flex-1 w-full resize-none rounded-sm border-0 bg-transparent px-5 py-4 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 outline-none dark:bg-transparent dark:text-neutral-100 dark:placeholder:text-neutral-500"
          style={{ minHeight: "clamp(280px, 50vh, 800px)" }}
        />
        <div className="shrink-0 border-t border-neutral-200 px-4 py-2 dark:border-neutral-700">
          <WordCounter
            count={wordCount}
            characterCount={showCharacterCount ? characterCount : undefined}
          />
        </div>
      </div>
    </div>
  );
}
