"use client";

import { X, BookOpen, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { KpNode } from "./TreeView";
import type { Question } from "@/lib/types";

const masteryLabels: Record<string, string> = {
  mastered: "已掌握",
  weak: "薄弱",
  unlearned: "未学",
};

export default function KnowledgePointDetail({
  kp,
  onClose,
}: {
  kp: KpNode | null;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!kp) return;
    setLoading(true);
    fetch(`/api/questions?knowledgePointId=${kp.id}&limit=10`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [kp]);

  if (!kp) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">
              {kp.title}
            </h3>
          </div>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
              kp.masteryLevel === "mastered"
                ? "bg-success/10 text-success"
                : kp.masteryLevel === "weak"
                ? "bg-warning/10 text-warning"
                : "bg-danger/10 text-danger"
            }`}
          >
            {masteryLabels[kp.masteryLevel]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-text-secondary hover:bg-primary-bg"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-page-bg p-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          {kp.content || "暂无内容摘要"}
        </p>
      </div>

      {/* Related questions */}
      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <HelpCircle size={16} className="text-primary" />
          相关题目 ({questions.length})
        </div>
        {loading ? (
          <div className="mt-2 space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-md bg-page-bg"
              />
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="mt-2 space-y-2">
            {questions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="rounded-md border border-primary-bg px-3 py-2 text-sm text-text-secondary"
              >
                {q.stem.slice(0, 80)}
                {q.stem.length > 80 ? "..." : ""}
                <span className="ml-2 text-xs text-primary-light">
                  [{q.type === "single_choice" ? "单选" : q.type === "multi_choice" ? "多选" : q.type === "true_false" ? "判断" : "计算"}]
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-text-secondary">暂无相关题目</p>
        )}
      </div>
    </div>
  );
}
