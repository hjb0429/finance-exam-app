import { NextRequest, NextResponse } from "next/server";
import { parsePdfToStructured } from "@/lib/pdf-parser";
import { importParsedContent } from "@/lib/store";
import { isAiConfigured } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    if (!isAiConfigured()) {
      return NextResponse.json(
        {
          error: "AI API 未配置",
          message:
            "请在 .env 文件中设置 AI_API_KEY。推荐使用 DeepSeek API: https://platform.deepseek.com/",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "请上传PDF文件" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "仅支持PDF文件格式" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const parsed = await parsePdfToStructured(buffer);
    const result = importParsedContent(parsed);

    return NextResponse.json({
      success: true,
      ...result,
      framework: {
        chapters: parsed.chapters.length,
        questions: parsed.questions.length,
      },
    });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      {
        error: "PDF解析失败",
        message: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
