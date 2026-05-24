import { NextResponse } from "next/server";
import {
  getStudyStats,
  getAllUserProgress,
} from "@/lib/store";

export async function GET() {
  const stats = getStudyStats();
  const progress = getAllUserProgress();

  return NextResponse.json({
    ...stats,
    knowledgePointProgress: progress,
  });
}
