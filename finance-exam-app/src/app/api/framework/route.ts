import { NextResponse } from "next/server";
import {
  getAllChapters,
  getSectionsByChapterId,
  getKnowledgePointsBySectionId,
} from "@/lib/store";

export async function GET() {
  const chapters = getAllChapters();

  const framework = chapters.map((chapter) => ({
    ...chapter,
    sections: getSectionsByChapterId(chapter.id).map((section) => ({
      ...section,
      knowledgePoints: getKnowledgePointsBySectionId(section.id),
    })),
  }));

  return NextResponse.json({ chapters: framework });
}
