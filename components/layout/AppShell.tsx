"use client";

import { useEffect, useState } from "react";
import MobileHeaderAuth from "@/components/auth/MobileHeaderAuth";
import MobileAuthSheet from "@/components/auth/MobileAuthSheet";
import FloatingChatEntry from "@/components/chat/FloatingChatEntry";
import CompanionToast from "@/components/companion/CompanionToast";
import CharacterModal from "@/components/companion/CharacterModal";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import DesktopWorkbench from "@/components/layout/DesktopWorkbench";
import MobileChatView from "@/components/layout/MobileChatView";
import MobileDrawerMenu from "@/components/layout/MobileDrawerMenu";
import MobileMeView from "@/components/layout/MobileMeView";
import MobileRouteView from "@/components/layout/MobileRouteView";
import MobileTabNav from "@/components/layout/MobileTabNav";
import MobileTaskView from "@/components/layout/MobileTaskView";
import { MotionStyles } from "@/components/ui/motion-styles";
import { DESKTOP_GRID_CLASS, MOBILE_MAIN_PB } from "@/lib/layout";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";
import type { MobileTabId } from "@/types/ui";

export type AppRouteId =
  | "today"
  | "growth"
  | "ledger"
  | "chat"
  | "me"
  /** 旧路由兼容 */
  | "home"
  | "journey"
  | "tasks"
  | "stats"
  | "settings";

/** 手机端 Tab 主流程（打开即今日任务） */
const MOBILE_TAB_ROUTES: AppRouteId[] = [
  "today",
  "tasks",
  "chat",
  "me",
  "settings",
];

const ROUTE_TO_TAB: Partial<Record<AppRouteId, MobileTabId>> = {
  today: "tasks",
  tasks: "tasks",
  chat: "chat",
  me: "me",
  settings: "me",
};

/** 三栏工作台（桌面）+ 手机端多视图 */
export default function AppShell({ route = "today" }: { route?: AppRouteId }) {
  const [loading, setLoading] = useState(true);
  const setMobileTab = useUIStore((s) => s.setMobileTab);
  const setCompanionOpen = useUIStore((s) => s.setCompanionOpen);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const tab = ROUTE_TO_TAB[route];
    if (tab) setMobileTab(tab);
  }, [route, setMobileTab]);

  /** 桌面访问 /chat 时自动打开小光浮动层 */
  useEffect(() => {
    if (route !== "chat") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) {
      setCompanionOpen(true);
    }
  }, [route, setCompanionOpen]);

  const isMobileTabRoute = MOBILE_TAB_ROUTES.includes(route);
  /** 手机端始终展示底 Tab，二级页（成长/记账）也可一键回今日任务 */
  const showMobileTabs = true;

  return (
    <>
      <MotionStyles />
      <main
        className={[
          "wg-page-in min-h-screen p-2 sm:p-4",
          MOBILE_MAIN_PB,
          "lg:p-6 lg:pb-6 xl:p-8",
        ].join(" ")}
      >
        {/* 桌面 */}
        <div
          className={[
            "mx-auto hidden w-full min-w-0 max-w-[90rem] gap-5",
            DESKTOP_GRID_CLASS,
            "lg:min-h-[calc(100vh-3rem)]",
          ].join(" ")}
        >
          <div
            className={[
              panelClass,
              "flex flex-col lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:p-4",
            ].join(" ")}
          >
            <DesktopSidebar />
          </div>

          <section
            className={[
              panelClass,
              "min-w-0 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:p-6 lg:shadow-md",
            ].join(" ")}
          >
            <div className="mb-4 flex items-center justify-between border-b border-orange-100/70 pb-3">
              <div>
                <p className="text-xs tracking-wide text-stone-400">
                  微光 · 成长工作台
                </p>
                <p className="text-sm font-medium text-stone-700">
                  人生不是冲刺，而是慢慢亮起来的路
                </p>
              </div>
              <div className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800">
                温柔在线
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
                <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
              </div>
            ) : (
              <DesktopWorkbench route={route} />
            )}
          </section>
        </div>

        {/* 手机 */}
        <div className="mx-auto w-full min-w-0 max-w-7xl space-y-2 lg:hidden">
          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <h1 className="text-lg font-bold text-orange-600">微光</h1>
            <div className="flex shrink-0 items-center gap-2">
              <MobileHeaderAuth />
              <MobileDrawerMenu />
            </div>
          </div>

          {isMobileTabRoute ? (
            <>
              <MobileTaskView />
              <MobileChatView />
              <MobileMeView />
            </>
          ) : (
            <MobileRouteView route={route} />
          )}
        </div>
      </main>

      {showMobileTabs ? <MobileTabNav /> : null}
      <MobileAuthSheet />
      <CharacterModal />
      <FloatingChatEntry />
      <CompanionToast />
    </>
  );
}
