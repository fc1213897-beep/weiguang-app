"use client";

import Link from "next/link";
import { useMemo } from "react";
import TimeGreeting from "@/components/companion/TimeGreeting";
import {
  buildActivityTimeline,
  getAiDailySuggestions,
  getJourneyStage,
  getTodayMoodLabel,
  getTopPriorityTasks,
  getWeekMetrics,
  getXiaoguangLine,
} from "@/lib/growth-utils";
import { getTodayDateString } from "@/lib/task-utils";
import { useChatStore } from "@/store/chatStore";
import { useTodoStore } from "@/store/todoStore";

export default function HomeDashboardView() {
  const tasks = useTodoStore((s) => s.tasks);
  const messages = useChatStore((s) => s.messages);

  const metrics = useMemo(() => getWeekMetrics(tasks), [tasks]);
  const topTasks = useMemo(() => getTopPriorityTasks(tasks, 5), [tasks]);
  const timeline = useMemo(() => buildActivityTimeline(tasks), [tasks]);
  const suggestions = useMemo(() => getAiDailySuggestions(tasks), [tasks]);
  const stage = useMemo(
    () => getJourneyStage(metrics.totalCompleted),
    [metrics.totalCompleted]
  );

  const assistantMsgs = messages.filter((m) => m.role === "assistant");
  const lastAI = assistantMsgs[assistantMsgs.length - 1]?.text;
  const companionLine = useMemo(
    () => getXiaoguangLine(tasks, lastAI),
    [tasks, lastAI]
  );
  const mood = useMemo(() => getTodayMoodLabel(tasks), [tasks]);

  const today = getTodayDateString();
  const todayFocus = useMemo(
    () =>
      tasks
        .filter((t) => t.date === today)
        .reduce((s, t) => s + (t.pomodoroMinutes ?? 0), 0),
    [tasks, today]
  );

  const aiChatCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Hero：成长空间，非任务后台 */}
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-amber-50/95 via-white/70 to-orange-100/50 p-6 shadow-[0_20px_50px_-28px_rgba(251,146,60,0.45)] backdrop-blur-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-200/30 blur-2xl" aria-hidden />
        <p className="text-xs tracking-[0.2em] text-stone-400">成长空间</p>
        <TimeGreeting className="mt-2 text-xl font-semibold text-stone-800 sm:text-2xl" />
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
          {companionLine}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-stone-600">
            今日 · {mood}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-orange-700">
            连续成长 {metrics.streak} 天
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-emerald-700">
            专注 {todayFocus} 分钟
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-amber-800">
            {stage.emoji} {stage.label}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/today"
            className="rounded-full bg-orange-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-orange-600"
          >
            去 Today 慢慢做
          </Link>
          <Link
            href="/journey"
            className="rounded-full border border-orange-200/80 bg-white/70 px-4 py-2 text-xs font-medium text-orange-700 transition hover:bg-orange-50"
          >
            看看人生地图 →
          </Link>
        </div>
      </section>

      {/* 今日重点任务（3–5） */}
      <section className="rounded-3xl border border-orange-100/50 bg-white/85 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-800">今日重点任务</h3>
          <Link href="/today" className="text-xs text-orange-600 hover:underline">
            全部在 Today →
          </Link>
        </div>
        <p className="mt-1 text-xs text-stone-500">只放最重要的事，不必一次做完</p>
        <ul className="mt-4 space-y-2">
          {topTasks.length === 0 ? (
            <li className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
              今天还没有小目标，去 Today 添一件最小的事就好。
            </li>
          ) : (
            topTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl bg-stone-50/90 px-4 py-3 text-sm text-stone-700"
              >
                <span
                  className={t.done ? "text-emerald-600" : "text-stone-400"}
                  aria-hidden
                >
                  {t.done ? "✓" : "○"}
                </span>
                <span className={t.done ? "line-through opacity-60" : ""}>
                  {t.text}
                </span>
                {t.priority === "high" && !t.done && (
                  <span className="ml-auto text-xs text-amber-700">重要</span>
                )}
              </li>
            ))
          )}
        </ul>
      </section>

      {/* 成长仪表盘 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "本周完成率", value: `${metrics.weekRate}%`, tone: "text-orange-600" },
          { label: "本周专注", value: `${metrics.weekFocus} 分钟`, tone: "text-emerald-600" },
          { label: "AI 对话", value: `${aiChatCount} 次`, tone: "text-amber-700" },
          {
            label: "成长趋势",
            value: metrics.streak >= 3 ? "稳步亮起来" : "温柔起步",
            tone: "text-stone-700",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-orange-50/80 bg-white/80 p-4 backdrop-blur-sm"
          >
            <p className="text-xs text-stone-400">{item.label}</p>
            <p className={`mt-2 text-lg font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 学习轨迹时间线 */}
        <section className="rounded-3xl border border-orange-100/40 bg-white/85 p-5">
          <h3 className="text-sm font-semibold text-stone-800">学习轨迹</h3>
          <p className="mt-1 text-xs text-stone-500">今天走过的一小段路</p>
          <ul className="mt-4 space-y-3">
            {timeline.length === 0 ? (
              <li className="text-sm text-stone-500">
                还没有点亮记录，完成一件小事就会出现在这里。
              </li>
            ) : (
              timeline.map((row, i) => (
                <li key={`${row.time}-${i}`} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-mono text-xs text-stone-400">
                    {row.time}
                  </span>
                  <span className="text-emerald-600" aria-hidden>
                    ✓
                  </span>
                  <span className="text-stone-700">
                    {row.label}
                    <span className="text-stone-400"> · {row.detail}</span>
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* AI 今日建议 */}
        <section className="rounded-3xl border border-amber-100/50 bg-gradient-to-br from-amber-50/50 to-white/90 p-5">
          <h3 className="text-sm font-semibold text-stone-800">小光今日建议</h3>
          <p className="mt-1 text-xs text-stone-500">节奏与鼓励，不是 KPI</p>
          <ul className="mt-4 space-y-3">
            {suggestions.map((s) => (
              <li
                key={s}
                className="rounded-2xl bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-stone-600"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
