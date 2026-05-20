"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const DEFAULT_REPLIES = [
  "今天先完成一个小目标就很好。",
  "累的话可以慢一点，我们一点点来。",
  "哪怕只是背 5 个单词，也是在前进。",
  "不用一下子做到完美，有在努力就够了。",
  "我在这儿陪你，一步一步来。",
];

function getGentleReply(userText: string, index: number): string {
  const t = userText;

  if (/累|疲|困|睡/.test(t)) {
    return "累的话就歇一歇也没关系，缓过来了我们再慢慢开始。";
  }
  if (/焦虑|烦|压力|慌|内耗/.test(t)) {
    return "别急，我们先做眼前这一小步，就已经很好了。";
  }
  if (/不想|摆烂|放弃|学不动/.test(t)) {
    return "那今天先完成一个最小的任务吧，也算是在往前走。";
  }
  if (/难|学不会|看不懂|跟不上/.test(t)) {
    return "难的时候很正常，拆成小一点，就会轻松很多。";
  }
  if (/坚持|长期|备考|考研/.test(t)) {
    return "长期的事本来就需要耐心，你能走到这里已经很棒了。";
  }

  return DEFAULT_REPLIES[index % DEFAULT_REPLIES.length];
}

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      text: "嗨，我是小光。有什么想说的，都可以告诉我 ✨",
    },
  ]);
  const [replyIndex, setReplyIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  function sendMessage() {
    const value = input.trim();
    if (!value) return;

    const userMsg: Message = {
      id: idRef.current++,
      role: "user",
      text: value,
    };

    const assistantText = getGentleReply(value, replyIndex);
    const assistantMsg: Message = {
      id: idRef.current++,
      role: "assistant",
      text: assistantText,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setReplyIndex((i) => i + 1);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="mt-4 flex flex-col rounded-2xl border border-orange-100/80 bg-gradient-to-b from-orange-50/60 to-[#FFFBF5] p-3 sm:mt-6 sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          💬
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-700">和小光聊聊</p>
          <p className="text-xs text-stone-500">说说今天的心情吧</p>
        </div>
      </div>

      <div
        ref={listRef}
        className="mb-3 max-h-44 space-y-2.5 overflow-y-auto rounded-xl bg-white/70 p-2.5 sm:max-h-52 sm:p-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[85%]",
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
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="w-full flex-1 rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-stone-400 focus:border-orange-300 sm:text-base"
          placeholder="例如：今天有点累…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="w-full shrink-0 rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500 sm:w-auto"
          onClick={sendMessage}
        >
          发送
        </button>
      </div>
    </div>
  );
}
