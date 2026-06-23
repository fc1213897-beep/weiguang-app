"use client";

import { useMemo } from "react";
import { getWeekMetrics } from "@/lib/growth-utils";
import { useTodoStore } from "@/store/todoStore";

/**
 * 周统计摘要（勿在 Zustand selector 内直接调用 getWeekMetrics，会每次返回新对象导致无限重渲染）
 */
export function useWeekStreakMetrics() {
  const tasks = useTodoStore((s) => s.tasks);

  return useMemo(() => {
    const metrics = getWeekMetrics(tasks);
    return {
      streak: metrics.streak,
      totalCompleted: metrics.totalCompleted,
      weekDone: metrics.weekDone,
      weekTotal: metrics.weekTotal,
      weekFocus: metrics.weekFocus,
      weekRate: metrics.weekRate,
      todayStats: metrics.todayStats,
    };
  }, [tasks]);
}
