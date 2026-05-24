import { NextRequest, NextResponse } from "next/server";
import { parsePdfToStructured } from "@/lib/pdf-parser";
import { importParsedContent } from "@/lib/store";
import { isAiConfigured } from "@/lib/ai-service";
import AdmZip from "adm-zip";

interface FileResult {
  fileName: string;
  success: boolean;
  chaptersImported?: number;
  questionsImported?: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: "AI API 未配置",
        message: "请在 .env 文件中设置 AI_API_KEY",
      },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const zipFile = formData.get("zip") as File | null;

    const allFiles: File[] = [];

    // Handle ZIP file
    if (zipFile && zipFile.name.endsWith(".zip")) {
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
      const zip = new AdmZip(zipBuffer);
      const entries = zip.getEntries();

      for (const entry of entries) {
        if (
          !entry.isDirectory &&
          entry.entryName.toLowerCase().endsWith(".pdf") &&
          !entry.entryName.startsWith("__MACOSX")
        ) {
          const pdfData = entry.getData();
          const pdfBlob = new Blob([new Uint8Array(pdfData)], { type: "application/pdf" });
          const pdfFile = new File([pdfBlob], entry.entryName, {
            type: "application/pdf",
          });
          allFiles.push(pdfFile);
        }
      }
    }

    // Handle individual files
    for (const file of files) {
      if (file.name.toLowerCase().endsWith(".pdf")) {
        allFiles.push(file);
      }
    }

    if (allFiles.length === 0) {
      return NextResponse.json(
        { error: "未找到PDF文件，请上传PDF或包含PDF的ZIP压缩包" },
        { status: 400 }
      );
    }

    // Process each PDF
    const results: FileResult[] = [];
    let totalChapters = 0;
    let totalQuestions = 0;

    for (const file of allFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const parsed = await parsePdfToStructured(buffer);
        const result = importParsedContent(parsed);

        results.push({
          fileName: file.name,
          success: true,
          chaptersImported: result.chaptersImported,
          questionsImported: result.questionsImported,
        });

        totalChapters += result.chaptersImported;
        totalQuestions += result.questionsImported;
      } catch (err) {
        results.push({
          fileName: file.name,
          success: false,
          error: err instanceof Error ? err.message : "解析失败",
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalFiles: allFiles.length,
      successCount: results.filter((r) => r.success).length,
      failCount: results.filter((r) => !r.success).length,
      totalChapters,
      totalQuestions,
      results,
    });
  } catch (error) {
    console.error("Batch upload error:", error);
    return NextResponse.json(
      {
        error: "批量上传失败",
        message: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
