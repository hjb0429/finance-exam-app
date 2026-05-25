/**
 * Batch process all chapter PDFs sequentially.
 * Usage: npx tsx src/lib/process-all.ts
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { extractTextFromPdf } from "./pdf-parser";
import { structurePdfContent } from "./ai-service";
import { importParsedContent } from "./store";

const BASE = process.env.PDF_BASE_PATH || "";
const CHAPTERS = [
  "第一章", "第二章", "第三章", "第四章", "第五章",
  "第六章", "第七章", "第八章", "第九章", "第十章",
];

async function processChapter(chapterName: string) {
  const chapterPath = path.join(BASE, chapterName);
  if (!fs.existsSync(chapterPath)) {
    console.log(`\n⚠ ${chapterName}: folder not found, skipping.`);
    return;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📚 ${chapterName}`);
  console.log(`${"=".repeat(60)}`);

  const allFiles = fs.readdirSync(chapterPath);
  const pdfFiles = allFiles
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .filter((f) => !f.startsWith("."));

  if (pdfFiles.length === 0) {
    console.log("  No PDFs found.");
    return;
  }

  console.log(`  PDFs: ${pdfFiles.length}`);
  let allText = "";

  for (const pdfName of pdfFiles) {
    const pdfPath = path.join(chapterPath, pdfName);
    try {
      const buffer = fs.readFileSync(pdfPath);
      const arrBuf = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      ) as ArrayBuffer;
      const text = await extractTextFromPdf(arrBuf);
      allText += `\n--- ${pdfName} ---\n${text}`;
      console.log(`    ✓ ${pdfName} (${text.length} chars)`);
    } catch (err) {
      console.log(`    ✗ ${pdfName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (!allText.trim()) {
    console.log("  No text extracted.");
    return;
  }

  console.log(`  Total ${allText.length} chars → AI structuring...`);
  try {
    const parsed = await structurePdfContent(allText);
    const result = await importParsedContent(parsed);
    console.log(`  ✅ ${result.chaptersImported} chapters, ${result.questionsImported} questions`);
    parsed.chapters.forEach((ch) =>
      console.log(`     - ${ch.title} (${ch.sections.length} sections)`)
    );
    console.log(`     - ${parsed.questions.length} questions extracted`);
  } catch (err) {
    console.log(`  ❌ ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function main() {
  if (!BASE) {
    console.log("Error: PDF_BASE_PATH not set in .env");
    process.exit(1);
  }

  console.log(`📂 ${BASE}\n`);

  const startTime = Date.now();

  for (const chapter of CHAPTERS) {
    await processChapter(chapter);
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎉 Done! ${elapsed}s total`);
}

main().catch(console.error);
