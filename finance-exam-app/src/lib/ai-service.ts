/**
 * AI service: calls DeepSeek / OpenAI API to structure PDF content.
 */

import type { ParsedPdfContent } from "./types";

const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_API_BASE_URL =
  process.env.AI_API_BASE_URL || "https://api.deepseek.com";
const AI_MODEL = process.env.AI_MODEL || "deepseek-chat";

const SYSTEM_PROMPT = `你是一位中级财务管理考试辅导专家。请将以下教材文本结构化处理，严格按JSON格式输出。

要求：
1. 识别出所有的"章"（Chapter），每章包含多个"节"（Section），每节包含多个"知识点"（KnowledgePoint）
2. 从文本中提取所有题目（选择题、判断题、计算题等），每道题标注它属于哪个知识点
3. 对每个知识点，用简洁的语言总结其核心内容（100字以内）
4. 题目选项用数组表示，正确答案标注选项字母或数字

输出JSON格式：
{
  "chapters": [
    {
      "title": "第一章 XXX",
      "order": 1,
      "sections": [
        {
          "title": "第一节 XXX",
          "order": 1,
          "knowledgePoints": [
            {
              "title": "知识点名称",
              "content": "核心内容总结..."
            }
          ]
        }
      ]
    }
  ],
  "questions": [
    {
      "knowledgePointTitle": "知识点名称",
      "type": "single_choice",
      "stem": "题目题干",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      "answer": "A",
      "analysis": "答案解析...",
      "difficulty": 2
    }
  ]
}

type可选值: "single_choice"(单选), "multi_choice"(多选), "true_false"(判断), "calculation"(计算)
difficulty: 1-5，1最简单，5最难

注意：只输出JSON，不要输出任何其他文字。`;

export async function structurePdfContent(
  rawText: string
): Promise<ParsedPdfContent> {
  if (!AI_API_KEY) {
    throw new Error(
      "AI API Key 未配置。请在 .env 文件中设置 AI_API_KEY。"
    );
  }

  // Trim text to avoid token limits (DeepSeek has ~64K context)
  const trimmedText = rawText.slice(0, 50000);

  const response = await fetch(`${AI_API_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: trimmedText },
      ],
      temperature: 0.1,
      max_tokens: 16000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API 调用失败: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Extract JSON from response (handle possible markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 返回内容无法解析为 JSON: " + content.slice(0, 200));
  }

  let jsonStr = jsonMatch[0];

  let lastError = "";

  // Try direct parse first
  try {
    return JSON.parse(jsonStr) as ParsedPdfContent;
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e);
  }

  // Repair 1: Remove trailing commas before } or ]
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");

  try {
    return JSON.parse(jsonStr) as ParsedPdfContent;
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e);
  }

  // Repair 2: Fix missing commas between string array elements
  jsonStr = jsonStr.replace(/"\s+"/g, '", "');

  try {
    return JSON.parse(jsonStr) as ParsedPdfContent;
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e);
  }

  // Repair 3: Truncate at last valid position
  const lastValidPos = Math.max(
    jsonStr.lastIndexOf('"]'),
    jsonStr.lastIndexOf('"}'),
    jsonStr.lastIndexOf("}]")
  );
  if (lastValidPos > jsonStr.length / 2) {
    const truncated = jsonStr.slice(0, lastValidPos + 2) + "]}";
    try {
      return JSON.parse(truncated) as ParsedPdfContent;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  throw new Error(`JSON 解析失败: ${lastError}`);
}

export function isAiConfigured(): boolean {
  return AI_API_KEY.length > 0;
}
