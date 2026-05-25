"use client";

import { Wrench } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">后台管理</h2>

      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <Wrench size={48} className="mx-auto mb-4 text-primary-lighter" />
        <h3 className="text-lg font-semibold text-text-primary">PDF 资料上传与 AI 解析</h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          此功能需要运行本地服务器。当你有新的 PDF 资料需要导入时：
        </p>
        <div className="mt-4 rounded-lg bg-page-bg p-4 text-left text-sm text-text-secondary">
          <p className="font-medium text-text-primary">操作步骤：</p>
          <ol className="mt-2 list-decimal pl-4 space-y-1">
            <li>在 VS Code 中打开本项目</li>
            <li>终端运行：<code className="rounded bg-primary-bg px-1.5 py-0.5 text-xs text-primary">cd finance-exam-app && npm run dev</code></li>
            <li>打开 <code className="rounded bg-primary-bg px-1.5 py-0.5 text-xs text-primary">http://localhost:3000/admin</code></li>
            <li>上传 PDF 文件，AI 自动解析并导入</li>
            <li>重新构建离线版本使新数据生效</li>
          </ol>
        </div>
        <p className="mt-4 text-xs text-text-secondary">
          当前已导入：10 章 · 146 个知识点 · 586 道题
        </p>
      </div>
    </div>
  );
}
