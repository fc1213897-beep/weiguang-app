"use client";

import { useEffect, useState } from "react";
import { getWelcomeContent } from "@/lib/time-greeting";

const SESSION_WELCOME_KEY = "weiguang-welcome-seen";

/** 小光虚拟形象欢迎弹窗：本会话首次进入时展示 */
export default function CharacterModal() {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [companion, setCompanion] = useState("");

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (sessionStorage.getItem(SESSION_WELCOME_KEY)) return;

      const { greeting: g, companion: c } = getWelcomeContent();
      setGreeting(g);
      setCompanion(c);
      setOpen(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function handleStart() {
    sessionStorage.setItem(SESSION_WELCOME_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/25 p-4 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-orange-100/90 bg-gradient-to-b from-[#FFFBF5] via-white to-orange-50/80 p-6 shadow-[0_20px_60px_-16px_rgba(251,146,60,0.35)] sm:max-w-md sm:p-8">
        {/* 虚拟形象占位 */}
        <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center sm:mb-6 sm:h-32 sm:w-32">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200/60"
            aria-hidden
          />
          <span
            className="absolute -right-1 top-0 text-2xl sm:text-3xl"
            aria-hidden
          >
            ✨
          </span>
          <span
            className="absolute -left-1 bottom-2 text-xl opacity-80 sm:text-2xl"
            aria-hidden
          >
            ✨
          </span>
          <span className="relative text-6xl sm:text-7xl" aria-hidden>
            🌙
          </span>
        </div>

        <p
          id="character-modal-title"
          className="text-center text-lg font-semibold text-orange-500 sm:text-xl"
        >
          小光
        </p>

        <p className="mt-3 text-center text-sm leading-relaxed text-stone-600 sm:mt-4 sm:text-base sm:leading-7">
          {greeting}
        </p>

        <p className="mt-3 rounded-2xl bg-orange-50/80 px-4 py-3 text-center text-sm leading-relaxed text-stone-500 sm:mt-4">
          {companion}
        </p>

        <button
          type="button"
          onClick={handleStart}
          className="mt-6 w-full rounded-2xl bg-orange-500 py-3.5 text-base font-medium text-white transition hover:bg-orange-600 active:scale-[0.98] sm:mt-8"
        >
          开始今天
        </button>
      </div>
    </div>
  );
}
