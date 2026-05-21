"use client";

import { useMemo } from "react";
import type { TaskItem } from "@/lib/storage";
import { computeTaskStats, getStatsScopeLabel } from "@/lib/task-utils";

type Props = {
  /** 参与统计的任务列表 */
  tasks: TaskItem[];
  /** 当前选中日期，用于展示统计范围 */
  selectedDate: string;
  /** full：任务区三栏；companion：陪伴区双栏（已完成更醒目） */
  variant?: "full" | "companion";
};

const FULL_STAT_ITEMS = [
  {
    key: "total" as const,
    label: "总任务",
    icon: "📋",
    valueClass: "text-orange-500",
    cardClass:
      "border-orange-100/80 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50",
  },
  {
    key: "completed" as const,
    label: "已完成",
    icon: "✨",
    valueClass: "text-emerald-600",
    cardClass:
      "border-emerald-100/80 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40",
  },
  {
    key: "pending" as const,
    label: "待完成",
    icon: "🌙",
    valueClass: "text-amber-700",
    cardClass:
      "border-amber-100/80 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40",
  },
];

export default function TaskStats({
  tasks,
  selectedDate,
  variant = "full",
}: Props) {
  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);
  const scopeLabel = getStatsScopeLabel(selectedDate);

  if (variant === "companion") {
    return (
      <div className="rounded-2xl border border-orange-100/60 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 p-3 sm:rounded-3xl sm:p-4">
        <p className="mb-3 text-sm text-stone-500">
          <span className="font-medium text-stone-600">{scopeLabel}</span>
          学习进度
        </p>

        <div className="flex flex-col gap-2.5">
          {/* 已完成：更醒目，仍保持温柔风格 */}
          <div className="rounded-2xl border-2 border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white p-4 shadow-[0_4px_20px_-8px_rgba(52,211,153,0.35)] ring-2 ring-emerald-100/70 sm:rounded-3xl sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100/90 text-lg"
                  aria-hidden
                >
                  ✨
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    已完成
                  </p>
                  <p className="text-xs text-emerald-600/80">做得很棒</p>
                </div>
              </div>
              <p className="text-3xl font-extrabold tabular-nums text-emerald-600 sm:text-4xl">
                {stats.completed}
              </p>
            </div>
          </div>

          {/* 未完成 */}
          <div className="rounded-2xl border border-amber-100/80 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 p-3.5 sm:rounded-3xl sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  🌙
                </span>
                <span className="text-sm text-stone-600">未完成</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-amber-700 sm:text-3xl">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const values = {
    total: stats.total,
    completed: stats.completed,
    pending: stats.pending,
  };

  return (
    <div>
      <p className="mb-3 text-sm text-stone-500">
        <span className="font-medium text-stone-600">{scopeLabel}</span>
        任务概览
      </p>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {FULL_STAT_ITEMS.map((item) => (
          <div
            key={item.key}
            className={[
              "min-w-[6.75rem] shrink-0 snap-start rounded-2xl border p-3.5 shadow-sm sm:min-w-0 sm:rounded-3xl sm:p-4",
              item.cardClass,
              item.key === "completed"
                ? "sm:ring-1 sm:ring-emerald-100/80"
                : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              <span className="text-xs text-stone-500 sm:text-sm">
                {item.label}
              </span>
            </div>
            <p
              className={[
                "mt-2 tabular-nums sm:mt-2.5",
                item.key === "completed"
                  ? "text-2xl font-extrabold sm:text-3xl"
                  : "text-2xl font-bold sm:text-3xl",
                item.valueClass,
              ].join(" ")}
            >
              {values[item.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
