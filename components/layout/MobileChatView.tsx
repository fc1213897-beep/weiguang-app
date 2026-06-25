"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import { getXiaoguangLine } from "@/lib/growth-utils";
import { MOBILE_CHAT_MIN_H } from "@/lib/layout";
import { panelClass } from "@/lib/tokens";
import { useTodoStore } from "@/store/todoStore";
import { useUIStore } from "@/store/uiStore";
import { useMemo } from "react";

const CHAT_HINTS = [
  "今天背了多少单词？",
  "数学卡在哪一章了？",
  "有点焦虑，陪我聊聊",
  "帮我定一个今晚的小目标",
];

/** 手机端小光聊天 */
export default function MobileChatView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const tasks = useTodoStore((s) => s.tasks);
  const line = useMemo(() => getXiaoguangLine(tasks), [tasks]);

  if (mobileTab !== "chat") return null;

  return (
    <section
      className={[panelClass, "flex flex-col"].join(" ")}
      style={{ minHeight: MOBILE_CHAT_MIN_H }}
    >
      <header className="mb-2 shrink-0 border-b border-orange-100/60 pb-3">
        <h2 className="text-base font-semibold text-stone-800">和小光聊聊</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">{line}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CHAT_HINTS.map((hint) => (
            <span
              key={hint}
              className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] text-orange-700/90 ring-1 ring-orange-100"
            >
              {hint}
            </span>
          ))}
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <ChatPanel showHeader={false} variant="drawer" />
      </div>
    </section>
  );
}
