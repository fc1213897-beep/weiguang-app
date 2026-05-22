"use client";

import { useEffect, useState } from "react";
import MobileAuthPanel from "@/components/auth/MobileAuthPanel";
import CharacterModal from "@/components/companion/CharacterModal";
import ChatPanel from "@/components/chat/ChatPanel";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import DesktopWorkbench from "@/components/layout/DesktopWorkbench";
import MobileCompanionView from "@/components/layout/MobileCompanionView";
import MobileDrawerMenu from "@/components/layout/MobileDrawerMenu";
import MobileChatView from "@/components/layout/MobileChatView";
import MobileTabNav from "@/components/layout/MobileTabNav";
import MobileTaskView from "@/components/layout/MobileTaskView";
import { MotionStyles } from "@/components/ui/motion-styles";
import { DESKTOP_GRID_CLASS, MOBILE_MAIN_PB } from "@/lib/layout";
import { panelClass } from "@/lib/tokens";

type RouteId = "home" | "today" | "tasks" | "chat" | "stats" | "settings";

/** 三栏工作台（桌面）+ 双 Tab（手机） */
export default function AppShell({ route = "home" }: { route?: RouteId }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <MotionStyles />
      <main
        className={[
          "wg-page-in min-h-screen p-3 sm:p-5",
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

          <section className={[panelClass, "min-w-0 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:p-6 lg:shadow-md"].join(" ")}>
            <div className="mb-4 flex items-center justify-between border-b border-orange-100/70 pb-3">
              <div>
                <p className="text-xs tracking-wide text-stone-400">WEIGUANG WORKSPACE</p>
                <p className="text-sm font-medium text-stone-700">今日也在稳步前进</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">在线</div>
            </div>
            {loading ? <div className="space-y-3"><div className="h-24 animate-pulse rounded-2xl bg-stone-100" /><div className="h-40 animate-pulse rounded-2xl bg-stone-100" /></div> : <DesktopWorkbench route={route} />}
          </section>

          <aside
            className={[
              panelClass,
              "flex min-h-0 min-w-0 flex-col lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-full lg:p-5",
            ].join(" ")}
          >
            <ChatPanel />
          </aside>
        </div>

        {/* 手机 */}
        <div className="mx-auto w-full min-w-0 max-w-7xl space-y-3 lg:hidden">
          <div className="flex items-center justify-between rounded-2xl border border-orange-100/70 bg-white/92 px-3 py-2">
            <div>
              <h1 className="text-base font-semibold text-stone-800">微光</h1>
              <p className="text-xs text-stone-500">温柔陪伴你的学习系统</p>
            </div>
            <MobileDrawerMenu />
          </div>
          <MobileAuthPanel />
          <MobileTaskView />
          <MobileCompanionView />
          <MobileChatView />
        </div>
      </main>

      <MobileTabNav />
      <CharacterModal />
    </>
  );
}