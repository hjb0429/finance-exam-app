import { NextRequest, NextResponse } from "next/server";
import {
  getAllQuestions,
  getQuestionsByChapterId,
  getQuestionsByKnowledgePointId,
} from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");
  const knowledgePointId = searchParams.get("knowledgePointId");
  const mode = searchParams.get("mode") || "all"; // all | weak | random
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  let questions = getAllQuestions();

  if (chapterId) {
    questions = getQuestionsByChapterId(parseInt(chapterId, 10));
  } else if (knowledgePointId) {
    questions = getQuestionsByKnowledgePointId(
      parseInt(knowledgePointId, 10)
    );
  }

  // TODO: "weak" mode - filter questions for weak knowledge points
  // This will be implemented when the analysis engine is built

  if (mode === "random") {
    // Shuffle using Fisher-Yates
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  }

  const paginated = questions.slice(0, limit);

  return NextResponse.json({
    questions: paginated,
    total: questions.length,
    page: 1,
    pageSize: limit,
  });
}
