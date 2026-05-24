"use client";

import { useState, useEffect } from "react";
import TreeView from "@/components/framework/TreeView";
import KnowledgePointDetail from "@/components/framework/KnowledgePointDetail";
import type { ChapterNode, KpNode } from "@/components/framework/TreeView";

export default function FrameworkPage() {
  const [chapters, setChapters] = useState<ChapterNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKp, setSelectedKp] = useState<KpNode | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/framework")
      .then((res) => res.json())
      .then((data) => setChapters(data.chapters || []))
      .catch(() => setError("无法加载知识框架，请稍后重试"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">知识框架</h2>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-white shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary">知识框架</h2>
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">知识框架</h2>
        {chapters.length > 0 && (
          <span className="text-sm text-text-secondary">
            共 {chapters.length} 章
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Tree */}
        <TreeView
          chapters={chapters}
          onSelectKp={setSelectedKp}
        />

        {/* Detail panel */}
        <div className="hidden lg:block">
          {selectedKp ? (
            <KnowledgePointDetail
              kp={selectedKp}
              onClose={() => setSelectedKp(null)}
            />
          ) : (
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-text-secondary">
                点击左侧知识点查看详情
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: modal detail */}
      {selectedKp && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedKp(null)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <KnowledgePointDetail
              kp={selectedKp}
              onClose={() => setSelectedKp(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
