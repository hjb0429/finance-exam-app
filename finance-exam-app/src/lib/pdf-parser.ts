/**
 * PDF text extraction using pdfjs-dist (Mozilla's PDF.js).
 * Uses legacy build for Node.js compatibility.
 */

import type { ParsedPdfContent } from "./types";
import { structurePdfContent } from "./ai-service";

async function getPdfLib() {
  return import("pdfjs-dist/legacy/build/pdf.mjs");
}

export async function extractTextFromPdf(
  buffer: ArrayBuffer
): Promise<string> {
  const pdfjsLib = await getPdfLib();
  const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n");
}

export async function parsePdfToStructured(
  buffer: ArrayBuffer
): Promise<ParsedPdfContent> {
  const rawText = await extractTextFromPdf(buffer);
  return structurePdfContent(rawText);
}

export async function getPdfPageCount(
  buffer: ArrayBuffer
): Promise<number> {
  const pdfjsLib = await getPdfLib();
  const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}
