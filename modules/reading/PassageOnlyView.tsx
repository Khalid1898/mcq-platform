"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import type { ReadingPassage } from "@/lib/content/reading";

type Props = {
  passage: ReadingPassage;
};

/**
 * REQUIRED FLIP CARD BEHAVIOUR (do not break when changing layout/styling/content):
 * - Front side shows one text (frontTitle). User sees it by default.
 * - On click, the card flips (3D rotateY animation) and reveals the back side.
 * - Back side shows different text (backTitle). Click again flips back to front.
 * - No mirroring: both sides must show readable text (not mirrored). Uses CSS
 *   .flip-card, .flip-card-inner, .flip-card-face, .flip-card-back + backface-visibility.
 * Any change (e.g. adding images, new copy) must preserve: front text → click → flip → back text.
 */

type CoachCard = {
  id: string;
  frontTitle: string;
  backTitle: string;
};

const COACH_CARDS: CoachCard[] = [
  {
    id: "card-1",
    frontTitle:
      "Click to set what you should do before reading a single line.",
    backTitle: "Back of card 1 – fill with your own coaching later.",
  },
  {
    id: "card-2",
    frontTitle: "Click to define your time‑plan tip.",
    backTitle: "Back of card 2 – your content goes here.",
  },
  {
    id: "card-3",
    frontTitle: "Click to define how to use the question types.",
    backTitle: "Back of card 3 – your content goes here.",
  },
];

export function PassageOnlyView({ passage }: Props) {
  return (
    <div className="w-full px-2 py-4 sm:px-4 md:px-6 lg:px-8">
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 hover:bg-surface"
        >
          <span>←</span>
          <span>Home</span>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
        <article>
          <h1 className="text-lg font-semibold text-text">{passage.title}</h1>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-text">
            {passage.paragraphs.map((p) => (
              <p key={p.id}>{p.text}</p>
            ))}
          </div>
        </article>

        <aside className="hidden md:flex max-h-[80vh] flex-col gap-4 overflow-y-auto pr-1">
          {COACH_CARDS.map((card) => (
            <FlipCoachCard key={card.id} card={card} />
          ))}
        </aside>
      </div>
    </div>
  );
}

type FlipCoachCardProps = {
  card: CoachCard;
};

/** 3D flip card: front text → click → flip → back text. See REQUIRED FLIP CARD BEHAVIOUR above. */
function FlipCoachCard({ card }: FlipCoachCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((prev) => !prev)}
      className={`flip-card group relative min-h-[180px] w-full cursor-pointer rounded-2xl bg-transparent p-0 text-left ${
        flipped ? "is-flipped" : ""
      }`}
    >
      <div className="flip-card-inner h-full min-h-[180px] w-full rounded-2xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-surface-2 shadow-md">
        <div className="flip-card-face flip-card-front relative flex h-full flex-col justify-center gap-3 px-4 py-3">
          <div className="text-[13px] font-semibold text-text">
            {card.frontTitle}
          </div>
          <div
            className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-400/90 px-3 py-2 text-amber-900 shadow-md ring-2 ring-amber-500/30"
            aria-hidden="true"
          >
            <RotateCw className="h-5 w-5 shrink-0" strokeWidth={2.5} />
            <span className="text-xs font-semibold">
              Click here and rotate the card
            </span>
          </div>
        </div>

        <div className="flip-card-face flip-card-back flex h-full flex-col justify-center gap-3 px-4 py-3">
          <div className="text-[13px] font-semibold text-text">
            {card.backTitle}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="h-12 w-12 shrink-0 rounded-lg bg-green-500 font-semibold text-white shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            OK
          </button>
        </div>
      </div>
    </button>
  );
}
