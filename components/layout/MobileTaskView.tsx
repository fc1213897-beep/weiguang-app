"use client";

import MobileCompleteFeedback from "@/components/companion/MobileCompleteFeedback";
import PlanCreateModal from "@/components/todo/PlanCreateModal";
import PlanQuickEntry from "@/components/todo/PlanQuickEntry";
import TaskList from "@/components/todo/TaskList";
import TodoCalendar from "@/components/todo/TodoCalendar";
import CountdownDayBar from "@/components/todo/views/CountdownDayBar";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { getXiaoguangLine } from "@/lib/growth-utils";
import {
  addDaysToDateString,
  computeTaskStats,
  formatSelectedDateDisplay,
  getTodayDateString,
} from "@/lib/task-utils";
import { panelClass } from "@/lib/tokens";
import { useTodoStore } from "@/store/todoStore";
import { useUIStore } from "@/store/uiStore";
import { useMemo } from "react";

/** 手机端：今日任务 — 打开默认页，完成任务有正向互动 */
export default function MobileTaskView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const { selectedDate, datesWithTasks, tasksForSelectedDate } = useTodoSelectors();
  const allTasks = useTodoStore((s) => s.tasks);
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const isToday = selectedDate === getTodayDateString();

  const todayStats = useMemo(
    () => computeTaskStats(tasksForSelectedDate),
    [tasksForSelectedDate]
  );

  const greeting = useMemo(
    () => getXiaoguangLine(allTasks),
    [allTasks]
  );

  const progressPct =
    todayStats.total > 0
      ? Math.round((todayStats.completed / todayStats.total) * 100)
      : 0;

  if (mobileTab !== "tasks") return null;

  return (
    <>
      <div className={[panelClass, "min-w-0"].join(" ")}>
        <CountdownDayBar />

        <header className="border-b border-orange-100/60 pb-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedDate(addDaysToDateString(selectedDate, -1))}
              className="shrink-0 rounded-lg px-2 py-1.5 text-lg text-stone-500 active:bg-orange-50"
              aria-label="前一天"
            >
              ‹
            </button>
            <div className="min-w-0 flex-1 text-center">
              <h2 className="truncate text-base font-bold text-stone-800">今日任务</h2>
              <p className="text-[11px] text-stone-500">
                {formatSelectedDateDisplay(selectedDate)}
                {isToday ? " · 今天" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate(addDaysToDateString(selectedDate, 1))}
              className="shrink-0 rounded-lg px-2 py-1.5 text-lg text-stone-500 active:bg-orange-50"
              aria-label="后一天"
            >
              ›
            </button>
          </div>

          {isToday && (
            <p className="mt-2 rounded-xl bg-orange-50/60 px-3 py-2 text-xs leading-relaxed text-stone-600">
              <span className="mr-1" aria-hidden>
                🌙
              </span>
              {greeting}
            </p>
          )}

          {todayStats.total > 0 && (
            <div className="mt-2.5">
              <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                <span>
                  已完成 {todayStats.completed}/{todayStats.total}
                </span>
                <span className="font-medium text-orange-600">{progressPct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500 ease-out",
                    progressPct === 100
                      ? "bg-gradient-to-r from-emerald-400 to-amber-400"
                      : "bg-gradient-to-r from-orange-400 to-amber-300",
                  ].join(" ")}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {progressPct === 100 && (
                <p className="mt-1.5 text-center text-xs font-medium text-emerald-600">
                  今天的小目标都达成啦 ✨
                </p>
              )}
            </div>
          )}
        </header>

        <MobileCompleteFeedback />

        <div className="mt-2">
          <TaskList />
        </div>

        <div className="mt-3 border-t border-orange-50 pt-3">
          <PlanQuickEntry compact />
        </div>

        <div className="mt-3">
          <TodoCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithTasks={datesWithTasks}
            defaultExpanded={false}
          />
        </div>
      </div>

      <PlanCreateModal />
    </>
  );
}
