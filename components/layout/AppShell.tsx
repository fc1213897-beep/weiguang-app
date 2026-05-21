"use client";

import CharacterModal from "@/components/companion/CharacterModal";
import ChatPanel from "@/components/chat/ChatPanel";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import DesktopWorkbench from "@/components/layout/DesktopWorkbench";
import MobileCompanionView from "@/components/layout/MobileCompanionView";
import MobileTabNav from "@/components/layout/MobileTabNav";
import MobileTaskView from "@/components/layout/MobileTaskView";
import { MotionStyles } from "@/components/ui/motion-styles";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

/**
 * 桌面端：导航 + 工作台 + 右侧聊天
 * 手机端：Tab 切换轻量视图
 */
export default function AppShell() {
  const mobileTab = useUIStore((s) => s.mobileTab);

  return (
    <>
      <MotionStyles />
      <main
        className={[
          "wg-page-in min-h-screen bg-[#FFF7ED] p-4 sm:p-6",
          "max-lg:pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
          "lg:p-6 lg:pb-6 xl:p-8",
        ].join(" ")}
      >
        {/* 桌面：学习工作台 */}
        <div className="mx-auto hidden min-h-[calc(100vh-3rem)] w-full min-w-0 max-w-[88rem] gap-5 lg:grid lg:grid-cols-[200px_minmax(0,1fr)_minmax(300px,360px)]">
          <div className={[panelClass, "flex flex-col lg:sticky lg:top-6 lg:self-start lg:p-4"].join(" ")}>
            <DesktopSidebar />
          </div>

          <section className={[panelClass, "min-w-0 lg:p-6 lg:shadow-md"].join(" ")}>
            <DesktopWorkbench />
          </section>

          <aside
            className={[
              panelClass,
              "flex min-w-0 flex-col lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:p-4",
            ].join(" ")}
          >
            <ChatPanel />
          </aside>
        </div>

        {/* 手机：Tab 视图 */}
        <div className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden lg:hidden">
          <div
            className={[
              panelClass,
              mobileTab === "tasks" ? "block" : "hidden",
            ].join(" ")}
          >
            <MobileTaskView />
          </div>
          <div
            className={[
              panelClass,
              mobileTab === "companion" ? "block" : "hidden",
            ].join(" ")}
          >
            <MobileCompanionView />
          </div>
        </div>
      </main>

      <MobileTabNav />
      <CharacterModal />
    </>
  );
}
