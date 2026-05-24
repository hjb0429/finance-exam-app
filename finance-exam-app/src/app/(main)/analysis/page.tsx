"use client";

import { useState, useEffect } from "react";
import { BarChart3, Target, TrendingUp, BookOpen } from "lucide-react";

interface AnalysisData {
  studyDays: number;
  completedChapters: number;
  totalChapters: number;
  totalKnowledgePoints: number;
  masteredKnowledgePoints: number;
  totalQuestions: number;
  totalAttempts: number;
  correctRate: number;
  weakPoints: number;
  chapterBreakdown: Array<{
    chapterId: number;
    title: string;
    totalKnowledgePoints: number;
    masteredKnowledgePoints: number;
  }>;
  knowledgePointProgress: Array<{
    knowledgePointId: number;
    correctCount: number;
    totalCount: number;
    masteryScore: number;
  }>;
}

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary">学习分析</h2>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-white shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (!data || data.totalAttempts === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary">学习分析</h2>
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <BarChart3 size={48} className="mx-auto mb-3 text-primary-lighter" />
          <p className="text-text-secondary">
            完成一定量的题目后，系统将自动分析你的知识掌握情况
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            去「刷题练习」开始做题吧
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">学习分析</h2>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "总做题数", value: data.totalAttempts, icon: Target },
          { label: "正确率", value: `${data.correctRate}%`, icon: TrendingUp },
          { label: "已掌握知识点", value: `${data.masteredKnowledgePoints}/${data.totalKnowledgePoints}`, icon: BookOpen },
          { label: "薄弱点", value: data.weakPoints, icon: BarChart3 },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-white p-4 shadow-sm"
          >
            <item.icon size={20} className="text-primary" />
            <p className="mt-2 text-2xl font-bold text-text-primary">
              {item.value}
            </p>
            <p className="text-xs text-text-secondary">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Mastery bar */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">
          整体掌握度
        </h3>
        <div className="mt-4">
          <div className="flex h-4 rounded-full bg-page-bg overflow-hidden">
            <div
              className="bg-success transition-all"
              style={{
                width: `${
                  data.totalKnowledgePoints > 0
                    ? (data.masteredKnowledgePoints / data.totalKnowledgePoints) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="bg-warning transition-all"
              style={{
                width: `${
                  data.totalKnowledgePoints > 0
                    ? (data.weakPoints / data.totalKnowledgePoints) * 100
                    : 0
                }%`,
              }}
            />
            <div className="bg-primary-lighter flex-1" />
          </div>
          <div className="mt-3 flex justify-between text-sm text-text-secondary">
            <span>
              已掌握:{" "}
              {data.totalKnowledgePoints > 0
                ? Math.round(
                    (data.masteredKnowledgePoints /
                      data.totalKnowledgePoints) *
                      100
                  )
                : 0}
              %
            </span>
            <span>薄弱: {data.weakPoints} 个知识点</span>
          </div>
        </div>
      </div>

      {/* Chapter breakdown */}
      {data.chapterBreakdown.length > 0 && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary">
            章节进度
          </h3>
          <div className="mt-4 space-y-3">
            {data.chapterBreakdown.map((ch) => (
              <div key={ch.chapterId}>
                <div className="flex justify-between text-sm">
                  <span className="text-text-primary">{ch.title}</span>
                  <span className="text-text-secondary">
                    {ch.masteredKnowledgePoints}/{ch.totalKnowledgePoints} 个知识点
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-page-bg">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${
                        ch.totalKnowledgePoints > 0
                          ? (ch.masteredKnowledgePoints / ch.totalKnowledgePoints) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
