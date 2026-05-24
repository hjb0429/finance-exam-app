"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PenSquare,
  BarChart3,
  Search,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { href: "/home", label: "首页", icon: LayoutDashboard },
  { href: "/framework", label: "知识框架", icon: BookOpen },
  { href: "/practice", label: "刷题练习", icon: PenSquare },
  { href: "/analysis", label: "学习分析", icon: BarChart3 },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/admin", label: "后台管理", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-primary-bg px-4 lg:hidden">
          <span className="font-semibold text-primary">导航菜单</span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-primary-bg"
            aria-label="关闭菜单"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-bg text-primary"
                    : "text-text-secondary hover:bg-primary-bg/50 hover:text-primary"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-4">
          <div className="rounded-lg bg-primary-bg p-3 text-xs text-text-secondary">
            <p className="font-medium text-primary">学习提醒</p>
            <p className="mt-1">
              中级财务管理 · 2026考季
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
