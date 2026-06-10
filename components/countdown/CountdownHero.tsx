"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  buildPlanSummaryLine,
  formatDaysLeft,
  getTargetProgress,
} from "@/lib/countdown/progress-utils";
import { useCountdownStore } from "@/store/countdownStore";
import { useTodoStore } from "@/store/todoStore";
import type { CountdownTarget } from "@/types/countdown";

function CountdownCard({ target }: { target: CountdownTarget }) {
  const tasks = useTodoStore((s) => s.tasks);
  const daysLeft = formatDaysLeft(target);
  const summary = buildPlanSummaryLine(target, tasks);
  const progress = getTargetProgress(tasks, target);
  const totalAuto = progress.reduce((s, p) => s + p.total, 0);
  const doneAuto = progress.reduce((s, p) => s + p.completed, 0);
  const rate =
    totalAuto > 0 ? Math.round((doneAuto / totalAuto) * 100) : 0;

  return (
    <div className="rounded-2xl border border-indigo-100/80 bg-white/80 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-stone-800">{target.title}</h3>
        {target.status === "paused" && (
          <span className="text-xs text-stone-400">已暂停</span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-indigo-700">
        {daysLeft > 0 ? (
          <>
            还有 <span className="text-3xl">{daysLeft}</span> 天
          </>
        ) : (
          "考试日已到"
        )}
      </p>
      <p className="mt-1 text-xs text-stone-500">
        目标日 {target.targetDate}
      </p>
      {summary && (
        <p className="mt-3 text-sm text-stone-600">{summary}</p>
      )}
      {totalAuto > 0 && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-indigo-400/80 transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-stone-400">
            备考任务已完成 {doneAuto}/{totalAuto}
          </p>
        </div>
      )}
    </div>
  );
}

/** 首页倒计时卡片 */
export default function CountdownHero() {
  const targets = useCountdownStore((s) => s.settings.targets);

  const activeTargets = useMemo(
    () =>
      targets.filter(
        (t) => t.status === "active" || t.status === "draft"
      ),
    [targets]
  );

  if (activeTargets.length === 0) return null;

  return (
    <section className="rounded-3xl border border-indigo-100/60 bg-gradient-to-br from-indigo-50/90 via-white/80 to-violet-50/60 p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs tracking-[0.15em] text-indigo-400/90">
            备考倒计时
          </p>
          <h3 className="mt-1 text-sm font-semibold text-stone-800">
            按节奏慢慢走
          </h3>
        </div>
        <Link
          href="/me?section=exam"
          className="shrink-0 text-xs text-indigo-600 hover:underline"
        >
          备考计划 →
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {activeTargets.map((t) => (
          <CountdownCard key={t.id} target={t} />
        ))}
      </div>
    </section>
  );
}
