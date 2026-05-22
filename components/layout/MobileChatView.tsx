"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

export default function MobileChatView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  if (mobileTab !== "chat") return null;

  return (
    <section className={[panelClass, "min-h-[72dvh]"].join(" ")}>
      <header className="mb-3 border-b border-orange-100/60 pb-3">
        <h2 className="text-base font-semibold text-stone-800">和小光聊聊</h2>
        <p className="mt-1 text-xs text-stone-500">独立聊天页 · 更专注的陪伴时刻</p>
      </header>
      <ChatPanel showHeader={false} />
    </section>
  );
}
