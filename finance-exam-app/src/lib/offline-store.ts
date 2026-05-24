/**
 * Offline storage for quiz attempts.
 * Saves attempts to localStorage when offline, syncs when online.
 */
import { checkAnswer } from "./answer-utils";
import type { QuestionType } from "./types";

const QUEUE_KEY = "offline_quiz_queue";
const STATS_KEY = "offline_quiz_stats";

interface QueuedAttempt {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: string;
}

interface OfflineStats {
  totalAttempts: number;
  correctAttempts: number;
  kpCorrect: Record<number, number>;
  kpTotal: Record<number, number>;
}

export function getOfflineQueue(): QueuedAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addOfflineAttempt(
  questionId: number,
  userAnswer: string,
  correctAnswer: string,
  questionType: QuestionType
): boolean {
  const isCorrect = checkAnswer(userAnswer, correctAnswer, questionType);
  const attempt: QueuedAttempt = {
    questionId,
    userAnswer,
    isCorrect,
    timestamp: new Date().toISOString(),
  };

  // Save to queue
  const queue = getOfflineQueue();
  queue.push(attempt);
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage full
  }

  // Update local stats
  updateOfflineStats(attempt);

  return isCorrect;
}

function updateOfflineStats(attempt: QueuedAttempt) {
  try {
    const raw = localStorage.getItem(STATS_KEY) || "{}";
    const stats: OfflineStats = JSON.parse(raw);
    stats.totalAttempts = (stats.totalAttempts || 0) + 1;
    stats.correctAttempts = (stats.correctAttempts || 0) + (attempt.isCorrect ? 1 : 0);
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function getOfflineStats(): OfflineStats {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
  } catch {
    return { totalAttempts: 0, correctAttempts: 0, kpCorrect: {}, kpTotal: {} };
  }
}

/** Sync queued attempts to server */
export async function syncOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let synced = 0;
  const remaining: QueuedAttempt[] = [];

  for (const attempt of queue) {
    try {
      const res = await fetch("/api/questions/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: attempt.questionId,
          userAnswer: attempt.userAnswer,
        }),
      });
      if (res.ok) {
        synced++;
      } else {
        remaining.push(attempt);
      }
    } catch {
      remaining.push(attempt);
    }
  }

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    // ignore
  }

  return synced;
}

/** Check if online */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

/** Listen for online event and sync */
export function setupAutoSync(): () => void {
  const handler = () => {
    if (isOnline()) {
      syncOfflineQueue().then((n) => {
        if (n > 0) console.log(`Synced ${n} offline attempts`);
      });
    }
  };

  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
