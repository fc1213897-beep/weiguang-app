"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getRandomXiaoguangSuggestion,
  POMODORO_OPTIONS,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
} from "@/lib/task-plan";
import type { PlanDraft } from "@/types/task";
import { useTodoStore } from "@/store/todoStore";

type Props = {
  variant?: "mobile" | "desktop";
  onCreated?: () => void;
  showSuggestionBlock?: boolean;
  /** 为 false 时由弹窗底栏提交（避免按钮被遮挡） */
  showSubmitButton?: boolean;
};

export default function PlanCreateForm({
  variant = "mobile",
  onCreated,
  showSuggestionBlock = true,
  showSubmitButton = true,
}: Props) {
  const planDraft = useTodoStore((s) => s.planDraft);
  const setPlanDraft = useTodoStore((s) => s.setPlanDraft);
  const addTask = useTodoStore((s) => s.addTask);
  const isDesktop = variant === "desktop";

  const [suggestion, setSuggestion] = useState<PlanDraft | null>(null);
  const [createdFlash, setCreatedFlash] = useState(false);

  function handleCreate() {
    const ok = addTask();
    if (!ok) return;
    setCreatedFlash(true);
    window.setTimeout(() => setCreatedFlash(false), 650);
    onCreated?.();
  }

  return (
    <>
      <style>{`
        @keyframes wg-plan-created {
          0% { box-shadow: 0 0 0 0 rgba(251, 191, 136, 0.45); }
          100% { box-shadow: 0 0 0 14px rgba(251, 191, 136, 0); }
        }
        .wg-plan-form-flash { animation: wg-plan-created 0.65s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .wg-plan-form-flash { animation: none; }
        }
      `}</style>

      <div
        className={[
          createdFlash ? "wg-plan-form-flash" : "",
          isDesktop
            ? "rounded-2xl border border-orange-100/80 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 p-4 sm:p-5"
            : "",
        ].join(" ")}
      >
        {isDesktop && (
          <h3 className="mb-4 text-base font-semibold text-stone-800">
            新建学习计划
          </h3>
        )}

        {showSuggestionBlock && (
          <div className="rounded-2xl border border-amber-100/80 bg-orange-50/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-orange-600/90">
                ✨ 小光建议
              </p>
              <button
                type="button"
                onClick={() => setSuggestion(getRandomXiaoguangSuggestion())}
                className="text-xs text-stone-400 hover:text-orange-500"
              >
                换一条
              </button>
            </div>
            <p className="mt-2 text-sm text-stone-600">
              {suggestion?.text ?? "点「采用」填入表单"}
            </p>
            <button
              type="button"
              onClick={() => {
                const next = suggestion ?? getRandomXiaoguangSuggestion();
                setPlanDraft({ ...next, date: planDraft.date });
                setSuggestion(next);
              }}
              className="mt-2 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-medium text-orange-700 ring-1 ring-orange-100 hover:bg-orange-50"
            >
              采用建议
            </button>
          </div>
        )}

        <div
          className={
            isDesktop
              ? "mt-4 grid gap-4 lg:grid-cols-2"
              : showSuggestionBlock
                ? "mt-4 space-y-4"
                : "space-y-4"
          }
        >
          <label className="block lg:col-span-2">
            <span className="text-xs font-medium text-stone-500">计划名称</span>
            <input
              className="mt-1.5 w-full min-w-0 rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-base outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              placeholder="例如：复习线性代数第一章"
              value={planDraft.text}
              onChange={(e) => setPlanDraft({ text: e.target.value })}
            />
          </label>

          {isDesktop && (
            <label className="block">
              <span className="text-xs font-medium text-stone-500">归属日期</span>
              <input
                type="date"
                className="mt-1.5 w-full min-w-0 rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-300"
                value={planDraft.date}
                onChange={(e) => setPlanDraft({ date: e.target.value })}
              />
            </label>
          )}

          <div className={isDesktop ? "" : ""}>
            <span className="text-xs font-medium text-stone-500">任务类型</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TASK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPlanDraft({ category: cat.id })}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-medium transition",
                    planDraft.category === cat.id
                      ? "bg-orange-500 text-white"
                      : "bg-white text-stone-600 ring-1 ring-orange-100/80",
                  ].join(" ")}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-stone-500">优先级</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TASK_PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanDraft({ priority: p.id })}
                  className={[
                    "rounded-xl py-2 text-xs font-medium",
                    planDraft.priority === p.id
                      ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200/70"
                      : "bg-white text-stone-500 ring-1 ring-stone-100",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={isDesktop ? "lg:col-span-2" : ""}>
            <span className="text-xs font-medium text-stone-500">番茄钟时长</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {POMODORO_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setPlanDraft({ pomodoroMinutes: opt.minutes })}
                  className={[
                    "rounded-xl px-3 py-2 text-xs font-medium",
                    planDraft.pomodoroMinutes === opt.minutes
                      ? "bg-orange-500 text-white"
                      : "bg-white text-stone-600 ring-1 ring-orange-100/80",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isDesktop && (
            <label className="block lg:col-span-2">
              <span className="text-xs font-medium text-stone-500">备注</span>
              <textarea
                className="mt-1.5 w-full min-w-0 resize-y rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                rows={2}
                placeholder="可选：写下提醒自己的话…"
                value={planDraft.note}
                onChange={(e) => setPlanDraft({ note: e.target.value })}
              />
            </label>
          )}
        </div>

        {showSubmitButton && (
          <Button
            fullWidth
            className={
              isDesktop
                ? "mt-4 max-w-xs rounded-2xl py-3"
                : "mt-5 rounded-2xl py-3 text-base"
            }
            onClick={handleCreate}
          >
            {isDesktop ? "创建计划" : "放进今日计划 ✨"}
          </Button>
        )}
      </div>
    </>
  );
}
