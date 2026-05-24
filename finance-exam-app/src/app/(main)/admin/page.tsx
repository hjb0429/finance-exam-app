"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Package,
  Files,
  ChevronDown,
} from "lucide-react";

interface FileItem {
  file: File;
  status: "pending" | "processing" | "done" | "error";
  chaptersImported?: number;
  questionsImported?: number;
  error?: string;
}

export default function AdminPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentFileIdx, setCurrentFileIdx] = useState(-1);
  const [summary, setSummary] = useState<{
    totalFiles: number;
    successCount: number;
    failCount: number;
    totalChapters: number;
    totalQuestions: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const addPdfFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setSummary(null);
    const pdfs = Array.from(newFiles).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length === 0) return;

    setFiles((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ file: f, status: "pending" as const })),
    ]);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addZipFile = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const zip = newFiles[0];
    if (!zip.name.toLowerCase().endsWith(".zip")) return;
    setSummary(null);
    setFiles((prev) => [
      ...prev,
      { file: zip, status: "pending" as const },
    ]);
    if (zipInputRef.current) zipInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setSummary(null);
  };

  const handleBatchUpload = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setSummary(null);

    // Separate ZIP files and PDF files
    const zipFiles = files.filter((f) => f.file.name.endsWith(".zip"));
    const pdfFiles = files.filter((f) => !f.file.name.endsWith(".zip"));

    // Process each ZIP file individually
    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      if (item.status === "done" || item.status === "error") continue;

      setCurrentFileIdx(i);
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "processing" as const } : f
        )
      );

      try {
        const formData = new FormData();
        if (item.file.name.endsWith(".zip")) {
          formData.append("zip", item.file);
        } else {
          formData.append("files", item.file);
        }

        const res = await fetch("/api/pdf/batch", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: "done" as const,
                    chaptersImported: data.totalChapters,
                    questionsImported: data.totalQuestions,
                  }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "error" as const, error: data.error || data.message }
                : f
            )
          );
        }
      } catch {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error" as const, error: "网络错误" }
              : f
          )
        );
      }
    }

    setCurrentFileIdx(-1);
    setProcessing(false);

    // Calculate summary
    const done = files.filter((f) => f.status === "done" || f.status === "processing");
    const afterUpdate = files.map((f, i) => {
      // Recalculate after all updates
      return f;
    });

    // Reload stats from server for accurate summary
    try {
      const statsRes = await fetch("/api/stats");
      const stats = await statsRes.json();
      setSummary({
        totalFiles: files.length,
        successCount: afterUpdate.filter((f) => f.status === "done").length,
        failCount: afterUpdate.filter((f) => f.status === "error").length,
        totalChapters: stats.totalChapters || 0,
        totalQuestions: stats.totalQuestions || 0,
      });
    } catch {
      setSummary({
        totalFiles: files.length,
        successCount: 0,
        failCount: 0,
        totalChapters: 0,
        totalQuestions: 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">后台管理</h2>

      {/* Upload area */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">
          上传PDF资料
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          支持三种方式上传：
          <strong>多选PDF文件</strong>、<strong>上传ZIP压缩包</strong>（可将各章节PDF打包）、
          <strong>单文件上传</strong>。文件将按顺序由AI解析处理。
        </p>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => addPdfFiles(e.target.files)}
          className="hidden"
        />
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          onChange={(e) => addZipFile(e.target.files)}
          className="hidden"
        />

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
          >
            <Files size={18} />
            选择多个PDF文件
          </button>
          <button
            onClick={() => zipInputRef.current?.click()}
            disabled={processing}
            className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
          >
            <Package size={18} />
            上传ZIP压缩包
          </button>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>已选择 {files.length} 个文件</span>
              {!processing && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setSummary(null);
                  }}
                  className="text-danger hover:underline"
                >
                  清空列表
                </button>
              )}
            </div>

            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {files.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                    item.status === "done"
                      ? "border-success/30 bg-success/5"
                      : item.status === "error"
                      ? "border-danger/30 bg-danger/5"
                      : item.status === "processing"
                      ? "border-primary/30 bg-primary/5"
                      : "border-primary-bg"
                  }`}
                >
                  <FileText
                    size={16}
                    className={
                      item.status === "done"
                        ? "text-success"
                        : item.status === "error"
                        ? "text-danger"
                        : "text-text-secondary"
                    }
                  />
                  <span className="flex-1 truncate text-text-primary">
                    {item.file.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>

                  {item.status === "processing" && (
                    <RefreshCw size={14} className="animate-spin text-primary" />
                  )}
                  {item.status === "done" && (
                    <span className="text-xs text-success">
                      {item.chaptersImported}章 {item.questionsImported}题
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="text-xs text-danger" title={item.error}>
                      失败
                    </span>
                  )}

                  {!processing && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="rounded p-0.5 text-text-secondary hover:text-danger"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Upload button */}
            <button
              onClick={handleBatchUpload}
              disabled={processing || files.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {processing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  正在处理 ({currentFileIdx + 1}/{files.length})...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  开始批量解析 ({files.length} 个文件)
                </>
              )}
            </button>
          </div>
        )}

        {/* No files selected — show drop zone */}
        {files.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-primary-lighter p-8 transition-colors hover:border-primary hover:bg-primary-bg/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-bg">
              <Upload size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary">
                点击选择多个PDF文件，或上传ZIP压缩包
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                也可以将PDF文件拖拽到此处（即将支持）
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Results summary */}
      {summary && (
        <div className="rounded-xl bg-success/10 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-success" />
            <h3 className="font-semibold text-text-primary">处理完成</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-white p-3 text-center">
              <p className="text-lg font-bold text-text-primary">
                {summary.totalFiles}
              </p>
              <p className="text-xs text-text-secondary">处理文件</p>
            </div>
            <div className="rounded-lg bg-white p-3 text-center">
              <p className="text-lg font-bold text-success">
                {summary.successCount}
              </p>
              <p className="text-xs text-text-secondary">成功</p>
            </div>
            <div className="rounded-lg bg-white p-3 text-center">
              <p className="text-lg font-bold text-text-primary">
                {summary.totalChapters}
              </p>
              <p className="text-xs text-text-secondary">导入章节</p>
            </div>
            <div className="rounded-lg bg-white p-3 text-center">
              <p className="text-lg font-bold text-text-primary">
                {summary.totalQuestions}
              </p>
              <p className="text-xs text-text-secondary">导入题目</p>
            </div>
          </div>
        </div>
      )}

      {/* Error summary */}
      {summary && summary.failCount > 0 && (
        <div className="rounded-xl bg-warning/10 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            <h3 className="font-semibold text-text-primary">
              {summary.failCount} 个文件处理失败
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            请检查失败文件是否为有效的PDF格式，或重试。详细错误信息见上方文件列表。
          </p>
        </div>
      )}

      {/* Quick start: sample data */}
      <details className="group rounded-xl bg-white p-6 shadow-sm">
        <summary className="flex cursor-pointer items-center gap-2 text-lg font-semibold text-text-primary">
          <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
          快速体验（无需PDF和AI）
        </summary>
        <p className="mt-2 text-sm text-text-secondary">
          导入示例财务管理知识题库（2章13知识点12道题），可以立即体验所有功能。
        </p>
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/admin/seed", { method: "POST" });
              const data = await res.json();
              alert(data.message || "导入完成");
              window.location.href = "/home";
            } catch {
              alert("网络错误，请重试");
            }
          }}
          className="mt-3 rounded-lg bg-primary-bg px-4 py-2 text-sm font-medium text-primary hover:bg-primary-bg/80 transition-colors"
        >
          导入示例数据
        </button>
      </details>

      {/* AI Config notice */}
      <div className="rounded-xl bg-warning/10 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="text-warning flex-shrink-0 mt-0.5"
          />
          <div>
            <h3 className="font-semibold text-text-primary">AI服务配置</h3>
            <p className="mt-1 text-sm text-text-secondary">
              PDF智能解析需要配置AI API Key。请在项目根目录的 .env 文件中设置
              AI_API_KEY。
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              推荐使用 DeepSeek API (https://platform.deepseek.com)，注册即送免费额度，国内访问友好。也可使用
              OpenAI API 或其他兼容接口。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
