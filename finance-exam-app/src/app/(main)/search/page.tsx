"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, BookOpen, HelpCircle } from "lucide-react";
import Link from "next/link";
import { searchLocalQuestions, cacheQuestions } from "@/lib/local-db";
import type { LocalQuestion } from "@/lib/local-db";

interface SearchResults {
  knowledgePoints: Array<{
    id: number;
    title: string;
    content: string;
    sectionId: number;
  }>;
  questions: Array<{
    id: number;
    stem: string;
    type: string;
  }>;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Cache questions for offline search
  useEffect(() => {
    fetch("/api/questions?limit=600")
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          cacheQuestions(
            data.questions.map((q: { id: number; type: string; stem: string; options: string[]; answer: string; analysis: string }) => ({
              id: q.id,
              type: q.type,
              stem: q.stem,
              options: q.options,
              answer: q.answer,
              analysis: q.analysis || "",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);

    try {
      // Try server first
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      // Offline: search locally
      const localQuestions = searchLocalQuestions(q);
      setResults({
        knowledgePoints: [],
        questions: localQuestions.map((q) => ({
          id: q.id,
          stem: q.stem,
          type: q.type,
        })),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">搜索</h2>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              doSearch(e.target.value);
            }}
            placeholder="搜索知识点或题目..."
            className="w-full rounded-lg border border-primary-bg bg-page-bg py-3 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-white shadow-sm"
            />
          ))}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {results.knowledgePoints.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <BookOpen size={16} />
                知识点 ({results.knowledgePoints.length})
              </h3>
              <div className="mt-2 space-y-2">
                {results.knowledgePoints.map((kp) => (
                  <Link
                    key={kp.id}
                    href="/framework"
                    className="block rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="font-medium text-text-primary">{kp.title}</p>
                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                      {kp.content}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.questions.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <HelpCircle size={16} />
                题目 ({results.questions.length})
              </h3>
              <div className="mt-2 space-y-2">
                {results.questions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <span className="text-xs text-primary-light">
                      {q.type === "single_choice"
                        ? "单选"
                        : q.type === "multi_choice"
                        ? "多选"
                        : q.type === "true_false"
                        ? "判断"
                        : "计算"}
                    </span>
                    <p className="mt-1 text-sm text-text-primary">{q.stem}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query &&
            results.knowledgePoints.length === 0 &&
            results.questions.length === 0 && (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <Search size={32} className="mx-auto text-primary-lighter" />
                <p className="mt-2 text-text-secondary">
                  未找到与 "{query}" 相关的结果
                </p>
              </div>
            )}
        </div>
      )}

      {!query && !results && (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <Search size={40} className="mx-auto text-primary-lighter" />
          <p className="mt-3 text-text-secondary">
            输入关键词搜索知识框架和题库中的内容
          </p>
        </div>
      )}
    </div>
  );
}
