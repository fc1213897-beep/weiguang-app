"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useUIStore } from "@/store/uiStore";

/** 完成任务后的小光轻提示（约 3 秒消失） */
export default function CompanionToast() {
  const message = useUIStore((s) => s.companionToast);
  const clearCompanionToast = useUIStore((s) => s.clearCompanionToast);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => clearCompanionToast(), 3200);
    return () => window.clearTimeout(t);
  }, [message, clearCompanionToast]);

  if (!message) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-24 left-1/2 z-[130] max-w-[min(90vw,360px)] -translate-x-1/2 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-3 text-center text-sm leading-relaxed text-stone-700 shadow-lg lg:bottom-28"
      role="status"
    >
      <span className="mr-1.5" aria-hidden>
        🌙
      </span>
      {message}
    </div>,
    document.body
  );
}
