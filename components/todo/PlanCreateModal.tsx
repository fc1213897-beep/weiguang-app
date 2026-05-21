"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import PlanCreateForm from "@/components/todo/PlanCreateForm";
import { Z_MODAL } from "@/lib/layout";
import { useUIStore } from "@/store/uiStore";
import { useTodoStore } from "@/store/todoStore";

/** 新建计划弹窗：层级高于底部 Tab，内容区内部滚动 + 底栏固定提交 */
export default function PlanCreateModal() {
  const open = useUIStore((s) => s.createPlanOpen);
  const setCreatePlanOpen = useUIStore((s) => s.setCreatePlanOpen);
  const resetPlanDraft = useTodoStore((s) => s.resetPlanDraft);
  const addTask = useTodoStore((s) => s.addTask);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  function handleSubmit() {
    if (addTask()) handleClose();
  }

  if (!open || !mounted) return null;

  const dialog = (
    <div
      className="fixed inset-0 flex items-end justify-center bg-stone-900/35 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      style={{ zIndex: Z_MODAL }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-create-title"
      onClick={handleClose}
    >
      <div
        className="wg-modal-in flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-orange-100/90 bg-gradient-to-b from-[#FFFBF7] via-white to-orange-50/50 shadow-xl sm:max-w-md"
        style={{
          maxHeight: "min(88dvh, 720px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-orange-100/60 px-4 py-3 sm:px-5">
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
            className="rounded-full px-2.5 py-1 text-sm text-stone-400 hover:bg-orange-50"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <PlanCreateForm
            variant="mobile"
            showSubmitButton={false}
            onCreated={handleClose}
          />
        </div>

        <div
          className="shrink-0 border-t border-orange-100/60 bg-white/95 px-4 py-3 sm:px-5"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <Button fullWidth className="rounded-2xl py-3 text-base" onClick={handleSubmit}>
            放进今日计划 ✨
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
