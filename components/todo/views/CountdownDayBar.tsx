"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDaysLeft } from "@/lib/countdown/progress-utils";
import { useCountdownStore } from "@/store/countdownStore";

/** 今日页顶部：活跃备考倒计时摘要 */
export default function CountdownDayBar() {
  const targets = useCountdownStore((s) => s.settings.targets);

  const active = useMemo(
    () =>
      targets.find((t) => t.status === "active") ??
      targets.find((t) => t.status === "draft"),
    [targets]
  );

  if (!active) return null;

  const daysLeft = formatDaysLeft(active);

  return (
    <Link
      href="/me?section=exam"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-indigo-100/80 bg-indigo-50/50 px-4 py-3 text-sm text-indigo-900 transition hover:bg-indigo-50/80"
    >
      <span>
        距 <strong>{active.title}</strong> 还有{" "}
        <strong>{daysLeft > 0 ? `${daysLeft} 天` : "考试日"}</strong>
      </span>
      <span className="text-xs text-indigo-600">备考计划 →</span>
    </Link>
  );
}
