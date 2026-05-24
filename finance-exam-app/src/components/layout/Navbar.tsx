"use client";

import { Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-primary-bg bg-white/80 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-md p-1.5 text-text-secondary hover:bg-primary-bg hover:text-primary lg:hidden"
            aria-label="打开菜单"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-semibold text-primary">
            中级财务管理 · 智能学习平台
          </h1>
        </div>
        <nav className="hidden items-center gap-4 text-sm text-text-secondary lg:flex">
          <span className="text-text-secondary">学习进度 0%</span>
          <div className="h-4 w-px bg-primary-bg" />
          <span className="text-text-secondary">今日做题 0</span>
        </nav>
      </div>
    </header>
  );
}
