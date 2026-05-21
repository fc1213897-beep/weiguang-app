"use client";

import DesktopCompanionView from "@/components/todo/views/DesktopCompanionView";
import DesktopStatsView from "@/components/todo/views/DesktopStatsView";
import SettingsPlaceholder from "@/components/todo/views/SettingsPlaceholder";
import TaskManageView from "@/components/todo/views/TaskManageView";
import TodayPlanView from "@/components/todo/views/TodayPlanView";
import { useUIStore } from "@/store/uiStore";

/** 桌面端中间主内容区 */
export default function DesktopWorkbench() {
  const desktopNav = useUIStore((s) => s.desktopNav);

  switch (desktopNav) {
    case "today":
      return <TodayPlanView />;
    case "tasks":
      return <TaskManageView />;
    case "companion":
      return <DesktopCompanionView />;
    case "stats":
      return <DesktopStatsView />;
    case "settings":
      return <SettingsPlaceholder />;
    default:
      return <TodayPlanView />;
  }
}
