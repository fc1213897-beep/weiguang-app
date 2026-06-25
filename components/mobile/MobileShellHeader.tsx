"use client";

import MobileHeaderAuth from "@/components/auth/MobileHeaderAuth";
import { formatDaysLeft } from "@/lib/countdown/progress-utils";
import { getWeekMetrics } from "@/lib/growth-utils";
import { computeTaskStats, getTodayDateString } from "@/lib/task-utils";
import { useCountdownStore } from "@/store/countdownStore";
import { useTodoStore } from "@/store/todoStore";
import { useUIStore } from "@/store/uiStore";
import { useMemo } from "react";

/** 手机顶栏：考研语境下的状态摘要 */
export default function MobileShellHeader() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const tasks = useTodoStore((s) => s.tasks);
  const targets = useCountdownStore((s) => s.settings.targets);

  const active = useMemo(
    () => targets.find((t) => t.status === "active"),
    [targets]
  );

  const subtitle = useMemo(() => {
    if (mobileTab === "chat") return "累了就聊聊，小光一直陪着你";
    if (mobileTab === "me") return "账号 · 备考计划 · 成长数据";

    const { streak } = getWeekMetrics(tasks);
    const todayStats = computeTaskStats(
      tasks.filter((t) => t.date === getTodayDateString())
    );

    if (active) {
      const days = formatDaysLeft(active);
      const dayPart = days > 0 ? `距考研 ${days} 天` : "考试日";
      const taskPart =
        todayStats.total > 0
          ? ` · 今日 ${todayStats.completed}/${todayStats.total}`
          : "";
      return `${dayPart} · 连续 ${streak} 天${taskPart}`;
    }

    return `连续坚持 ${streak} 天 · 今天也要温柔地前进`;
  }, [mobileTab, tasks, active]);

  return (
    <div className="flex items-center justify-between gap-2 px-1 py-1">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-orange-600">微光</h1>
        <p className="truncate text-[11px] text-stone-500">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <MobileHeaderAuth />
      </div>
    </div>
  );
}
