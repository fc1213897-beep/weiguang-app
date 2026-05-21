"use client";

import { useEffect } from "react";
import PlanCreateForm from "@/components/todo/PlanCreateForm";
import { useUIStore } from "@/store/uiStore";
import { useTodoStore } from "@/store/todoStore";

/** 新建计划弹窗（桌面 / 手机统一） */
export default function PlanCreateModal() {
  const open = useUIStore((s) => s.createPlanOpen);
  const setCreatePlanOpen = useUIStore((s) => s.setCreatePlanOpen);
  const resetPlanDraft = useTodoStore((s) => s.resetPlanDraft);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function handleClose() {
    resetPlanDraft();
    setCreatePlanOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-stone-900/30 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-create-title"
      onClick={handleClose}
    >
      <div
        className="wg-modal-in flex max-h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-orange-100/90 bg-gradient-to-b from-[#FFFBF7] via-white to-orange-50/50 shadow-xl sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-orange-100/60 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h2
              id="plan-create-title"
              className="text-lg font-semibold text-stone-800"
            >
              新建今日计划
            </h2>
            <p className="text-xs text-stone-500">慢慢填，不用一次做完美</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-2.5 py-1 text-sm text-stone-400 hover:bg-orange-50 hover:text-stone-600"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <PlanCreateForm onCreated={handleClose} />
        </div>
      </div>
    </div>
  );
}
