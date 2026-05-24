import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgePoints, searchQuestions } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all"; // all | knowledge | question

  if (!q.trim()) {
    return NextResponse.json({ knowledgePoints: [], questions: [] });
  }

  let knowledgePoints: unknown[] = [];
  let questions: unknown[] = [];

  if (type === "all" || type === "knowledge") {
    knowledgePoints = searchKnowledgePoints(q);
  }
  if (type === "all" || type === "question") {
    questions = searchQuestions(q);
  }

  return NextResponse.json({ knowledgePoints, questions });
}
