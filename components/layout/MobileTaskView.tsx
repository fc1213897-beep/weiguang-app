"use client";

import MobileCompleteFeedback from "@/components/companion/MobileCompleteFeedback";
import MobileExamHero from "@/components/mobile/MobileExamHero";
import MobileQuickAddBar from "@/components/mobile/MobileQuickAddBar";
import MobileTaskList from "@/components/mobile/MobileTaskList";
import PlanCreateModal from "@/components/todo/PlanCreateModal";
import TodoCalendar from "@/components/todo/TodoCalendar";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { getXiaoguangLine } from "@/lib/growth-utils";
import { MOBILE_TASK_PB } from "@/lib/layout";
import {
  addDaysToDateString,
  computeTaskStats,
  formatSelectedDateDisplay,
  getTodayDateString,
} from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";
import { useUIStore } from "@/store/uiStore";
import { useMemo, useState } from "react";

/** 手机端今日任务：考研用户优先 — 倒计时、备考分组、大按钮勾选 */
export default function MobileTaskView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const { selectedDate, datesWithTasks, tasksForSelectedDate } = useTodoSelectors();
  const allTasks = useTodoStore((s) => s.tasks);
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const isToday = selectedDate === getTodayDateString();

  const todayStats = useMemo(
    () => computeTaskStats(tasksForSelectedDate),
    [tasksForSelectedDate]
  );

  const greeting = useMemo(() => getXiaoguangLine(allTasks), [allTasks]);

  const progressPct =
    todayStats.total > 0
      ? Math.round((todayStats.completed / todayStats.total) * 100)
      : 0;

  if (mobileTab !== "tasks") return null;

  return (
    <>
      <div className={["min-w-0 space-y-3", MOBILE_TASK_PB].join(" ")}>
        <MobileExamHero />

        {/* 日期切换 + 今日进度 */}
        <div className="rounded-2xl border border-orange-100/60 bg-white px-3 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedDate(addDaysToDateString(selectedDate, -1))}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg text-stone-500 active:bg-orange-50"
              aria-label="前一天"
            >
              ‹
            </button>
            <div className="min-w-0 flex-1 text-center">
              <h2 className="text-base font-bold text-stone-800">今日任务</h2>
              <p className="text-[11px] text-stone-500">
                {formatSelectedDateDisplay(selectedDate)}
                {isToday ? " · 今天" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate(addDaysToDateString(selectedDate, 1))}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg text-stone-500 active:bg-orange-50"
              aria-label="后一天"
            >
              ›
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayDateString())}
                className="shrink-0 rounded-lg bg-orange-100 px-2 py-1 text-[11px] font-medium text-orange-700"
              >
                回今天
              </button>
            )}
          </div>

          {isToday && (
            <p className="mt-2.5 rounded-xl bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-stone-600">
              <span className="mr-1" aria-hidden>
                🌙
              </span>
              {greeting}
            </p>
          )}

          {todayStats.total > 0 && (
            <div className="mt-2.5">
              <div className="mb-1 flex justify-between text-[11px] text-stone-500">
                <span>
                  今日进度 {todayStats.completed}/{todayStats.total}
                </span>
                <span className="font-semibold text-orange-600">{progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500",
                    progressPct === 100
                      ? "bg-gradient-to-r from-emerald-400 to-amber-400"
                      : "bg-gradient-to-r from-orange-400 to-amber-300",
                  ].join(" ")}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {progressPct === 100 && (
                <p className="mt-1.5 text-center text-xs font-medium text-emerald-600">
                  今天全部完成，可以安心休息啦 ✨
                </p>
              )}
            </div>
          )}
        </div>

        <MobileCompleteFeedback />

        <MobileTaskList />

        <button
          type="button"
          onClick={() => setCalendarOpen((v) => !v)}
          className="w-full rounded-xl border border-stone-200/70 py-2.5 text-xs text-stone-500 active:bg-stone-50"
        >
          {calendarOpen ? "收起日历 ▲" : "查看月历 ▼"}
        </button>
        {calendarOpen && (
          <TodoCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithTasks={datesWithTasks}
            defaultExpanded
          />
        )}
      </div>

      <MobileQuickAddBar />
      <PlanCreateModal />
    </>
  );
}
