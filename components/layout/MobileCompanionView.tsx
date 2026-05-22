"use client";

import CompanionRail from "@/components/companion/CompanionRail";
import ChatPanel from "@/components/chat/ChatPanel";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

/** 手机端：轻量陪伴 */
export default function MobileCompanionView() {
  const mobileTab = useUIStore((s) => s.mobileTab);

  if (mobileTab !== "companion") return null;

  return (
    <div className={[panelClass, "flex min-w-0 flex-col gap-3"].join(" ")}>
      <CompanionRail variant="mobile" />
      <div className="min-w-0 border-t border-orange-100/60 pt-3">
        <p className="mb-2 text-sm font-semibold text-stone-700">小光在线 · 随时陪你</p>
        <ChatPanel showHeader={false} />
      </div>
    </div>
  );
}
