"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDaysLeft } from "@/lib/countdown/progress-utils";
import { isCountdownAutoTask } from "@/lib/countdown/note-utils";
import { getWeekMetrics } from "@/lib/growth-utils";
import { computeTaskStats, getTodayDateString } from "@/lib/task-utils";
import { useCountdownStore } from "@/store/countdownStore";
import { useTodoStore } from "@/store/todoStore";

/** 手机今日页：考研倒计时 + 连续天数 + 今日备考进度 */
export default function MobileExamHero() {
  const targets = useCountdownStore((s) => s.settings.targets);
  const tasks = useTodoStore((s) => s.tasks);
  const today = getTodayDateString();

  const active = useMemo(
    () =>
      targets.find((t) => t.status === "active") ??
      targets.find((t) => t.status === "draft"),
    [targets]
  );

  const { streak } = useMemo(() => getWeekMetrics(tasks), [tasks]);

  const todayExamTasks = useMemo(
    () =>
      tasks.filter((t) => t.date === today && isCountdownAutoTask(t.note ?? "")),
    [tasks, today]
  );

  const examStats = useMemo(
    () => computeTaskStats(todayExamTasks),
    [todayExamTasks]
  );

  const examPct =
    examStats.total > 0
      ? Math.round((examStats.completed / examStats.total) * 100)
      : 0;

  if (!active) {
    return (
      <Link
        href="/me?section=exam"
        className="block rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 px-4 py-4 active:scale-[0.99]"
      >
        <p className="text-sm font-semibold text-indigo-900">还没设置考研倒计时？</p>
        <p className="mt-1 text-xs leading-relaxed text-indigo-700/80">
          填好考试日期后，小光会每天帮你生成背单词、刷题等任务
        </p>
        <span className="mt-2 inline-block text-xs font-medium text-indigo-600">
          去配置备考计划 →
        </span>
      </Link>
    );
  }

  const daysLeft = formatDaysLeft(active);

  return (
    <section className="rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 px-4 py-4 text-white shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-indigo-100/90">{active.title}</p>
          <p className="mt-0.5 text-3xl font-bold tracking-tight">
            {daysLeft > 0 ? (
              <>
                {daysLeft}
                <span className="ml-1 text-base font-medium">天</span>
              </>
            ) : (
              "考试日"
            )}
          </p>
        </div>
        <Link
          href="/me?section=exam"
          className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm"
        >
          计划
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full bg-white/15 px-2.5 py-1">
          🔥 连续 {streak} 天
        </span>
        {examStats.total > 0 && (
          <span className="rounded-full bg-white/15 px-2.5 py-1">
            今日备考 {examStats.completed}/{examStats.total}
          </span>
        )}
      </div>

      {examStats.total > 0 && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/90 transition-all duration-500"
              style={{ width: `${examPct}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
