"use client";

import { useMemo } from "react";
import TaskStats from "@/components/todo/TaskStats";
import { computeTaskStats } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

/** 桌面端：学习统计 */
export default function DesktopStatsView() {
  const tasks = useTodoStore((s) => s.tasks);

  const overall = useMemo(() => computeTaskStats(tasks), [tasks]);
  const doneRate =
    overall.total > 0
      ? Math.round((overall.completed / overall.total) * 100)
      : 0;

  return (
    <div className="min-w-0">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">学习统计</h2>
        <p className="mt-1 text-sm text-stone-500">看看这段时间的积累</p>
      </header>

      <div className="mt-5 space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-orange-100/80 bg-orange-50/50 p-4 text-center">
            <p className="text-xs text-stone-500">全部任务</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              {overall.total}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/50 p-4 text-center">
            <p className="text-xs text-stone-500">已完成</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {overall.completed}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100/80 bg-amber-50/50 p-4 text-center">
            <p className="text-xs text-stone-500">完成率</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{doneRate}%</p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-stone-600">当前选中日期</p>
          <TaskStats variant="companion" />
        </div>
      </div>
    </div>
  );
}
