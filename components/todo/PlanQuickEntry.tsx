"use client";

import {
  getRandomXiaoguangSuggestion,
  QUICK_PLAN_PRESETS,
} from "@/lib/task-plan";
import { useUIStore } from "@/store/uiStore";
import { useTodoStore } from "@/store/todoStore";

type Props = {
  /** 手机任务页：单行小入口，不抢执行区 */
  compact?: boolean;
};

/** 轻量创建入口 */
export default function PlanQuickEntry({ compact = false }: Props) {
  const setCreatePlanOpen = useUIStore((s) => s.setCreatePlanOpen);
  const addTaskFromDraft = useTodoStore((s) => s.addTaskFromDraft);

  function handleXiaoguangQuick() {
    addTaskFromDraft(getRandomXiaoguangSuggestion(), {
      useSelectedDate: true,
    });
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreatePlanOpen(true)}
            className="shrink-0 rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium text-orange-700 active:bg-orange-50"
          >
            ＋ 添加
          </button>
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
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
                className="rounded-full bg-stone-50 px-2 py-0.5 text-[11px] text-stone-600 ring-1 ring-stone-200/80 active:bg-orange-50 active:text-orange-700"
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
        <button
          type="button"
          onClick={handleXiaoguangQuick}
          className="text-[11px] text-stone-400 active:text-orange-600"
        >
          ✨ 小光帮你想一个
        </button>
      </div>
    );
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
