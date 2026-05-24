/**
 * Process guide PDFs (备考指南, 教材变动说明) and extract key points for homepage.
 * Usage: npx tsx src/lib/process-guides.ts
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { extractTextFromPdf } from "./pdf-parser";

const BASE = process.env.PDF_BASE_PATH || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "https://api.deepseek.com";
const AI_MODEL = process.env.AI_MODEL || "deepseek-chat";

const GUIDE_PROMPT = `请从以下PDF内容中提取关键信息，严格按JSON格式输出。

如果是"备考指南"类文件，提取：
- 考试时间安排
- 科目结构
- 各章节分值权重
- 重要备考建议

如果是"教材变动说明"类文件，提取：
- 各章节变动内容（新增/删除/修改）
- 变动对考试的影响程度

输出JSON格式：
{
  "title": "简短标题",
  "type": "guide" 或 "changes",
  "summary": "200字以内的总体概述",
  "keyPoints": ["要点1", "要点2", ...],
  "chapters": [
    {
      "chapter": "章节名称",
      "content": "该章节相关内容",
      "importance": "high/medium/low"
    }
  ]
}

只输出JSON，不要其他文字。`;

async function callAI(text: string): Promise<unknown> {
  const response = await fetch(`${AI_API_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: GUIDE_PROMPT },
        { role: "user", content: text.slice(0, 30000) },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return JSON.parse(jsonMatch[0]);
}

async function processGuide(fileName: string, label: string) {
  const filePath = path.join(BASE, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ ${fileName} not found, skipping.`);
    return null;
  }

  console.log(`\n📄 ${label}: ${fileName}`);
  const buffer = fs.readFileSync(filePath);
  const arrBuf = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const text = await extractTextFromPdf(arrBuf);
  console.log(`  Text: ${text.length} chars`);

  console.log("  → AI extracting key points...");
  const result = await callAI(text);
  console.log(`  ✓ Done`);

  return result;
}

async function main() {
  if (!BASE) {
    console.log("Error: PDF_BASE_PATH not set in .env");
    process.exit(1);
  }

  const results: Record<string, unknown> = {};

  // Process 备考指南
  const guide = await processGuide(
    "2026考季备考指南.pdf",
    "备考指南"
  );
  if (guide) results.guide = guide;

  // Process 教材变动说明
  const changes = await processGuide(
    "2026教材变动说明.pdf",
    "教材变动说明"
  );
  if (changes) results.changes = changes;

  // Save to guides.json
  const outPath = path.join(process.cwd(), "data", "guides.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\n✅ Saved to ${outPath}`);
}

main().catch(console.error);
