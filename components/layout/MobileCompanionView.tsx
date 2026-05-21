"use client";

import CompanionRail from "@/components/companion/CompanionRail";
import ChatPanel from "@/components/chat/ChatPanel";

/** 手机端：轻量陪伴 */
export default function MobileCompanionView() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <CompanionRail variant="mobile" />
      <div className="border-t border-orange-100/60 pt-3">
        <p className="mb-2 text-sm font-semibold text-stone-700">和小光聊聊</p>
        <ChatPanel showHeader={false} />
      </div>
    </div>
  );
}
