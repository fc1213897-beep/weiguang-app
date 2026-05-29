"use client";

import AuthStatusBadge from "@/components/auth/AuthStatusBadge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useExpenseStats } from "@/hooks/useExpenseStats";
import { useAuth } from "@/hooks/useAuth";
import { formatAmount } from "@/lib/expense-plan";
import { getWeekMetrics } from "@/lib/growth-utils";
import { getTodayDateString } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

const NAV_ITEMS = [
  { id: "home", label: "成长空间", icon: "🏠", href: "/home" },
  { id: "journey", label: "微光旅程", icon: "🗺️", href: "/journey" },
  { id: "today", label: "Today", icon: "📋", href: "/today" },
  { id: "tasks", label: "任务", icon: "🗂️", href: "/tasks" },
  { id: "chat", label: "小光", icon: "✨", href: "/chat" },
  { id: "ledger", label: "记账", icon: "💰", href: "/ledger" },
  { id: "stats", label: "成长统计", icon: "📊", href: "/stats" },
  { id: "settings", label: "设置", icon: "⚙️", href: "/settings" },
] as const;

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const expenseStats = useExpenseStats();
  const tasks = useTodoStore((s) => s.tasks);
  const metrics = useMemo(() => getWeekMetrics(tasks), [tasks]);
  const today = getTodayDateString();
  const todayFocus = useMemo(
    () =>
      tasks
        .filter((t) => t.date === today)
        .reduce((s, t) => s + (t.pomodoroMinutes ?? 0), 0),
    [tasks, today]
  );

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-orange-100/60 pr-4">
      <h1 className="px-2 text-xl font-bold text-orange-500">微光 ✨</h1>
      <p className="mt-1 px-2 text-xs text-stone-400">陪你慢慢亮起来的路</p>

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
            {metrics.streak} 天
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">专注时间</span>
          <span className="font-medium text-emerald-600">
            {todayFocus} 分钟
          </span>
        </div>
        {isAuthenticated && !expenseStats.loading && (
          <>
            <div className="my-2 border-t border-stone-200/80" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">本月支出</span>
              <span className="font-semibold text-rose-600">
                ¥{formatAmount(expenseStats.expenseTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">本月收入</span>
              <span className="font-semibold text-emerald-600">
                ¥{formatAmount(expenseStats.incomeTotal)}
              </span>
            </div>
            <Link
              href="/ledger"
              className="mt-2 block rounded-xl bg-orange-500 py-2 text-center text-xs font-medium text-white transition hover:bg-orange-600"
            >
              ＋ 记一笔
            </Link>
          </>
        )}
      </div>

      <div className="mt-auto border-t border-orange-100/60 px-1 pt-3">
        <AuthStatusBadge />
      </div>
    </aside>
  );
}