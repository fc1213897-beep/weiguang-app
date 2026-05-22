"use client";

import {
  getRandomXiaoguangSuggestion,
  QUICK_PLAN_PRESETS,
} from "@/lib/task-plan";
import { useUIStore } from "@/store/uiStore";
import { useTodoStore } from "@/store/todoStore";

/** 首页轻量创建入口 */
export default function PlanQuickEntry() {
  const setCreatePlanOpen = useUIStore((s) => s.setCreatePlanOpen);
  const addTaskFromDraft = useTodoStore((s) => s.addTaskFromDraft);

  function handleXiaoguangQuick() {
    addTaskFromDraft(getRandomXiaoguangSuggestion(), {
      useSelectedDate: true,
    });
  }

  return (
    <div className="rounded-2xl border border-dashed border-orange-200/90 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/40 px-3 py-3 sm:rounded-3xl sm:px-4 sm:py-4">
      <button
        type="button"
        onClick={() => setCreatePlanOpen(true)}
        className="w-full rounded-2xl bg-orange-500 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.99] sm:text-base"
      >
        ＋ 新建今日计划
      </button>

      <button
        type="button"
        onClick={handleXiaoguangQuick}
        className="mt-2.5 w-full rounded-2xl bg-white py-2.5 text-sm font-medium text-orange-700 ring-1 ring-orange-200/70 transition hover:bg-orange-50/90"
      >
        ✨ 小光建议一个最小目标
      </button>

      <p className="mt-3 text-center text-xs text-stone-400">快速添加</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {QUICK_PLAN_PRESETS.map((preset) => (
          <button
            key={preset.text}
            type="button"
            onClick={() =>
              addTaskFromDraft(
                { ...preset, date: "", note: "" },
                { useSelectedDate: true }
              )
            }
            className="rounded-full bg-white px-3 py-1.5 text-xs text-stone-600 ring-1 ring-orange-100/80 transition hover:bg-orange-100/60 hover:text-orange-700 sm:text-sm"
          >
            {preset.text.includes("单词")
              ? "背单词"
              : preset.text.includes("视频")
                ? "看视频"
                : "写题"}
          </button>
        ))}
      </div>
    </div>
  );
}
