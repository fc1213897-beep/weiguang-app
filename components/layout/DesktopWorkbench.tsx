"use client";

import JourneyView from "@/components/journey/JourneyView";
import DesktopCompanionView from "@/components/todo/views/DesktopCompanionView";
import HomeDashboardView from "@/components/todo/views/HomeDashboardView";
import DesktopLedgerView from "@/components/todo/views/DesktopLedgerView";
import DesktopStatsView from "@/components/todo/views/DesktopStatsView";
import SettingsPlaceholder from "@/components/todo/views/SettingsPlaceholder";
import TaskManageView from "@/components/todo/views/TaskManageView";
import TodayPlanView from "@/components/todo/views/TodayPlanView";
import { useUIStore } from "@/store/uiStore";

/** 桌面端中间主内容区 */
export default function DesktopWorkbench({ route }: { route?: string }) {
  const desktopNav = useUIStore((s) => s.desktopNav);
  const current = route ?? desktopNav;

  switch (current) {
    case "home":
      return <HomeDashboardView />;
    case "journey":
      return <JourneyView />;
    case "chat":
      return <DesktopCompanionView />;
    case "today":
      return <TodayPlanView />;
    case "tasks":
      return <TaskManageView />;
    case "companion":
      return <DesktopCompanionView />;
    case "stats":
      return <DesktopStatsView />;
    case "ledger":
      return <DesktopLedgerView />;
    case "settings":
      return <SettingsPlaceholder />;
    default:
      return <TodayPlanView />;
  }
}
