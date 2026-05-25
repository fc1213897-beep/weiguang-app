"use client";

import AIChat from "@/components/chat/AIChat";
import { wgTokens } from "@/lib/tokens";

type Props = {
  showHeader?: boolean;
  className?: string;
  variant?: "default" | "drawer";
};

/** 聊天区容器 */
export default function ChatPanel({
  showHeader = true,
  className = "",
  variant = "default",
}: Props) {
  const isDrawer = variant === "drawer";

  return (
    <div
      className={[
        "flex min-h-0 min-w-0 flex-col",
        isDrawer ? "min-h-0 flex-1 overflow-hidden" : "flex-1",
        className,
      ].join(" ")}
    >
      {showHeader && (
        <header className="mb-3 shrink-0 border-b border-orange-100/60 pb-3">
          <h2 className={wgTokens.typography.h3}>小光陪伴</h2>
          <p className="mt-1 text-xs text-stone-500">说说今天的心情吧</p>
        </header>
      )}
      <AIChat
        hideHeader
        variant={variant}
        className={
          isDrawer
            ? "mt-0 min-h-0 w-full min-w-0 max-w-full flex-1"
            : "mt-0 w-full min-w-0 max-w-full lg:min-h-[calc(100vh-11rem)] lg:flex lg:flex-col"
        }
      />
    </div>
  );
}
