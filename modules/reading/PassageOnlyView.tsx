"use client";

import type { ReadingPassage } from "@/lib/content/reading";

type Props = {
  passage: ReadingPassage;
};

export function PassageOnlyView({ passage }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article>
        <h1 className="text-lg font-semibold text-text">{passage.title}</h1>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-text">
          {passage.paragraphs.map((p) => (
            <p key={p.id}>{p.text}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
