// Data types for the learning platform

export type MasteryLevel = "unlearned" | "weak" | "mastered";
export type QuestionType =
  | "single_choice"
  | "multi_choice"
  | "true_false"
  | "calculation";

export interface Chapter {
  id: number;
  title: string;
  order: number;
  guideSummary?: string;
  changeSummary?: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: number;
  chapterId: number;
  title: string;
  order: number;
  knowledgePoints: KnowledgePoint[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgePoint {
  id: number;
  sectionId: number;
  title: string;
  content: string;
  masteryLevel: MasteryLevel;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  knowledgePointId: number;
  type: QuestionType;
  stem: string;
  options: string[]; // JSON serialized in store
  answer: string;
  analysis: string;
  difficulty: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: number;
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface UserProgress {
  knowledgePointId: number;
  correctCount: number;
  totalCount: number;
  masteryScore: number; // 0-100
}

// Parsed PDF content from AI
export interface ParsedPdfContent {
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
    type: QuestionType;
    stem: string;
    options: string[];
    answer: string;
    analysis: string;
    difficulty: number;
  }>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
