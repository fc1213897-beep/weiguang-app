"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import GrowthHubView from "@/components/growth/GrowthHubView";
import type { AppRouteId } from "@/components/layout/AppShell";
import DesktopLedgerView from "@/components/todo/views/DesktopLedgerView";
import MeView from "@/components/todo/views/MeView";
import TodayHubView from "@/components/todo/views/TodayHubView";
import { panelClass } from "@/lib/tokens";
import { Suspense } from "react";

type Props = {
  route: AppRouteId;
};

const ROUTE_TITLES: Partial<Record<AppRouteId, string>> = {
  growth: "成长轨迹",
  home: "成长轨迹",
  journey: "成长轨迹",
  stats: "成长轨迹",
  ledger: "生活记账",
};

function RouteContent({ route }: Props) {
  switch (route) {
    case "growth":
    case "home":
    case "journey":
    case "stats":
      return <GrowthHubView />;
    case "ledger":
      return <DesktopLedgerView />;
    case "me":
    case "settings":
      return <MeView />;
    case "today":
    case "tasks":
    case "chat":
      return <TodayHubView />;
    default:
      return null;
  }
}

/** 手机端：独立子页面（非 Tab 主流程） */
export default function MobileRouteView({ route }: Props) {
  const router = useRouter();
  const title = ROUTE_TITLES[route] ?? "微光";

  const content: ReactNode = (
    <Suspense
      fallback={
        <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
      }
    >
      <RouteContent route={route} />
    </Suspense>
  );

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={() => router.push("/me")}
          className="flex min-h-[44px] shrink-0 items-center gap-0.5 rounded-lg px-2 text-sm text-stone-600 active:bg-stone-100"
        >
          ‹ 返回
        </button>
        <h2 className="min-w-0 truncate text-base font-semibold text-stone-800">
          {title}
        </h2>
      </div>
      <div className={[panelClass, "min-w-0 [&_button]:min-h-[44px]"].join(" ")}>
        {content}
      </div>
    </div>
  );
}
