"use client";

import { useState, useEffect } from "react";
import { BookOpen, Shuffle, Target } from "lucide-react";
import QuizSession from "@/components/quiz/QuizSession";
import { getFullFramework } from "@/lib/embedded-data";

interface ChapterInfo {
  id: number;
  title: string;
}

export default function PracticePage() {
  const [mode, setMode] = useState<"select" | "chapter" | "random" | "weak">("select");
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const framework = getFullFramework();
    setChapters(
      framework.map((ch) => ({ id: ch.id, title: ch.title }))
    );
    setLoading(false);
  }, []);

  if (mode !== "select") {
    return (
      <QuizSession
        mode={mode}
        chapterId={selectedChapterId ?? undefined}
        onBack={() => setMode("select")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">刷题练习</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => setMode("random")}
          className="rounded-xl bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-bg">
            <Shuffle size={20} className="text-primary" />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-text-primary">随机练习</h3>
          <p className="mt-1 text-sm text-text-secondary">从所有题目中随机抽取，模拟真实考试环境</p>
        </button>

        <button
          onClick={() => setMode("weak")}
          className="rounded-xl bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <Target size={20} className="text-warning" />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-text-primary">薄弱点专练</h3>
          <p className="mt-1 text-sm text-text-secondary">针对你的薄弱知识点，智能推送强化练习</p>
        </button>

        <div className="rounded-xl bg-white p-6 text-left shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <BookOpen size={20} className="text-success" />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-text-primary">按章练习</h3>
          <p className="mt-1 text-sm text-text-secondary">选择具体章节，针对性练习</p>
          {loading ? (
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-page-bg" />
              ))}
            </div>
          ) : chapters.length > 0 ? (
            <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChapterId(ch.id);
                    setMode("chapter");
                  }}
                  className="w-full rounded-md px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-primary-bg/50 hover:text-primary transition-colors"
                >
                  {ch.title}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-text-secondary">暂无章节数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
