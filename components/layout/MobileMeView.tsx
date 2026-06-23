"use client";

import Link from "next/link";
import AuthStatusBadge from "@/components/auth/AuthStatusBadge";
import CountdownLabPanel from "@/components/countdown/CountdownLabPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatDaysLeft } from "@/lib/countdown/progress-utils";
import { formatAppVersion } from "@/lib/app-version";
import { useWeekStreakMetrics } from "@/hooks/useWeekStreakMetrics";
import { panelClass } from "@/lib/tokens";
import { useCountdownStore } from "@/store/countdownStore";
import { useUIStore } from "@/store/uiStore";
import { useMemo } from "react";

const LINKS = [
  { href: "/growth", label: "成长轨迹", desc: "看坚持了多少天", icon: "🌱" },
  { href: "/ledger", label: "生活记账", desc: "记录日常花销", icon: "💰" },
] as const;

/** 手机端：我的 — 考研用户账号与备考入口 */
export default function MobileMeView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setAuthSheetOpen = useUIStore((s) => s.setAuthSheetOpen);
  const { isAuthenticated, authActionLoading, signOut } = useAuth();
  const { streak, totalCompleted } = useWeekStreakMetrics();
  const targets = useCountdownStore((s) => s.settings.targets);

  const active = useMemo(
    () => targets.find((t) => t.status === "active"),
    [targets]
  );

  if (mobileTab !== "me") return null;

  return (
    <div className={["min-w-0 space-y-3", panelClass].join(" ")}>
      <header className="border-b border-orange-100/60 pb-2">
        <h2 className="text-lg font-bold text-stone-800">我的</h2>
        <p className="text-xs text-stone-500">账号、备考计划与数据</p>
      </header>

      {/* 坚持数据卡片 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{streak}</p>
          <p className="text-[11px] text-stone-500">连续学习天</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{totalCompleted}</p>
          <p className="text-[11px] text-stone-500">累计完成</p>
        </div>
      </div>

      {/* 备考计划：手机端直接配置，不用跳 Web */}
      <section className="space-y-2">
        {active && (
          <p className="px-1 text-xs text-indigo-700/80">
            距 {active.title} 还有 {formatDaysLeft(active)} 天
          </p>
        )}
        <CountdownLabPanel />
      </section>

      <div className="rounded-xl border border-orange-100/80 bg-orange-50/30 px-3 py-3">
        <AuthStatusBadge onOpenLogin={() => setAuthSheetOpen(true)} />
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => setAuthSheetOpen(true)}
            className="mt-2 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white"
          >
            登录 / 注册（同步云端）
          </button>
        )}
        {isAuthenticated && (
          <Button
            variant="soft"
            fullWidth
            className="mt-2"
            disabled={authActionLoading}
            onClick={() => signOut()}
          >
            {authActionLoading ? "退出中…" : "退出登录"}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-xl border border-stone-200/70 bg-white px-3 py-3 active:bg-stone-50"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span>
                <span className="block text-sm font-medium text-stone-800">
                  {item.label}
                </span>
                <span className="text-[11px] text-stone-400">{item.desc}</span>
              </span>
            </span>
            <span className="text-stone-400">›</span>
          </Link>
        ))}
      </div>

      <p className="text-center text-[11px] text-stone-400">{formatAppVersion()}</p>
    </div>
  );
}
