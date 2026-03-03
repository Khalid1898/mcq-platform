export type SkillId = "reading" | "writing" | "listening" | "speaking";

export type ItemType =
  | "single_choice"
  | "true_false_ng"
  | "gap_fill"
  | "short_answer";

export type CoachTips = {
  validates: string;
  trap: string;
  mentalModel: string;
};

export type SessionItem = {
  id: string;
  type: ItemType;
  skill: SkillId;
  prompt: string;
  passage?: string;
  options?: string[];
  statements?: { id: string; text: string; correct: "true" | "false" | "not_given" }[];
  blanks?: { id: string; correct: string }[];
  wordBank?: string[];
  correctAnswer: unknown;
  explanation: string;
  coachTips: CoachTips;
};

export type Session = {
  id: string;
  createdAt: string;
  selectedSkills: SkillId[];
  items: SessionItem[];
  currentIndex: number;
  xpEarned: number;
  completed: boolean;
  answers: { itemId: string; correct: boolean; xpDelta: number }[];
};

export type AnswerPayload =
  | { type: "single_choice"; selectedIndex: number }
  | { type: "true_false_ng"; answers: Record<string, "true" | "false" | "not_given"> }
  | { type: "gap_fill"; answers: Record<string, string> }
  | { type: "short_answer"; text: string };
