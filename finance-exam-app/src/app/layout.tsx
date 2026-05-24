import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中级财务管理 · 智能学习平台",
  description: "AI驱动的中级财务管理考试智能学习工具，知识框架、刷题练习、薄弱点分析",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
