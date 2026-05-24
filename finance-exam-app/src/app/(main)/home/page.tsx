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

interface HomeStats {
  studyDays: number;
  completedChapters: number;
  totalChapters: number;
  totalKnowledgePoints: number;
  masteredKnowledgePoints: number;
  totalQuestions: number;
  totalAttempts: number;
  correctRate: number;
  weakPoints: number;
}

interface GuideData {
  title: string;
  summary: string;
  keyPoints: string[];
}

export default function HomePage() {
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [changes, setChanges] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/guides").then((r) => r.json()),
    ])
      .then(([statsData, guidesData]) => {
        setStats(statsData);
        if (guidesData.guide) setGuide(guidesData.guide);
        if (guidesData.changes) setChanges(guidesData.changes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasContent = stats && stats.totalQuestions > 0;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary-light p-6 text-white">
        <h2 className="text-2xl font-bold">
          {hasContent ? "欢迎回来" : "开始学习吧"}
        </h2>
        <p className="mt-1 text-white/80">
          中级财务管理 · 2026考季智能备考
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "学习天数",
            value: loading ? "..." : stats?.studyDays ?? 0,
            icon: TrendingUp,
            color: "text-primary",
          },
          {
            label: "完成章节",
            value: loading
              ? "..."
              : `${stats?.completedChapters ?? 0}/${stats?.totalChapters ?? 0}`,
            icon: BookOpen,
            color: "text-success",
          },
          {
            label: "题库总量",
            value: loading ? "..." : stats?.totalQuestions ?? 0,
            icon: Target,
            color: "text-primary-light",
          },
          {
            label: "薄弱点",
            value: loading ? "..." : stats?.weakPoints ?? 0,
            icon: AlertTriangle,
            color: "text-warning",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-white p-4 shadow-sm"
          >
            <item.icon size={20} className={item.color} />
            <p className="mt-2 text-2xl font-bold text-text-primary">
              {item.value}
            </p>
            <p className="text-xs text-text-secondary">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Knowledge mastery overview */}
      {stats && stats.totalKnowledgePoints > 0 && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary">
            知识掌握概览
          </h3>
          <div className="mt-3">
            <div className="flex h-3 rounded-full bg-page-bg overflow-hidden">
              <div
                className="bg-success transition-all"
                style={{
                  width: `${
                    (stats.masteredKnowledgePoints /
                      stats.totalKnowledgePoints) *
                    100
                  }%`,
                }}
              />
              <div
                className="bg-warning transition-all"
                style={{
                  width: `${
                    (stats.weakPoints / stats.totalKnowledgePoints) * 100
                  }%`,
                }}
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
                未学{" "}
                {stats.totalKnowledgePoints -
                  stats.masteredKnowledgePoints -
                  stats.weakPoints}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Guide & Changes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 备考指南 */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Lightbulb size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">
              2026 备考指南
            </h3>
          </div>
          {guide ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-text-secondary">{guide.summary}</p>
              <ul className="space-y-1.5">
                {guide.keyPoints.slice(0, 5).map((kp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">
              {loading ? "加载中..." : "暂无备考指南数据"}
            </p>
          )}
        </div>

        {/* 教材变动 */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileWarning size={20} className="text-warning" />
            <h3 className="text-lg font-semibold text-text-primary">
              2026 教材变动
            </h3>
          </div>
          {changes ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-text-secondary">{changes.summary}</p>
              <ul className="space-y-1.5">
                {changes.keyPoints.slice(0, 5).map((kp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">
              {loading ? "加载中..." : "暂无教材变动数据"}
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      {(!stats || stats.totalQuestions === 0) && (
        <div className="rounded-xl bg-white p-5 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary">
            开始你的学习之旅
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            题库已就绪，前往「刷题练习」开始做题吧
          </p>
          <Link
            href="/practice"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
          >
            开始刷题 <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
