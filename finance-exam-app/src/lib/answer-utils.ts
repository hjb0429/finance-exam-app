/**
 * Normalize and compare quiz answers.
 * Handles format differences between AI output and user input.
 */
import type { QuestionType } from "./types";

/** Map Chinese true/false to A/B */
function normalizeTrueFalse(raw: string): string {
  const t = raw.trim();
  if (/^(true|正确|对|是|a)$/i.test(t)) return "A";
  if (/^(false|错误|错|否|b)$/i.test(t)) return "B";
  return t.toUpperCase();
}

/** Normalize a stored answer to its canonical form (single letter or concatenated letters) */
export function normalizeAnswer(raw: string, type: QuestionType): string {
  const trimmed = raw.trim();

  switch (type) {
    case "true_false":
      return normalizeTrueFalse(trimmed);

    case "single_choice":
      // Could be "A" or "B" etc. Just uppercase.
      return trimmed.toUpperCase().charAt(0);

    case "multi_choice": {
      // Could be "ABC", "A,B,C", "A、B、C", "ABD", etc.
      // Extract all uppercase letters
      const letters = trimmed.match(/[A-Za-z]/g);
      if (!letters || letters.length === 0) return trimmed.toUpperCase();
      return [...new Set(letters.map((l) => l.toUpperCase()))].sort().join("");
    }

    case "calculation":
      return trimmed;

    default:
      return trimmed.toUpperCase();
  }
}

/** Normalize a user-submitted answer to canonical form */
export function normalizeUserAnswer(raw: string, type: QuestionType): string {
  const trimmed = raw.trim();

  switch (type) {
    case "true_false":
      return trimmed.toUpperCase().charAt(0);

    case "single_choice":
      return trimmed.toUpperCase().charAt(0);

    case "multi_choice": {
      // User submits "A,C" or "A" or "A,B,C"
      const letters = trimmed.match(/[A-Za-z]/g);
      if (!letters || letters.length === 0) return trimmed.toUpperCase();
      return [...new Set(letters.map((l) => l.toUpperCase()))].sort().join("");
    }

    case "calculation":
      return trimmed;

    default:
      return trimmed.toUpperCase();
  }
}

/** Check if a user answer matches the correct answer */
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  type: QuestionType
): boolean {
  const normalizedUser = normalizeUserAnswer(userAnswer, type);
  const normalizedCorrect = normalizeAnswer(correctAnswer, type);
  return normalizedUser === normalizedCorrect;
}

/** Get default options for true/false questions */
export function getTrueFalseOptions(): string[] {
  return ["A. 正确", "B. 错误"];
}
