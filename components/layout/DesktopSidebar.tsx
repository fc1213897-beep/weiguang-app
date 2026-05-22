"use client";

import AuthStatusBadge from "@/components/auth/AuthStatusBadge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { computeTaskStats } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

const NAV_ITEMS = [
  { id: "home", label: "首页空间", icon: "🏠", href: "/home" },
  { id: "today", label: "Today执行", icon: "📋", href: "/today" },
  { id: "tasks", label: "任务管理", icon: "🗂️", href: "/tasks" },
  { id: "chat", label: "AI陪伴", icon: "💬", href: "/chat" },
  { id: "stats", label: "学习统计", icon: "📊", href: "/stats" },
  { id: "settings", label: "设置", icon: "⚙️", href: "/settings" },
] as const;

export default function DesktopSidebar() {
  const pathname = usePathname();
  const tasks = useTodoStore((s) => s.tasks);
  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);
  const focusMinutes = tasks.reduce(
    (sum, t) => sum + (t.pomodoroMinutes ?? 0),
    0
  );

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-orange-100/60 pr-4">
      <h1 className="px-2 text-xl font-bold text-orange-500">微光 ✨</h1>
      <p className="mt-1 px-2 text-xs text-stone-400">AI 学习陪伴空间</p>

      <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="主菜单">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition",
                active
                  ? "bg-orange-500 font-medium text-white shadow-sm"
                  : "text-stone-600 hover:bg-orange-50/80",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-3 mt-4 space-y-2 rounded-2xl bg-stone-50/80 p-3">
        <p className="text-xs font-medium text-stone-500">今日状态</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">连续学习</span>
          <span className="font-medium text-orange-600">
            {stats.completed > 0 ? "1 天" : "0 天"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">专注时间</span>
          <span className="font-medium text-emerald-600">
            {focusMinutes} 分钟
          </span>
        </div>
      </div>

      <div className="mt-auto border-t border-orange-100/60 px-1 pt-3">
        <AuthStatusBadge />
      </div>
    </aside>
  );
}