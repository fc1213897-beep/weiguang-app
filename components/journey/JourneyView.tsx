"use client";

import { useMemo, useState } from "react";
import {
  getJourneyStage,
  getMapLightProgress,
  getWeekMetrics,
  getXiaoguangLine,
  JOURNEY_STAGES,
  OLD_TRAVELER_LINES,
  shouldShowOldTraveler,
} from "@/lib/growth-utils";
import { useChatStore } from "@/store/chatStore";
import { useTodoStore } from "@/store/todoStore";

/** 微光旅程：人生前进轨迹可视化 */
export default function JourneyView() {
  const tasks = useTodoStore((s) => s.tasks);
  const messages = useChatStore((s) => s.messages);
  const [travelerOpen, setTravelerOpen] = useState(false);

  const metrics = useMemo(() => getWeekMetrics(tasks), [tasks]);
  const stage = useMemo(
    () => getJourneyStage(metrics.totalCompleted),
    [metrics.totalCompleted]
  );
  const progress = useMemo(() => getMapLightProgress(tasks), [tasks]);
  const showTraveler = useMemo(() => shouldShowOldTraveler(tasks), [tasks]);
  const assistantMsgs = messages.filter((m) => m.role === "assistant");
  const lastAI = assistantMsgs[assistantMsgs.length - 1]?.text;
  const companionLine = useMemo(
    () => getXiaoguangLine(tasks, lastAI),
    [tasks, lastAI]
  );

  const litSegments = Math.round(progress * JOURNEY_STAGES.length);
  const foggy = metrics.streak === 0 && metrics.totalCompleted > 0;

  return (
    <div className="space-y-6">
      {/* 顶部状态 */}
      <section className="rounded-3xl border border-orange-100/60 bg-gradient-to-br from-amber-50/90 via-white/80 to-orange-50/70 p-5 backdrop-blur-md">
        <p className="text-xs tracking-wide text-stone-400">微光旅程</p>
        <h2 className="mt-1 text-2xl font-semibold text-stone-800">
          {stage.emoji} {stage.label}之路
        </h2>
        <p className="mt-2 text-sm text-stone-600">{companionLine}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-stone-600">
            连续成长 {metrics.streak} 天
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-orange-700">
            当前阶段 · {stage.label}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-emerald-700">
            累计点亮 {metrics.totalCompleted} 步
          </span>
        </div>
      </section>

      {/* 横向卷轴人生地图 */}
      <section className="relative overflow-hidden rounded-3xl border border-orange-100/50 bg-gradient-to-b from-indigo-950/5 via-amber-50/40 to-orange-50/60 p-4">
        <p className="mb-3 text-xs text-stone-500">
          路一直都在 · 完成一件，就往前点亮一小段
        </p>
        <div
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:thin]"
          aria-label="人生地图"
        >
          {JOURNEY_STAGES.map((s, idx) => {
            const lit = idx < litSegments;
            return (
              <div
                key={s.id}
                className={[
                  "relative min-w-[140px] shrink-0 rounded-2xl border p-4 transition-all duration-700",
                  lit
                    ? "border-amber-200/80 bg-gradient-to-br from-amber-100/90 to-orange-50/90 shadow-[0_8px_24px_-8px_rgba(251,191,36,0.35)]"
                    : "border-stone-200/60 bg-stone-100/50",
                  foggy && !lit ? "opacity-70" : "",
                ].join(" ")}
              >
                <span className="text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <p
                  className={[
                    "mt-2 text-sm font-medium",
                    lit ? "text-amber-900" : "text-stone-400",
                  ].join(" ")}
                >
                  {s.label}
                </p>
                {lit && (
                  <div className="mt-2 flex gap-1 text-xs" aria-hidden>
                    <span>✨</span>
                    <span>🪷</span>
                    {idx > 1 && <span>🧚</span>}
                  </div>
                )}
                {/* 路段光点 */}
                {idx < JOURNEY_STAGES.length - 1 && (
                  <div
                    className={[
                      "absolute -right-2 top-1/2 h-0.5 w-4 -translate-y-1/2",
                      lit ? "bg-amber-300" : "bg-stone-300/60",
                    ].join(" ")}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 旅行者光点 */}
        <div
          className="pointer-events-none absolute bottom-6 left-[max(1rem,calc(var(--lit,0)*100%))] transition-all duration-700"
          style={{ left: `${12 + progress * 72}%` }}
          aria-hidden
        >
          <span className="inline-block h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_12px_4px_rgba(251,191,36,0.6)] wg-character-breathe" />
        </div>

        {/* 永远保留的一盏灯 */}
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-800/80">
          <span aria-hidden>🏮</span>
          <span>无论快慢，这里永远留着一盏灯</span>
        </div>

        {/* 老旅人：地图边缘篝火，用户主动点击 */}
        {showTraveler && (
          <button
            type="button"
            onClick={() => setTravelerOpen(true)}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-900/10 px-3 py-1.5 text-xs text-amber-900 transition hover:bg-amber-100/60"
          >
            <span aria-hidden>🔥</span>
            山间有篝火
          </button>
        )}
      </section>

      {/* 地图氛围说明 */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/80 p-4">
          <p className="text-xs text-stone-400">完成任务</p>
          <p className="mt-1 text-sm text-stone-600">道路点亮、灯光与萤火会慢慢多起来</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4">
          <p className="text-xs text-stone-400">长期成长</p>
          <p className="mt-1 text-sm text-stone-600">旅程会穿过森林、湖泊，走向星空与海边</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4">
          <p className="text-xs text-stone-400">停下来时</p>
          <p className="mt-1 text-sm text-stone-600">
            {foggy ? "雾气会多一些，但灯不会熄灭" : "今晚的风很轻，适合慢慢走"}
          </p>
        </div>
      </section>

      {/* 老旅人对话（非强制弹窗） */}
      {travelerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/20 p-4 sm:items-center"
          onClick={() => setTravelerOpen(false)}
          role="presentation"
        >
          <div
            className="wg-modal-in w-full max-w-md rounded-3xl border border-amber-100/80 bg-gradient-to-br from-stone-800 to-stone-900 p-6 text-amber-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="traveler-title"
          >
            <p id="traveler-title" className="text-xs text-amber-200/80">
              老旅人 · 山间灯火
            </p>
            <div className="mt-4 space-y-3">
              {OLD_TRAVELER_LINES.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-amber-50/95">
                  「{line}」
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTravelerOpen(false)}
              className="mt-5 w-full rounded-2xl bg-amber-100/15 py-2.5 text-sm text-amber-100 transition hover:bg-amber-100/25"
            >
              谢谢，我再慢慢走走
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
