"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  BookOpen,
  Target,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  FileWarning,
} from "lucide-react";
import { getGuides, getFullFramework, getAllQuestions } from "@/lib/embedded-data";
import { getLocalStats, getQuizHistory } from "@/lib/local-db";

export default function HomePage() {
  const [stats, setStats] = useState({
    studyDays: 0,
    completedChapters: 10,
    totalChapters: 10,
    totalKnowledgePoints: 146,
    masteredKnowledgePoints: 0,
    totalQuestions: 586,
    totalAttempts: 0,
    correctRate: 0,
    weakPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Compute stats from local quiz history + embedded framework
    const framework = getFullFramework();
    const localStats = getLocalStats();
    const history = getQuizHistory();

    // Study days
    const days = new Set(history.map((a) => a.timestamp.split("T")[0]));

    // Mastered/weak KPs
    let mastered = 0;
    let weak = 0;
    for (const ch of framework) {
      for (const sec of ch.sections) {
        for (const kp of sec.knowledgePoints) {
          if (kp.masteryLevel === "mastered") mastered++;
          if (kp.masteryLevel === "weak") weak++;
        }
      }
    }

    setStats({
      studyDays: days.size,
      completedChapters: 10,
      totalChapters: 10,
      totalKnowledgePoints: 146,
      masteredKnowledgePoints: mastered,
      totalQuestions: 586,
      totalAttempts: localStats.totalAttempts,
      correctRate: localStats.correctRate,
      weakPoints: weak,
    });
    setLoading(false);
  }, []);

  const guides = getGuides();
  const hasContent = stats.totalQuestions > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary-light p-6 text-white">
        <h2 className="text-2xl font-bold">
          {hasContent ? "欢迎回来" : "开始学习吧"}
        </h2>
        <p className="mt-1 text-white/80">中级财务管理 · 2026考季智能备考</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "学习天数", value: loading ? "..." : stats.studyDays, icon: TrendingUp, color: "text-primary" },
          { label: "完成章节", value: loading ? "..." : `${stats.completedChapters}/${stats.totalChapters}`, icon: BookOpen, color: "text-success" },
          { label: "题库总量", value: loading ? "..." : stats.totalQuestions, icon: Target, color: "text-primary-light" },
          { label: "薄弱点", value: loading ? "..." : stats.weakPoints, icon: AlertTriangle, color: "text-warning" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-white p-4 shadow-sm">
            <item.icon size={20} className={item.color} />
            <p className="mt-2 text-2xl font-bold text-text-primary">{item.value}</p>
            <p className="text-xs text-text-secondary">{item.label}</p>
          </div>
        ))}
      </div>

      {stats.totalKnowledgePoints > 0 && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary">知识掌握概览</h3>
          <div className="mt-3">
            <div className="flex h-3 rounded-full bg-page-bg overflow-hidden">
              <div
                className="bg-success transition-all"
                style={{ width: `${(stats.masteredKnowledgePoints / stats.totalKnowledgePoints) * 100}%` }}
              />
              <div
                className="bg-warning transition-all"
                style={{ width: `${(stats.weakPoints / stats.totalKnowledgePoints) * 100}%` }}
              />
              <div className="bg-primary-lighter flex-1" />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" />
                已掌握 {stats.masteredKnowledgePoints}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" />
                薄弱 {stats.weakPoints}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary-lighter" />
                未学 {stats.totalKnowledgePoints - stats.masteredKnowledgePoints - stats.weakPoints}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Lightbulb size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">2026 备考指南</h3>
          </div>
          {guides.guide ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-text-secondary">
                {(guides.guide as { summary: string }).summary}
              </p>
              <ul className="space-y-1.5">
                {(guides.guide as { keyPoints: string[] }).keyPoints.slice(0, 5).map((kp: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">暂无备考指南数据</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileWarning size={20} className="text-warning" />
            <h3 className="text-lg font-semibold text-text-primary">2026 教材变动</h3>
          </div>
          {guides.changes ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-text-secondary">
                {(guides.changes as { summary: string }).summary}
              </p>
              <ul className="space-y-1.5">
                {(guides.changes as { keyPoints: string[] }).keyPoints.slice(0, 5).map((kp: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">暂无教材变动数据</p>
          )}
        </div>
      </div>

      {!loading && stats.totalAttempts === 0 && (
        <div className="rounded-xl bg-white p-5 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary">开始你的学习之旅</h3>
          <p className="mt-2 text-sm text-text-secondary">题库已就绪，前往刷题练习开始做题吧</p>
          <Link href="/practice" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors">
            开始刷题 <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
