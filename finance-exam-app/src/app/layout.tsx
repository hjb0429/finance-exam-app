import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaProvider from "@/components/layout/PwaProvider";

export const metadata: Metadata = {
  title: "中级财务管理 · 智能学习平台",
  description: "AI驱动的中级财务管理考试智能学习工具，知识框架、刷题练习、薄弱点分析",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "财管备考",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1976D2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full">
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
