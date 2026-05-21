"use client";

import CharacterModal from "@/components/companion/CharacterModal";
import ChatPanel from "@/components/chat/ChatPanel";
import CompanionRail from "@/components/companion/CompanionRail";
import MobileTabNav from "@/components/layout/MobileTabNav";
import TaskPanel from "@/components/todo/TaskPanel";
import { MotionStyles } from "@/components/ui/motion-styles";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

/** 三栏工作台布局 + 手机 Tab */
export default function AppShell() {
  const mobileTab = useUIStore((s) => s.mobileTab);

  return (
    <>
      <MotionStyles />
      <main
        className={`wg-page-in min-h-screen overflow-x-hidden bg-[#FFF7ED] p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8`}
      >
        <div className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)_minmax(300px,400px)] lg:items-start lg:gap-5 xl:max-w-[88rem] xl:grid-cols-[240px_minmax(0,1fr)_400px] xl:gap-6">
          <aside
            className={[
              panelClass,
              "hidden flex-col lg:col-start-1 lg:row-start-1 lg:flex lg:sticky lg:top-8 lg:min-h-[calc(100vh-4rem)]",
            ].join(" ")}
          >
            <CompanionRail variant="desktop" />
          </aside>

          <section
            className={[
              panelClass,
              "lg:col-start-2 lg:row-start-1 lg:overflow-visible lg:p-7 lg:shadow-md",
              mobileTab === "tasks" ? "block" : "hidden",
              "lg:block",
            ].join(" ")}
          >
            <TaskPanel />
          </section>

          <aside
            className={[
              panelClass,
              "hidden min-w-0 flex-col lg:col-start-3 lg:row-start-1 lg:flex lg:sticky lg:top-8 lg:min-h-[calc(100vh-4rem)] lg:p-5",
            ].join(" ")}
          >
            <ChatPanel />
          </aside>

          <aside
            className={[
              panelClass,
              "w-full flex-col gap-3 lg:hidden",
              mobileTab === "companion" ? "flex" : "hidden",
            ].join(" ")}
          >
            <CompanionRail variant="mobile" />
            <div className="min-w-0 border-t border-orange-100/60 pt-3">
              <p className="mb-2 text-sm font-semibold text-stone-700">
                和小光聊聊
              </p>
              <ChatPanel showHeader={false} />
            </div>
            <p className="pb-1 text-center text-xs text-stone-400">
              陪你熬过备考的每一天
            </p>
          </aside>
        </div>

        <MobileTabNav />
        <CharacterModal />
      </main>
    </>
  );
}
