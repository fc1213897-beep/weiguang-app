"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/uiStore";

/** 完成任务后的小光轻提示（约 3 秒消失；今日任务页由 MobileCompleteFeedback 承接） */
export default function CompanionToast() {
  const message = useUIStore((s) => s.companionToast);
  const mobileTab = useUIStore((s) => s.mobileTab);
  const clearCompanionToast = useUIStore((s) => s.clearCompanionToast);
  const pathname = usePathname();
  const onMobileTaskPage =
    (pathname === "/today" || pathname === "/tasks") && mobileTab === "tasks";

  useEffect(() => {
    if (!message || onMobileTaskPage) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
    const t = window.setTimeout(() => clearCompanionToast(), 3200);
    return () => window.clearTimeout(t);
  }, [message, clearCompanionToast, onMobileTaskPage]);

  if (!message || onMobileTaskPage) return null;

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
