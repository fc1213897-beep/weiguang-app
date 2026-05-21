"use client";

import AIChat from "@/components/chat/AIChat";
import { wgTokens } from "@/lib/tokens";

type Props = {
  showHeader?: boolean;
  className?: string;
};

/** 聊天区容器 */
export default function ChatPanel({
  showHeader = true,
  className = "",
}: Props) {
  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${className}`}>
      {showHeader && (
        <header className="mb-3 shrink-0 border-b border-orange-100/60 pb-3">
          <h2 className={wgTokens.typography.h3}>小光陪伴</h2>
          <p className="mt-1 text-xs text-stone-500">说说今天的心情吧</p>
        </header>
      )}
      <AIChat
        hideHeader
        className="mt-0 w-full min-w-0 max-w-full lg:min-h-[calc(100vh-11rem)] lg:flex lg:flex-col"
      />
    </div>
  );
}
