"use client";

import { BookOpen, PenLine, Headphones, MessageCircle } from "lucide-react";
import type { SkillId } from "@/lib/session-types";
import { cn } from "@/lib/utils";

const SKILLS: { id: SkillId; label: string; icon: React.ElementType }[] = [
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "writing", label: "Writing", icon: PenLine },
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "speaking", label: "Speaking", icon: MessageCircle },
];

type Props = {
  selected: SkillId[];
  onToggle: (skill: SkillId) => void;
  disabled?: boolean;
};

export function SkillTiles({ selected, onToggle, disabled }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SKILLS.map(({ id, label, icon: Icon }) => {
        const isSelected = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(id)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all",
              "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isSelected
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-surface",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                isSelected ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted"
              )}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className="font-semibold text-text">{label}</span>
            {isSelected && (
              <span className="ml-auto rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                On
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
