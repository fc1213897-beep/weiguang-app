"use client";

import { useEffect, useRef, useState } from "react";
import { getGentleFallbackReply } from "@/lib/fallback-reply";
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  type AIChatStorage,
  type ChatMessage,
} from "@/lib/storage";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 0,
    role: "assistant",
    text: "嗨，我是小光。有什么想说的，都可以告诉我 ✨",
  },
];

function getNextIdFromMessages(messages: ChatMessage[]): number {
  if (messages.length === 0) return 1;
  return Math.max(...messages.map((m) => m.id)) + 1;
}

type Props = {
  className?: string;
  /** 外层已有标题时隐藏组件内标题，避免重复占位 */
  hideHeader?: boolean;
};

export default function AIChat({ className, hideHeader = false }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [replyIndex, setReplyIndex] = useState(0);
  const [storageReady, setStorageReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  // 首次进入：客户端挂载后从 localStorage 恢复聊天记录
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const saved = loadFromStorage<AIChatStorage | null>(
        STORAGE_KEYS.aiChat,
        null
      );

      if (saved?.messages?.length) {
        setMessages(saved.messages);
        setReplyIndex(saved.replyIndex ?? 0);
        idRef.current =
          saved.nextId ?? getNextIdFromMessages(saved.messages);
      }

      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 聊天记录变化后写入 localStorage
  useEffect(() => {
    if (!storageReady) return;

    saveToStorage<AIChatStorage>(STORAGE_KEYS.aiChat, {
      messages,
      replyIndex,
      nextId: idRef.current,
    });
  }, [messages, replyIndex, storageReady]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  async function fetchAIReply(
    userText: string,
    historyMessages: ChatMessage[]
  ): Promise<string> {
    const history = historyMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.text,
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history,
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok) {
        console.warn(
          "[AIChat] /api/chat 失败，使用兜底:",
          res.status,
          data.error ?? data
        );
        throw new Error("chat_api_failed");
      }

      if (!data.reply?.trim()) {
        console.warn("[AIChat] 回复为空，使用兜底");
        throw new Error("empty_reply");
      }

      return data.reply.trim();
    } catch (error) {
      console.warn("[AIChat] 调用千问失败，使用兜底回复", error);
      return getGentleFallbackReply(userText, replyIndex);
    }
  }

  async function sendMessage() {
    const value = input.trim();
    if (!value || isSending) return;

    const userMsg: ChatMessage = {
      id: idRef.current++,
      role: "user",
      text: value,
    };

    const historyBeforeSend = messages;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    const assistantText = await fetchAIReply(value, historyBeforeSend);

    const assistantMsg: ChatMessage = {
      id: idRef.current++,
      role: "assistant",
      text: assistantText,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setReplyIndex((i) => i + 1);
    setIsSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div
      className={[
        "flex w-full min-w-0 max-w-full flex-col rounded-2xl border border-orange-100/80 bg-gradient-to-b from-orange-50/60 to-[#FFFBF5] p-3 sm:p-4",
        className ?? "mt-4 sm:mt-6",
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
          "mb-3 min-h-[6rem] space-y-2.5 overflow-y-auto overflow-x-hidden rounded-xl bg-white/70 p-2.5 sm:p-3",
          "max-h-[min(11rem,34dvh)] sm:max-h-52",
          "lg:min-h-[18rem] lg:max-h-none lg:flex-1",
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
          <p className="text-xs text-stone-400">小光正在想怎么陪你…</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 lg:gap-2.5 xl:flex-row xl:items-center">
        <input
          className="w-full min-w-0 flex-1 rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-stone-400 focus:border-orange-300 disabled:opacity-60 sm:text-base"
          placeholder="例如：今天有点累…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button
          type="button"
          className="w-full shrink-0 rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          onClick={() => void sendMessage()}
          disabled={isSending}
        >
          {isSending ? "发送中…" : "发送"}
        </button>
      </div>
    </div>
  );
}
