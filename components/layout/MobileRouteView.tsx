"use client";

import type { ReactNode } from "react";
import JourneyView from "@/components/journey/JourneyView";
import HomeDashboardView from "@/components/todo/views/HomeDashboardView";
import DesktopLedgerView from "@/components/todo/views/DesktopLedgerView";
import DesktopStatsView from "@/components/todo/views/DesktopStatsView";
import SettingsPlaceholder from "@/components/todo/views/SettingsPlaceholder";
import TodayPlanView from "@/components/todo/views/TodayPlanView";
import { panelClass } from "@/lib/tokens";

type RouteId =
  | "home"
  | "today"
  | "tasks"
  | "chat"
  | "journey"
  | "stats"
  | "ledger"
  | "settings";

type Props = {
  route: RouteId;
};

/** 手机端：独立子页面（非 Tab 主流程） */
export default function MobileRouteView({ route }: Props) {
  let content: ReactNode = null;

  switch (route) {
    case "home":
      content = <HomeDashboardView />;
      break;
    case "journey":
      content = <JourneyView />;
      break;
    case "today":
      content = <TodayPlanView />;
      break;
    case "stats":
      content = <DesktopStatsView />;
      break;
    case "ledger":
      content = <DesktopLedgerView />;
      break;
    case "settings":
      content = <SettingsPlaceholder />;
      break;
    default:
      return null;
  }

  return <div className={[panelClass, "min-w-0"].join(" ")}>{content}</div>;
}
