/**
 * Quick test: extract text from a PDF and show a preview.
 * Run: npx tsx src/lib/test-pdf.ts "path/to/file.pdf"
 */
import { extractTextFromPdf } from "./pdf-parser";
import fs from "fs";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log("Usage: npx tsx src/lib/test-pdf.ts <path-to-pdf>");
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;

  console.log(`Reading: ${filePath}`);
  console.log(`Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  const text = await extractTextFromPdf(arrayBuffer);
  console.log(`Extracted: ${text.length} characters`);
  console.log("\n--- First 2000 chars ---\n");
  console.log(text.slice(0, 2000));
  console.log("\n--- Last 500 chars ---\n");
  console.log(text.slice(-500));
}

main().catch(console.error);
