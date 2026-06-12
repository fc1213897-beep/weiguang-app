"use client";

import type { ReactNode } from "react";
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
  const content: ReactNode = (
    <Suspense
      fallback={
        <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
      }
    >
      <RouteContent route={route} />
    </Suspense>
  );

  return <div className={[panelClass, "min-w-0"].join(" ")}>{content}</div>;
}
