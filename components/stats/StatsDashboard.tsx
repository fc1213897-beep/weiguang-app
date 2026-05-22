"use client";

import { useMemo } from "react";
import GrowthCenter from "@/components/growth/GrowthCenter";
import StudyHeatmap from "@/components/stats/StudyHeatmap";
import WeeklyTrend from "@/components/stats/WeeklyTrend";
import { getTodayDateString, parseDateString } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

function startOfWeek(d: Date) {
  const c = new Date(d);
  const day = c.getDay() || 7;
  c.setDate(c.getDate() - day + 1);
  c.setHours(0, 0, 0, 0);
  return c;
}

export default function StatsDashboard() {
  const tasks = useTodoStore((s) => s.tasks);
  const today = getTodayDateString();
  const now = new Date();
  const weekStart = startOfWeek(now);

  const metrics = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.date === today);
    const weekTasks = tasks.filter((t) => {
      const d = parseDateString(t.date);
      return d ? d >= weekStart && d <= now : false;
    });
    const todayDone = todayTasks.filter((t) => t.done).length;
    const weekDone = weekTasks.filter((t) => t.done).length;
    const todayFocus = todayTasks.reduce((s, t) => s + (t.pomodoroMinutes || 0), 0);
    const weekFocus = weekTasks.reduce((s, t) => s + (t.pomodoroMinutes || 0), 0);
    const rate = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0;

    const dates = [...new Set(tasks.map((t) => t.date))].sort();
    let streak = 0;
    for (let i = dates.length - 1; i >= 0; i--) {
      const d = dates[i];
      const doneCount = tasks.filter((t) => t.date === d && t.done).length;
      if (doneCount > 0) streak++;
      else break;
    }

    const trend = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - idx));
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      const dateKey = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
      return { day: key, completed: tasks.filter((t) => t.date === dateKey && t.done).length };
    });

    const heatmap = Array.from({ length: 28 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (27 - i));
      const dateKey = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
      const c = tasks.filter((t) => t.date === dateKey && t.done).length;
      return Math.min(3, c);
    });

    return { todayDone, weekDone, todayFocus, weekFocus, streak, rate, trend, heatmap };
  }, [tasks, today, now, weekStart]);

  const level = Math.max(1, Math.floor(metrics.weekDone / 3) + 1);
  const stars = metrics.weekDone * 2 + Math.floor(metrics.weekFocus / 25);
  const energy = Math.min(100, metrics.todayDone * 20 + Math.floor(metrics.todayFocus / 5));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["今日完成任务", metrics.todayDone],
          ["本周完成任务", metrics.weekDone],
          ["今日专注时长", `${metrics.todayFocus} 分钟`],
          ["本周专注时长", `${metrics.weekFocus} 分钟`],
          ["连续学习天数", `${metrics.streak} 天`],
          ["今日完成率", `${metrics.rate}%`],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-3xl bg-white/80 p-4">
            <p className="text-xs text-stone-500">{k}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-800">{v}</p>
          </div>
        ))}
      </div>

      <WeeklyTrend points={metrics.trend} />
      <StudyHeatmap values={metrics.heatmap} />
      <GrowthCenter energy={energy} level={level} stars={stars} />
    </div>
  );
}
