"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, BarChart3 } from "lucide-react";
import QuestionCard from "./QuestionCard";
import type { Question } from "@/lib/types";

interface QuizSessionProps {
  mode: "chapter" | "random" | "weak";
  chapterId?: number;
  onBack: () => void;
}

export default function QuizSession({
  mode,
  chapterId,
  onBack,
}: QuizSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<
    { questionId: number; isCorrect: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (mode === "chapter" && chapterId) {
      params.set("chapterId", String(chapterId));
    }
    if (mode === "random") {
      params.set("mode", "random");
    }
    if (mode === "weak") {
      params.set("mode", "weak");
    }
    params.set("limit", "30");

    fetch(`/api/questions?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setCurrentIdx(0);
        setResults([]);
        setFinished(false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mode, chapterId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async (answer: string) => {
    const question = questions[currentIdx];
    if (!question) return;

    const res = await fetch("/api/questions/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, userAnswer: answer }),
    });
    const data = await res.json();

    setResults((prev) => [
      ...prev,
      { questionId: question.id, isCorrect: data.isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white" />
        <div className="h-96 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-text-secondary">暂无题目</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          返回选择
        </button>
      </div>
    );
  }

  if (finished) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const rate =
      results.length > 0
        ? Math.round((correctCount / results.length) * 100)
        : 0;

    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <BarChart3 size={48} className="mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold text-text-primary">练习完成!</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">{results.length}</p>
              <p className="text-xs text-text-secondary">总题数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{correctCount}</p>
              <p className="text-xs text-text-secondary">正确</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{rate}%</p>
              <p className="text-xs text-text-secondary">正确率</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={fetchQuestions}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={16} />
              再来一组
            </button>
            <button
              onClick={onBack}
              className="rounded-lg border border-primary-bg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-primary-bg/50 transition-colors"
            >
              返回选择
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIdx];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          退出
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>
              第 {currentIdx + 1} / {questions.length} 题
            </span>
            <span>
              正确: {results.filter((r) => r.isCorrect).length} /{" "}
              {results.length}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-primary-bg">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${((currentIdx + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        key={question.id}
        question={question}
        onSubmit={handleSubmit}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 rounded-lg border border-primary-bg px-4 py-2 text-sm text-text-secondary hover:bg-primary-bg/50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft size={16} />
          上一题
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          {currentIdx < questions.length - 1 ? "下一题" : "查看结果"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
