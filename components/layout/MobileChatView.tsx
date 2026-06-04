"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

export default function MobileChatView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  if (mobileTab !== "chat") return null;

  return (
    <section
      className={[panelClass, "flex min-h-[calc(100dvh-9rem)] flex-col"].join(" ")}
    >
      <header className="mb-2 shrink-0 border-b border-orange-100/60 pb-2">
        <h2 className="text-base font-semibold text-stone-800">和小光聊聊</h2>
      </header>
      <div className="min-h-0 flex-1">
        <ChatPanel showHeader={false} variant="drawer" />
      </div>
    </section>
  );
}
