"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import TaskStats from "@/components/todo/TaskStats";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

export default function MobileChatView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  if (mobileTab !== "chat") return null;

  return (
    <section className={[panelClass, "flex min-h-[72dvh] flex-col"].join(" ")}>
      <header className="mb-3 shrink-0 border-b border-orange-100/60 pb-3">
        <p className="text-xs font-medium text-amber-600">CHAT</p>
        <h2 className="mt-0.5 text-base font-semibold text-stone-800">和小光聊聊</h2>
        <p className="mt-1 text-xs text-stone-500">说说今天的心情与计划</p>
        <div className="mt-2">
          <TaskStats variant="companion" />
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <ChatPanel showHeader={false} variant="drawer" />
      </div>
    </section>
  );
}
