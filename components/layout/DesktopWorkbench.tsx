"use client";

import { Suspense } from "react";
import GrowthHubView from "@/components/growth/GrowthHubView";
import DesktopLedgerView from "@/components/todo/views/DesktopLedgerView";
import MeView from "@/components/todo/views/MeView";
import TodayHubView from "@/components/todo/views/TodayHubView";
import { useUIStore } from "@/store/uiStore";

/** 桌面端中间主内容区 */
export default function DesktopWorkbench({ route }: { route?: string }) {
  const desktopNav = useUIStore((s) => s.desktopNav);
  const current = route ?? desktopNav;

  switch (current) {
    case "today":
    case "tasks":
    case "chat":
      return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-stone-100" />}>
          <TodayHubView />
        </Suspense>
      );
    case "growth":
    case "home":
    case "journey":
    case "stats":
      return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-stone-100" />}>
          <GrowthHubView />
        </Suspense>
      );
    case "ledger":
      return <DesktopLedgerView />;
    case "me":
    case "settings":
      return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-stone-100" />}>
          <MeView />
        </Suspense>
      );
    default:
      return <TodayHubView />;
  }
}
