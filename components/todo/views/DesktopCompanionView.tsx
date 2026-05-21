"use client";

import XiaoguangAvatar from "@/components/companion/XiaoguangAvatar";

/** 桌面端：小光陪伴说明（聊天在右侧栏） */
export default function DesktopCompanionView() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200/80 bg-orange-50/30 px-6 py-10 text-center">
      <XiaoguangAvatar />
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone-600">
        小光在右侧等你。
        <br />
        想聊聊今天的心情、学习压力，或只是想随便说说话，都可以在那里找到我 ✨
      </p>
    </div>
  );
}
