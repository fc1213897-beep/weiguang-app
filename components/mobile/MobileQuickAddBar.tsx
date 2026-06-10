"use client";

import {
  getRandomXiaoguangSuggestion,
  QUICK_PLAN_PRESETS,
} from "@/lib/task-plan";
import { useUIStore } from "@/store/uiStore";
import { useTodoStore } from "@/store/todoStore";

const KAOYAN_PRESETS = QUICK_PLAN_PRESETS.map((p) => ({
  ...p,
  label: p.text.includes("单词")
    ? "背单词"
    : p.text.includes("视频")
      ? "看课"
      : "刷题",
}));

/** 手机底部固定快捷添加条（在 Tab 栏上方） */
export default function MobileQuickAddBar() {
  const setCreatePlanOpen = useUIStore((s) => s.setCreatePlanOpen);
  const addTaskFromDraft = useTodoStore((s) => s.addTaskFromDraft);

  return (
    <div
      className="fixed left-0 right-0 z-[48] border-t border-orange-100/80 bg-white/95 px-3 py-2 backdrop-blur-sm lg:hidden"
      style={{
        bottom: "calc(3rem + max(0.5rem, env(safe-area-inset-bottom)))",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <button
          type="button"
          onClick={() => setCreatePlanOpen(true)}
          className="shrink-0 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.98]"
        >
          ＋ 添加
        </button>
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {KAOYAN_PRESETS.map((preset) => (
            <button
              key={preset.text}
              type="button"
              onClick={() =>
                addTaskFromDraft(
                  { ...preset, date: "", note: "" },
                  { useSelectedDate: true }
                )
              }
              className="shrink-0 rounded-full bg-stone-50 px-3 py-1.5 text-xs text-stone-600 ring-1 ring-stone-200/80 active:bg-orange-50 active:text-orange-700"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              addTaskFromDraft(getRandomXiaoguangSuggestion(), {
                useSelectedDate: true,
              })
            }
            className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-700 ring-1 ring-amber-200/80 active:bg-amber-100"
          >
            ✨ 小光建议
          </button>
        </div>
      </div>
    </div>
  );
}
