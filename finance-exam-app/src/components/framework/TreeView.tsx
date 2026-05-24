"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, FileText } from "lucide-react";
import type { MasteryLevel } from "@/lib/types";

interface KpNode {
  id: number;
  title: string;
  content: string;
  masteryLevel: MasteryLevel;
}

interface SectionNode {
  id: number;
  title: string;
  knowledgePoints: KpNode[];
}

interface ChapterNode {
  id: number;
  title: string;
  sections: SectionNode[];
}

const masteryColors: Record<MasteryLevel, string> = {
  mastered: "bg-success text-white",
  weak: "bg-warning text-white",
  unlearned: "bg-danger text-white",
};

const masteryLabels: Record<MasteryLevel, string> = {
  mastered: "已掌握",
  weak: "薄弱",
  unlearned: "未学",
};

export default function TreeView({
  chapters,
  onSelectKp,
}: {
  chapters: ChapterNode[];
  onSelectKp?: (kp: KpNode) => void;
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  const toggleChapter = (id: number) => {
    const next = new Set(expandedChapters);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedChapters(next);
  };

  const toggleSection = (id: number) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSections(next);
  };

  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center text-text-secondary">
        <FileText size={48} className="mx-auto mb-3 text-primary-lighter" />
        <p>暂无知识框架数据</p>
        <p className="mt-1 text-sm">
          请在「后台管理」上传PDF教材生成知识框架
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="rounded-lg bg-white shadow-sm">
          {/* Chapter header */}
          <button
            onClick={() => toggleChapter(chapter.id)}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left font-semibold text-text-primary hover:bg-primary-bg/50 transition-colors"
          >
            {expandedChapters.has(chapter.id) ? (
              <ChevronDown size={16} className="text-primary flex-shrink-0" />
            ) : (
              <ChevronRight size={16} className="text-primary flex-shrink-0" />
            )}
            <span className="flex-1">{chapter.title}</span>
            <span className="text-xs text-text-secondary">
              {chapter.sections.length} 节
            </span>
          </button>

          {/* Sections */}
          {expandedChapters.has(chapter.id) && (
            <div className="border-t border-primary-bg px-4 pb-2">
              {chapter.sections.map((section) => (
                <div key={section.id} className="mt-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-page-bg transition-colors"
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronDown size={14} className="text-primary-light flex-shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-primary-light flex-shrink-0" />
                    )}
                    <span className="flex-1">{section.title}</span>
                    <span className="text-xs text-text-secondary">
                      {section.knowledgePoints.length} 知识点
                    </span>
                  </button>

                  {/* Knowledge Points */}
                  {expandedSections.has(section.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.knowledgePoints.map((kp) => (
                        <button
                          key={kp.id}
                          onClick={() => onSelectKp?.(kp)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-page-bg transition-colors"
                        >
                          <span
                            className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${
                              masteryColors[kp.masteryLevel]
                            }`}
                          >
                            {masteryLabels[kp.masteryLevel]}
                          </span>
                          <span className="text-text-primary">{kp.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export { type KpNode, type SectionNode, type ChapterNode };
