/**
 * Embedded data module - imports the JSON store directly.
 * This replaces ALL /api/* server calls for offline use.
 * The JSON data is bundled into the static build.
 */
import storeData from "../../data/store.json";
import guidesData from "../../data/guides.json";
import type {
  Chapter,
  Section,
  KnowledgePoint,
  Question,
  QuizAttempt,
  UserProgress,
} from "./types";

// Re-export for direct use
export { storeData, guidesData };

// ---- Framework ----

export function getFullFramework() {
  const store = storeData as {
    chapters: Chapter[];
    sections: Section[];
    knowledgePoints: KnowledgePoint[];
    questions: Question[];
    quizAttempts: QuizAttempt[];
    userProgress: UserProgress[];
  };

  return store.chapters.map((chapter) => ({
    ...chapter,
    sections: store.sections
      .filter((s) => s.chapterId === chapter.id)
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        ...section,
        knowledgePoints: store.knowledgePoints
          .filter((kp) => kp.sectionId === section.id)
          .sort((a, b) => a.id - b.id),
      })),
  }));
}

// ---- Questions ----

export function getAllQuestions(): Question[] {
  return (storeData as { questions: Question[] }).questions;
}

export function getQuestionsByChapter(chapterId: number): Question[] {
  const store = storeData as {
    chapters: Chapter[];
    sections: Section[];
    knowledgePoints: KnowledgePoint[];
    questions: Question[];
  };
  const sectionIds = store.sections
    .filter((s) => s.chapterId === chapterId)
    .map((s) => s.id);
  const kpIds = store.knowledgePoints
    .filter((kp) => sectionIds.includes(kp.sectionId))
    .map((kp) => kp.id);
  return store.questions.filter((q) => kpIds.includes(q.knowledgePointId));
}

export function getRandomQuestions(limit: number): Question[] {
  const all = getAllQuestions();
  // Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, limit);
}

// ---- Search ----

export function searchLocal(query: string): {
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
} {
  const store = storeData as {
    chapters: Chapter[];
    sections: Section[];
    knowledgePoints: KnowledgePoint[];
    questions: Question[];
  };
  const lower = query.toLowerCase();
  return {
    knowledgePoints: store.knowledgePoints.filter(
      (kp) =>
        kp.title.toLowerCase().includes(lower) ||
        kp.content.toLowerCase().includes(lower)
    ),
    questions: store.questions.filter(
      (q) =>
        q.stem.toLowerCase().includes(lower) ||
        q.analysis.toLowerCase().includes(lower)
    ),
  };
}

// ---- Guides ----

export function getGuides() {
  return guidesData as {
    guide?: { title: string; summary: string; keyPoints: string[] };
    changes?: { title: string; summary: string; keyPoints: string[] };
  };
}
