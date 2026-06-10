"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/uiStore";

/** 手机今日页：完成任务后的正向互动横幅 */
export default function MobileCompleteFeedback() {
  const message = useUIStore((s) => s.companionToast);
  const clearCompanionToast = useUIStore((s) => s.clearCompanionToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 40, 30]);
    }
    const t = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => clearCompanionToast(), 280);
    }, 3400);
    return () => window.clearTimeout(t);
  }, [message, clearCompanionToast]);

  if (!message || !visible) return null;

  return (
    <div
      className="mobile-complete-pop overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-100 via-orange-50 to-rose-50 px-4 py-3.5 shadow-lg ring-1 ring-amber-200/50"
      role="status"
    >
      <style>{`
        @keyframes mobile-complete-pop {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          55% {
            transform: translateY(2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .mobile-complete-pop {
          animation: mobile-complete-pop 0.45s ease-out;
        }
      `}</style>
      <div className="flex items-start gap-2.5">
        <span className="text-2xl" aria-hidden>
          ✨
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-amber-800/90">小光说</p>
          <p className="mt-0.5 text-sm leading-relaxed text-stone-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
