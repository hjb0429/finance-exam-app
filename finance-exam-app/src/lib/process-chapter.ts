/**
 * Chapter-level PDF processing: combine all PDFs in a chapter folder,
 * send to AI for structuring, and import results.
 *
 * Usage: npx tsx src/lib/process-chapter.ts "path/to/chapter/folder"
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { extractTextFromPdf } from "./pdf-parser";
import { structurePdfContent } from "./ai-service";
import { importParsedContent } from "./store";

async function processChapter(folderPath: string) {
  const chapterName = path.basename(folderPath);
  console.log(`\n=== Processing: ${chapterName} ===\n`);

  // Find all PDFs
  const allFiles = fs.readdirSync(folderPath);
  const pdfFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.log("No PDF files found.");
    return;
  }

  console.log(`Found ${pdfFiles.length} PDFs:`);
  pdfFiles.forEach((f) => console.log(`  - ${f}`));

  // Separate lecture vs exercise PDFs
  const lecturePdfs = pdfFiles.filter(
    (f) => !f.includes("习题") && !f.includes("纯享")
  );
  const exercisePdfs = pdfFiles.filter(
    (f) => f.includes("习题") || f.includes("纯享")
  );

  // Phase 1: Extract text from all PDFs
  let allText = "";

  console.log("\n📄 Extracting text from lecture PDFs...");
  for (const pdfName of lecturePdfs) {
    const pdfPath = path.join(folderPath, pdfName);
    try {
      const buffer = fs.readFileSync(pdfPath);
      const arrBuf = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      ) as ArrayBuffer;
      const text = await extractTextFromPdf(arrBuf);
      allText += `\n--- FILE: ${pdfName} ---\n${text}`;
      console.log(`  ✓ ${pdfName}: ${text.length} chars`);
    } catch (err) {
      console.log(`  ✗ ${pdfName}: ${err instanceof Error ? err.message : "error"}`);
    }
  }

  console.log("\n📄 Extracting text from exercise PDFs...");
  for (const pdfName of exercisePdfs) {
    const pdfPath = path.join(folderPath, pdfName);
    try {
      const buffer = fs.readFileSync(pdfPath);
      const arrBuf = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      ) as ArrayBuffer;
      const text = await extractTextFromPdf(arrBuf);
      allText += `\n--- FILE: ${pdfName} ---\n${text}`;
      console.log(`  ✓ ${pdfName}: ${text.length} chars`);
    } catch (err) {
      console.log(`  ✗ ${pdfName}: ${err instanceof Error ? err.message : "error"}`);
    }
  }

  console.log(`\n📊 Total text: ${allText.length} characters`);

  // Phase 2: Send to AI
  console.log("\n🤖 Sending to DeepSeek AI for structuring...");
  try {
    const parsed = await structurePdfContent(allText);
    console.log(
      `  Chapters found: ${parsed.chapters.length}`
    );
    parsed.chapters.forEach((ch) =>
      console.log(`    - ${ch.title} (${ch.sections.length} sections)`)
    );
    console.log(`  Questions found: ${parsed.questions.length}`);

    // Phase 3: Import
    console.log("\n💾 Importing to data store...");
    const result = await importParsedContent(parsed);
    console.log(
      `  ✓ Imported: ${result.chaptersImported} chapters, ${result.questionsImported} questions`
    );
  } catch (err) {
    console.log(
      `  ✗ AI processing failed: ${err instanceof Error ? err.message : "error"}`
    );
  }
}

const folderPath = process.argv[2];
if (!folderPath) {
  console.log("Usage: npx tsx src/lib/process-chapter.ts <chapter-folder-path>");
  process.exit(1);
}

processChapter(folderPath).catch(console.error);
