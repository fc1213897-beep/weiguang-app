"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ExpenseQuickAdd from "@/components/stats/ExpenseQuickAdd";
import { Z_FLOATING_CHAT, Z_FLOATING_CHAT_PANEL } from "@/lib/layout";

import { notifyExpenseChanged, OPEN_EXPENSE_MODAL_EVENT } from "@/lib/expense-events";

type Props = {
  /** 距底部的偏移，避免与小光 FAB 重叠 */
  bottomClass?: string;
};

/** 桌面端浮动「记一笔」入口 */
export default function FloatingExpenseEntry({
  bottomClass = "lg:bottom-28 lg:right-8",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EXPENSE_MODAL_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EXPENSE_MODAL_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleCreated() {
    notifyExpenseChanged();
    setOpen(false);
  }

  const ui = (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ zIndex: Z_FLOATING_CHAT - 1 }}
          className={[
            "fixed bottom-6 right-5 flex items-center gap-2.5 rounded-full",
            "border-2 border-rose-200/90 bg-gradient-to-r from-rose-50 via-white to-orange-50",
            "px-4 py-3 shadow-[0_10px_32px_-4px_rgba(244,63,94,0.35)]",
            "backdrop-blur-md transition hover:scale-[1.03] active:scale-[0.98]",
            "max-lg:bottom-[max(9.5rem,calc(8.5rem+env(safe-area-inset-bottom)))]",
            bottomClass,
          ].join(" ")}
          aria-label="快速记账"
        >
          <span className="shrink-0 text-2xl" aria-hidden>
            💰
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-rose-900">记账</span>
            <span className="text-[11px] text-rose-800/70">记一笔</span>
          </span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-stone-900/25 backdrop-blur-[3px]"
          style={{ zIndex: Z_FLOATING_CHAT_PANEL }}
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <aside
            className={[
              "absolute flex max-h-[min(88dvh,640px)] w-full flex-col overflow-hidden",
              "border border-orange-200/80 bg-white shadow-2xl",
              "bottom-0 left-0 right-0 rounded-t-3xl",
              "sm:left-auto sm:max-w-[min(100vw-2rem,480px)]",
              "lg:bottom-8 lg:right-8 lg:rounded-3xl",
              "wg-modal-in",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="快速记账"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-orange-100/80 bg-gradient-to-r from-rose-50/80 to-orange-50/50 px-4 py-3.5">
              <div>
                <p className="text-base font-semibold text-stone-800">记一笔</p>
                <p className="text-xs text-stone-500">与小程序账本同步</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-stone-200/80 bg-white px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
              >
                收起
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <ExpenseQuickAdd onCreated={handleCreated} variant="embedded" />
            </div>
          </aside>
        </div>
      )}
    </>
  );

  if (!mounted) return null;
  return createPortal(ui, document.body);
}
