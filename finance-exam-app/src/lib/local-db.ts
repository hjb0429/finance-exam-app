/**
 * Local database for offline use.
 * Mirrors server data in localStorage for full offline feature parity.
 * All quiz progress persists regardless of network status.
 */

const DB_VERSION = 1;

interface LocalDB {
  version: number;
  questions: Map<number, LocalQuestion>;
  quizHistory: LocalAttempt[];
  lastSync: string;
}

export interface LocalQuestion {
  id: number;
  type: string;
  stem: string;
  options: string[];
  answer: string;
  analysis: string;
}

interface LocalAttempt {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: string;
  synced: boolean;
}

const STORAGE_KEY = "finance_exam_db";

function loadDB(): LocalDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const questions = new Map<number, LocalQuestion>();
      if (parsed.questions) {
        for (const [key, val] of Object.entries(parsed.questions)) {
          questions.set(Number(key), val as LocalQuestion);
        }
      }
      return {
        version: parsed.version || 0,
        questions,
        quizHistory: parsed.quizHistory || [],
        lastSync: parsed.lastSync || "",
      };
    }
  } catch {
    // corrupted data, start fresh
  }
  return { version: DB_VERSION, questions: new Map(), quizHistory: [], lastSync: "" };
}

function saveDB(db: LocalDB) {
  try {
    const data = {
      version: db.version,
      questions: Object.fromEntries(db.questions),
      quizHistory: db.quizHistory.slice(-500), // keep last 500 attempts
      lastSync: db.lastSync,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full, try clearing old history
    try {
      const db2 = { ...db, quizHistory: db.quizHistory.slice(-100) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db2));
    } catch {
      // give up
    }
  }
}

/** Cache questions for offline search and browsing */
export function cacheQuestions(questions: LocalQuestion[]) {
  const db = loadDB();
  for (const q of questions) {
    db.questions.set(q.id, q);
  }
  db.lastSync = new Date().toISOString();
  saveDB(db);
}

/** Get a cached question */
export function getCachedQuestion(id: number): LocalQuestion | null {
  return loadDB().questions.get(id) || null;
}

/** Record a quiz attempt (always, not just offline) */
export function recordAttempt(
  questionId: number,
  userAnswer: string,
  isCorrect: boolean
) {
  const db = loadDB();
  db.quizHistory.push({
    questionId,
    userAnswer,
    isCorrect,
    timestamp: new Date().toISOString(),
    synced: false,
  });
  saveDB(db);
}

/** Mark an attempt as synced to server */
export function markAttemptSynced(index: number) {
  const db = loadDB();
  if (db.quizHistory[index]) {
    db.quizHistory[index].synced = true;
    saveDB(db);
  }
}

/** Get all quiz history (for analysis page) */
export function getQuizHistory(): LocalAttempt[] {
  return loadDB().quizHistory;
}

/** Get stats from local data */
export function getLocalStats(): {
  totalAttempts: number;
  correctCount: number;
  correctRate: number;
} {
  const history = loadDB().quizHistory;
  const total = history.length;
  const correct = history.filter((a) => a.isCorrect).length;
  return {
    totalAttempts: total,
    correctCount: correct,
    correctRate: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}

/** Search cached questions locally */
export function searchLocalQuestions(query: string): LocalQuestion[] {
  const db = loadDB();
  const q = query.toLowerCase();
  const results: LocalQuestion[] = [];
  for (const question of db.questions.values()) {
    if (question.stem.toLowerCase().includes(q)) {
      results.push(question);
    }
  }
  return results;
}

/** Get unsynced attempts */
export function getUnsyncedAttempts(): LocalAttempt[] {
  return loadDB().quizHistory.filter((a) => !a.synced);
}

/** Sync unsynced attempts to server */
export async function syncAttemptsToServer(): Promise<number> {
  const unsynced = getUnsyncedAttempts();
  let synced = 0;

  for (let i = 0; i < unsynced.length; i++) {
    const attempt = unsynced[i];
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
        // Find and mark in original array
        const db = loadDB();
        const idx = db.quizHistory.findIndex(
          (a) =>
            a.questionId === attempt.questionId &&
            a.timestamp === attempt.timestamp
        );
        if (idx >= 0) {
          db.quizHistory[idx].synced = true;
          saveDB(db);
        }
      }
    } catch {
      // still offline
      break;
    }
  }
  return synced;
}

/** Check if online */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

/** Auto-sync on reconnect */
export function setupAutoSync(): () => void {
  const handler = () => {
    if (isOnline()) {
      syncAttemptsToServer();
    }
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
