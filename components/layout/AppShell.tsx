"use client";

import CharacterModal from "@/components/companion/CharacterModal";
import ChatPanel from "@/components/chat/ChatPanel";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import DesktopWorkbench from "@/components/layout/DesktopWorkbench";
import MobileCompanionView from "@/components/layout/MobileCompanionView";
import MobileTabNav from "@/components/layout/MobileTabNav";
import MobileTaskView from "@/components/layout/MobileTaskView";
import { MotionStyles } from "@/components/ui/motion-styles";
import { DESKTOP_GRID_CLASS, MOBILE_MAIN_PB } from "@/lib/layout";
import { panelClass } from "@/lib/tokens";

/** 三栏工作台（桌面）+ 双 Tab（手机） */
export default function AppShell() {
  return (
    <>
      <MotionStyles />
      <main
        className={[
          "wg-page-in min-h-screen bg-[#FFF7ED] p-4 sm:p-6",
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
            <DesktopWorkbench />
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
        <div className="mx-auto w-full min-w-0 max-w-7xl lg:hidden">
          <MobileTaskView />
          <MobileCompanionView />
        </div>
      </main>

      <MobileTabNav />
      <CharacterModal />
    </>
  );
}
