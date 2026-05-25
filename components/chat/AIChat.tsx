"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";

type Props = {
  className?: string;
  hideHeader?: boolean;
  /** drawer：浮动面板内全高度自适应，避免输入区被裁切 */
  variant?: "default" | "drawer";
};

export default function AIChat({
  className,
  hideHeader = false,
  variant = "default",
}: Props) {
  const isDrawer = variant === "drawer";
  const messages = useChatStore((s) => s.messages);
  const input = useChatStore((s) => s.input);
  const isSending = useChatStore((s) => s.isSending);
  const fadeInAssistantId = useChatStore((s) => s.fadeInAssistantId);
  const setInput = useChatStore((s) => s.setInput);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div
      className={[
        "flex w-full min-w-0 max-w-full flex-col",
        isDrawer
          ? "min-h-0 flex-1 bg-transparent p-0"
          : "rounded-2xl border border-orange-100/80 bg-gradient-to-b from-orange-50/40 to-white p-3 sm:p-4",
        className ?? (isDrawer ? "" : "mt-4 sm:mt-6"),
      ].join(" ")}
    >
      {!hideHeader && (
        <div className="mb-3 flex shrink-0 items-center gap-2">
          <span className="text-lg" aria-hidden>
            💬
          </span>
          <p className="text-sm font-semibold text-stone-700">和小光聊聊</p>
        </div>
      )}

      <div
        ref={listRef}
        className={[
          "space-y-2.5 overflow-y-auto overflow-x-hidden",
          isDrawer
            ? "min-h-0 flex-1 rounded-xl border border-orange-100/60 bg-white/90 p-3"
            : [
                "mb-3 min-h-[7rem] rounded-xl border border-orange-100/60 bg-white/85 p-2.5 sm:p-3",
                "max-h-[min(11rem,34dvh)] sm:max-h-52",
                "lg:min-h-[18rem] lg:max-h-none lg:flex-1",
              ].join(" "),
        ].join(" ")}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[92%] break-words rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[85%] lg:max-w-[90%]",
                msg.role === "user"
                  ? "rounded-br-md bg-orange-400 text-white"
                  : "rounded-bl-md bg-amber-50 text-stone-700 ring-1 ring-amber-100/80",
                msg.role === "assistant" && msg.id === fadeInAssistantId
                  ? "wg-msg-fade-in"
                  : "",
              ].join(" ")}
            >
              {msg.role === "assistant" && (
                <span className="mb-0.5 block text-xs font-medium text-orange-500/90">
                  小光
                </span>
              )}
              {msg.text}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start" aria-live="polite" aria-busy="true">
            <div className="rounded-bl-md bg-amber-50 px-3 py-2.5 ring-1 ring-amber-100/80">
              <span className="mb-0.5 block text-xs font-medium text-orange-500/90">
                小光
              </span>
              <p className="flex items-center gap-1 text-sm text-stone-500">
                正在思考
                <span className="inline-flex gap-0.5" aria-hidden>
                  <span className="wg-thinking-dot">.</span>
                  <span className="wg-thinking-dot">.</span>
                  <span className="wg-thinking-dot">.</span>
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={[
          "flex shrink-0 flex-col gap-2",
          isDrawer ? "mt-3 border-t border-orange-100/70 pt-3" : "lg:gap-2.5 xl:flex-row xl:items-center",
        ].join(" ")}
      >
        <input
          className="w-full min-w-0 flex-1 rounded-xl border border-orange-200/90 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 sm:text-base"
          placeholder="例如：今天有点累…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <Button
          className="w-full rounded-xl sm:w-auto"
          onClick={() => void sendMessage()}
          disabled={isSending}
        >
          {isSending ? "发送中…" : "发送"}
        </Button>
      </div>
    </div>
  );
}
