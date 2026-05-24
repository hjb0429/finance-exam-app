/**
 * Simple JSON file store for development.
 * Replace with Prisma/Supabase for production.
 */

import fs from "fs";
import path from "path";
import type {
  Chapter,
  Section,
  KnowledgePoint,
  Question,
  QuizAttempt,
  UserProgress,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

interface StoreData {
  chapters: Chapter[];
  sections: Section[];
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
  quizAttempts: QuizAttempt[];
  userProgress: UserProgress[];
}

const defaultData: StoreData = {
  chapters: [],
  sections: [],
  knowledgePoints: [],
  questions: [],
  quizAttempts: [],
  userProgress: [],
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): StoreData {
  ensureDir();
  const filePath = path.join(DATA_DIR, "store.json");
  if (!fs.existsSync(filePath)) {
    writeStore(defaultData);
    return { ...defaultData };
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as StoreData;
}

function writeStore(data: StoreData): void {
  ensureDir();
  const filePath = path.join(DATA_DIR, "store.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

let nextId = 1;
function genId(): number {
  nextId = Math.max(nextId, Date.now());
  return nextId++;
}

// ---- Chapters ----

export function getAllChapters(): Chapter[] {
  const store = readStore();
  return store.chapters.sort((a, b) => a.order - b.order);
}

export function getChapterById(id: number): Chapter | undefined {
  const store = readStore();
  const chapter = store.chapters.find((c) => c.id === id);
  if (!chapter) return undefined;
  chapter.sections = store.sections
    .filter((s) => s.chapterId === id)
    .sort((a, b) => a.order - b.order);
  return chapter;
}

export function createChapter(data: Partial<Chapter>): Chapter {
  const store = readStore();
  const chapter: Chapter = {
    id: genId(),
    title: data.title || "",
    order: data.order || store.chapters.length + 1,
    guideSummary: data.guideSummary,
    changeSummary: data.changeSummary,
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.chapters.push(chapter);
  writeStore(store);
  return chapter;
}

// ---- Sections ----

export function getSectionsByChapterId(chapterId: number): Section[] {
  const store = readStore();
  return store.sections
    .filter((s) => s.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);
}

export function createSection(data: Partial<Section>): Section {
  const store = readStore();
  const section: Section = {
    id: genId(),
    chapterId: data.chapterId || 0,
    title: data.title || "",
    order: data.order || 1,
    knowledgePoints: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.sections.push(section);
  writeStore(store);
  return section;
}

// ---- Knowledge Points ----

export function getKnowledgePointsBySectionId(
  sectionId: number
): KnowledgePoint[] {
  const store = readStore();
  return store.knowledgePoints
    .filter((kp) => kp.sectionId === sectionId)
    .sort((a, b) => a.id - b.id);
}

export function getKnowledgePointById(
  id: number
): KnowledgePoint | undefined {
  const store = readStore();
  return store.knowledgePoints.find((kp) => kp.id === id);
}

export function createKnowledgePoint(
  data: Partial<KnowledgePoint>
): KnowledgePoint {
  const store = readStore();
  const kp: KnowledgePoint = {
    id: genId(),
    sectionId: data.sectionId || 0,
    title: data.title || "",
    content: data.content || "",
    masteryLevel: "unlearned",
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.knowledgePoints.push(kp);
  writeStore(store);
  return kp;
}

export function updateKnowledgePointMastery(
  id: number,
  masteryLevel: string
): void {
  const store = readStore();
  const kp = store.knowledgePoints.find((k) => k.id === id);
  if (kp) {
    kp.masteryLevel = masteryLevel as KnowledgePoint["masteryLevel"];
    kp.updatedAt = new Date().toISOString();
    writeStore(store);
  }
}

// ---- Questions ----

export function getQuestionsByKnowledgePointId(
  kpId: number
): Question[] {
  const store = readStore();
  return store.questions.filter((q) => q.knowledgePointId === kpId);
}

export function getQuestionById(id: number): Question | undefined {
  const store = readStore();
  return store.questions.find((q) => q.id === id);
}

export function getAllQuestions(): Question[] {
  return readStore().questions;
}

export function getQuestionsByChapterId(chapterId: number): Question[] {
  const store = readStore();
  const sectionIds = store.sections
    .filter((s) => s.chapterId === chapterId)
    .map((s) => s.id);
  const kpIds = store.knowledgePoints
    .filter((kp) => sectionIds.includes(kp.sectionId))
    .map((kp) => kp.id);
  return store.questions.filter((q) => kpIds.includes(q.knowledgePointId));
}

export function createQuestion(data: Partial<Question>): Question {
  const store = readStore();
  const question: Question = {
    id: genId(),
    knowledgePointId: data.knowledgePointId || 0,
    type: data.type || "single_choice",
    stem: data.stem || "",
    options: data.options || [],
    answer: data.answer || "",
    analysis: data.analysis || "",
    difficulty: data.difficulty || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.questions.push(question);
  writeStore(store);
  return question;
}

// ---- Quiz Attempts ----

export function createQuizAttempt(
  data: Partial<QuizAttempt>
): QuizAttempt {
  const store = readStore();
  const attempt: QuizAttempt = {
    id: genId(),
    questionId: data.questionId || 0,
    userAnswer: data.userAnswer || "",
    isCorrect: data.isCorrect || false,
    createdAt: new Date().toISOString(),
  };
  store.quizAttempts.push(attempt);

  // Update user progress
  const question = store.questions.find((q) => q.id === attempt.questionId);
  if (question) {
    const kpId = question.knowledgePointId;
    let progress = store.userProgress.find(
      (p) => p.knowledgePointId === kpId
    );
    if (!progress) {
      progress = {
        knowledgePointId: kpId,
        correctCount: 0,
        totalCount: 0,
        masteryScore: 0,
      };
      store.userProgress.push(progress);
    }
    progress.totalCount++;
    if (attempt.isCorrect) {
      progress.correctCount++;
    }
    progress.masteryScore = Math.round(
      (progress.correctCount / progress.totalCount) * 100
    );
    // Update knowledge point mastery level
    const kp = store.knowledgePoints.find((k) => k.id === kpId);
    if (kp) {
      if (progress.masteryScore >= 80) {
        kp.masteryLevel = "mastered";
      } else if (progress.masteryScore >= 40) {
        kp.masteryLevel = "weak";
      } else {
        kp.masteryLevel = "unlearned";
      }
      kp.updatedAt = new Date().toISOString();
    }
  }

  writeStore(store);
  return attempt;
}

export function getQuizAttemptsCount(): number {
  return readStore().quizAttempts.length;
}

export function getTodayQuizAttemptsCount(): number {
  const today = new Date().toISOString().split("T")[0];
  return readStore().quizAttempts.filter((a) =>
    a.createdAt.startsWith(today)
  ).length;
}

// ---- User Progress ----

export function getAllUserProgress(): UserProgress[] {
  return readStore().userProgress;
}

export function getUserProgressByKpId(
  kpId: number
): UserProgress | undefined {
  return readStore().userProgress.find((p) => p.knowledgePointId === kpId);
}

// ---- Statistics ----

export function getStudyStats() {
  const store = readStore();
  const chaptersWithContent = store.chapters.filter((c) =>
    store.sections.some((s) => s.chapterId === c.id)
  );
  const totalKp = store.knowledgePoints.length;
  const masteredKp = store.knowledgePoints.filter(
    (k) => k.masteryLevel === "mastered"
  ).length;
  const totalQuestions = store.questions.length;
  const totalAttempts = store.quizAttempts.length;
  const correctAttempts = store.quizAttempts.filter((a) => a.isCorrect).length;

  // Calculate study days (unique days with attempts)
  const days = new Set(
    store.quizAttempts.map((a) => a.createdAt.split("T")[0])
  );

  // Chapter breakdown with accurate KP counts
  const chapterBreakdown = store.chapters.map((ch) => {
    const chapterSections = store.sections.filter(
      (s) => s.chapterId === ch.id
    );
    const kpCount = store.knowledgePoints.filter((kp) =>
      chapterSections.some((s) => s.id === kp.sectionId)
    ).length;
    const masteredCount = store.knowledgePoints.filter(
      (kp) =>
        chapterSections.some((s) => s.id === kp.sectionId) &&
        kp.masteryLevel === "mastered"
    ).length;
    return {
      chapterId: ch.id,
      title: ch.title,
      totalKnowledgePoints: kpCount,
      masteredKnowledgePoints: masteredCount,
    };
  });

  return {
    studyDays: days.size,
    completedChapters: chaptersWithContent.length,
    totalChapters: store.chapters.length,
    totalKnowledgePoints: totalKp,
    masteredKnowledgePoints: masteredKp,
    totalQuestions,
    totalAttempts,
    correctRate:
      totalAttempts > 0
        ? Math.round((correctAttempts / totalAttempts) * 100)
        : 0,
    weakPoints: store.knowledgePoints.filter(
      (k) => k.masteryLevel === "weak"
    ).length,
    chapterBreakdown,
  };
}

// ---- Search ----

export function searchKnowledgePoints(query: string): KnowledgePoint[] {
  const store = readStore();
  const lower = query.toLowerCase();
  return store.knowledgePoints.filter(
    (kp) =>
      kp.title.toLowerCase().includes(lower) ||
      kp.content.toLowerCase().includes(lower)
  );
}

export function searchQuestions(query: string): Question[] {
  const store = readStore();
  const lower = query.toLowerCase();
  return store.questions.filter(
    (q) =>
      q.stem.toLowerCase().includes(lower) ||
      q.analysis.toLowerCase().includes(lower)
  );
}

// ---- Bulk Import (for AI parsed results) ----

export function importParsedContent(data: {
  chapters: Array<{
    title: string;
    order: number;
    sections: Array<{
      title: string;
      order: number;
      knowledgePoints: Array<{
        title: string;
        content: string;
      }>;
    }>;
  }>;
  questions: Array<{
    knowledgePointTitle: string;
    type: Question["type"];
    stem: string;
    options: string[];
    answer: string;
    analysis: string;
    difficulty: number;
  }>;
}): { chaptersImported: number; questionsImported: number } {
  const store = readStore();
  let chaptersImported = 0;
  let questionsImported = 0;

  for (const chData of data.chapters) {
    const chapter = {
      id: genId(),
      title: chData.title,
      order: chData.order,
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Chapter;
    store.chapters.push(chapter);
    chaptersImported++;

    for (const secData of chData.sections) {
      const section = {
        id: genId(),
        chapterId: chapter.id,
        title: secData.title,
        order: secData.order,
        knowledgePoints: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Section;
      store.sections.push(section);

      for (const kpData of secData.knowledgePoints) {
        const kp = {
          id: genId(),
          sectionId: section.id,
          title: kpData.title,
          content: kpData.content,
          masteryLevel: "unlearned",
          questions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as KnowledgePoint;
        store.knowledgePoints.push(kp);

        // Match questions to this knowledge point by title
        const matchedQuestions = data.questions.filter(
          (q) => q.knowledgePointTitle === kpData.title
        );
        for (const qData of matchedQuestions) {
          const question = {
            id: genId(),
            knowledgePointId: kp.id,
            type: qData.type,
            stem: qData.stem,
            options: qData.options,
            answer: qData.answer,
            analysis: qData.analysis,
            difficulty: qData.difficulty || 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Question;
          store.questions.push(question);
          questionsImported++;
        }
      }
    }
  }

  writeStore(store);
  return { chaptersImported, questionsImported };
}
