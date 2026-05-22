"use client";

import { useMemo } from "react";
import { useChatStore } from "@/store/chatStore";
import { useTodoStore } from "@/store/todoStore";
import { computeTaskStats, getTodayDateString } from "@/lib/task-utils";

export default function HomeDashboardView() {
  const tasks = useTodoStore((s) => s.tasks);
  const messages = useChatStore((s) => s.messages);
  const today = getTodayDateString();

  const todayTasks = useMemo(() => tasks.filter((t) => t.date === today), [tasks, today]);
  const stats = useMemo(() => computeTaskStats(todayTasks), [todayTasks]);
  const recentTasks = todayTasks.slice(0, 3);
  const pending = todayTasks.filter((t) => !t.done).length;
  const focusMinutes = todayTasks.reduce((sum, t) => sum + (t.pomodoroMinutes ?? 0), 0);
  const assistantMsgs = messages.filter((m) => m.role === "assistant");
  const lastAI = assistantMsgs[assistantMsgs.length - 1]?.text ?? "你已经在努力了，慢一点也没关系。";

  return (
    <div className="space-y-6">
      <section className="grid gap-3 rounded-3xl bg-white/80 p-4 sm:grid-cols-4 sm:p-5">
        <div>
          <p className="text-xs text-stone-400">时间问候</p>
          <p className="mt-1 text-sm font-medium text-stone-700">今天也辛苦了，慢慢来</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">今日状态</p>
          <p className="mt-1 text-sm font-medium text-emerald-600">{stats.completed}/{stats.total} 完成</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">连续学习</p>
          <p className="mt-1 text-sm font-medium text-orange-600">{stats.completed > 0 ? "1 天" : "0 天"}</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">小光陪伴</p>
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">今天先完成一个最小任务就很好。</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl bg-white/85 p-4">
          <h3 className="text-sm font-semibold text-stone-800">今日专注入口</h3>
          <p className="text-xs text-stone-500">待继续任务 {pending} 项 · 开始学习按钮在 Today 页面</p>
          <div className="space-y-2">
            {recentTasks.length === 0 ? (
              <p className="rounded-2xl bg-stone-50 p-3 text-xs text-stone-500">今天还没有任务，去 Today 页先创建一个小目标。</p>
            ) : (
              recentTasks.map((t) => (
                <div key={t.id} className="rounded-2xl bg-stone-50 px-3 py-2 text-sm text-stone-700">
                  {t.done ? "✓ " : "○ "}{t.text}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-3xl bg-white/85 p-4">
          <h3 className="text-sm font-semibold text-stone-800">AI 区域</h3>
          <p className="text-xs text-stone-500">小光观察 · AI记忆 · 最近聊天摘要</p>
          <div className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-600">{lastAI}</div>
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl bg-white/85 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-stone-400">学习热力图</p>
          <p className="mt-2 text-sm text-stone-500">即将上线（按日热力）</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">本周专注时间</p>
          <p className="mt-2 text-xl font-semibold text-emerald-600">{focusMinutes} 分钟</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">今日完成率</p>
          <p className="mt-2 text-xl font-semibold text-orange-600">{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</p>
        </div>
      </section>
    </div>
  );
}
