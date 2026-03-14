"use client";

export interface WordCounterProps {
  count: number;
  /** Optional character count shown in smaller muted text. */
  characterCount?: number;
}

/**
 * Displays live word count (and optional character count) at the bottom of the writing editor.
 */
export function WordCounter({ count, characterCount }: WordCounterProps) {
  return (
    <div className="flex items-center justify-end gap-3 text-[13px]">
      <span className="text-neutral-500 dark:text-neutral-400">
        Word count: {count}
      </span>
      {characterCount !== undefined && (
        <span className="text-[12px] text-neutral-400 dark:text-neutral-500">
          {characterCount} characters
        </span>
      )}
    </div>
  );
}
