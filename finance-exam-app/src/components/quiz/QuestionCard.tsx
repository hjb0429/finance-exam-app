"use client";

import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import type { Question } from "@/lib/types";
import { checkAnswer, getTrueFalseOptions, normalizeAnswer } from "@/lib/answer-utils";

const typeLabels: Record<string, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  true_false: "判断题",
  calculation: "计算题",
};

const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

export default function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const isMulti = question.type === "multi_choice";

  // Use generated options if the stored options are empty (e.g. true/false)
  const displayOptions =
    question.options.length > 0 ? question.options : getTrueFalseOptions();

  const handleOptionClick = (label: string) => {
    if (submitted) return;
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(label)
          ? prev.filter((l) => l !== label)
          : [...prev, label]
      );
    } else {
      setSelected([label]);
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;

    const userAnswer = isMulti ? selected.sort().join(",") : selected[0];
    const correct = checkAnswer(userAnswer, question.answer, question.type);

    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(userAnswer);
  };

  return (
    <div className="rounded-xl bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-primary-bg px-6 py-4">
        <span className="rounded-full bg-primary-bg px-3 py-1 text-xs font-medium text-primary">
          {typeLabels[question.type] || question.type}
        </span>
        <span className="text-xs text-text-secondary">
          难度: {"★".repeat(question.difficulty)}
          {"☆".repeat(5 - question.difficulty)}
        </span>
      </div>

      {/* Stem */}
      <div className="px-6 py-5">
        <p className="text-base leading-relaxed text-text-primary">
          {question.stem}
        </p>
      </div>

      {/* Options */}
      <div className="px-6 pb-5 space-y-2">
        {displayOptions.map((opt, idx) => {
          const label = optionLabels[idx];
          const isSelected = selected.includes(label);
          const normalizedCorrect = normalizeAnswer(question.answer, question.type);
          const isCorrectOption =
            submitted && normalizedCorrect.includes(label);
          const isWrongSelected =
            submitted && isSelected && !isCorrectOption;

          let optionStyle = "border-primary-bg hover:border-primary-light hover:bg-primary-bg/30";
          if (isSelected && !submitted) {
            optionStyle = "border-primary bg-primary-bg/50";
          }
          if (submitted && isCorrectOption) {
            optionStyle = "border-success bg-success/10";
          }
          if (isWrongSelected) {
            optionStyle = "border-danger bg-danger/10";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(label)}
              disabled={submitted}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${optionStyle}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium flex-shrink-0 ${
                  isCorrectOption
                    ? "border-success bg-success text-white"
                    : isWrongSelected
                    ? "border-danger bg-danger text-white"
                    : isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-primary-bg text-text-secondary"
                }`}
              >
                {isCorrectOption ? (
                  <Check size={14} />
                ) : isWrongSelected ? (
                  <X size={14} />
                ) : (
                  label
                )}
              </span>
              <span className="text-sm text-text-primary">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      <div className="border-t border-primary-bg px-6 py-4">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            提交答案
          </button>
        ) : (
          <div className="space-y-3">
            {/* Result banner */}
            <div
              className={`flex items-center gap-2 rounded-lg p-3 ${
                isCorrect
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {isCorrect ? (
                <>
                  <Check size={18} />
                  <span className="text-sm font-medium">回答正确!</span>
                </>
              ) : (
                <>
                  <X size={18} />
                  <span className="text-sm font-medium">
                    回答错误，正确答案是{" "}
                    {question.type === "true_false"
                      ? normalizeAnswer(question.answer, question.type) === "A"
                        ? "A. 正确"
                        : "B. 错误"
                      : normalizeAnswer(question.answer, question.type)}
                  </span>
                </>
              )}
            </div>

            {/* Analysis */}
            {question.analysis && (
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-1 text-sm font-medium text-primary">
                  <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                  查看解析
                </summary>
                <div className="mt-2 rounded-lg bg-page-bg p-4 text-sm leading-relaxed text-text-secondary">
                  {question.analysis}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
