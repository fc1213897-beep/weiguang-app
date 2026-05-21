"use client";

import { useMemo } from "react";
import type { TaskItem } from "@/lib/storage";
import { computeTaskStats, getStatsScopeLabel } from "@/lib/task-utils";

type Props = {
  /** 参与统计的任务列表（通常为当前选中日期的任务） */
  tasks: TaskItem[];
  /** 当前选中日期，用于展示统计范围 */
  selectedDate: string;
};

const STAT_ITEMS = [
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

export default function TaskStats({ tasks, selectedDate }: Props) {
  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);
  const scopeLabel = getStatsScopeLabel(selectedDate);

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

      {/* 手机端横向滚动；较宽屏幕三列网格 */}
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {STAT_ITEMS.map((item) => (
          <div
            key={item.key}
            className={[
              "min-w-[6.75rem] shrink-0 snap-start rounded-2xl border p-3.5 shadow-sm sm:min-w-0 sm:rounded-3xl sm:p-4",
              item.cardClass,
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
                "mt-2 text-2xl font-bold tabular-nums sm:mt-2.5 sm:text-3xl",
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
