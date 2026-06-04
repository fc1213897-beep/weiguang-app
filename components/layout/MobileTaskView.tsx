"use client";

import PlanCreateModal from "@/components/todo/PlanCreateModal";
import PlanQuickEntry from "@/components/todo/PlanQuickEntry";
import TaskList from "@/components/todo/TaskList";
import TodoCalendar from "@/components/todo/TodoCalendar";
import {
  addDaysToDateString,
  formatSelectedDateDisplay,
  getPlanTitle,
  getTodayDateString,
} from "@/lib/task-utils";
import { panelClass } from "@/lib/tokens";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { useTodoStore } from "@/store/todoStore";
import { useUIStore } from "@/store/uiStore";

/** 手机端：今日任务 — 优先执行，添加任务次要 */
export default function MobileTaskView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const { selectedDate, datesWithTasks } = useTodoSelectors();
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const isToday = selectedDate === getTodayDateString();

  if (mobileTab !== "tasks") return null;

  return (
    <>
      <div className={[panelClass, "min-w-0"].join(" ")}>
        {/* 日期切换：一行，不占主屏 */}
        <header className="flex items-center gap-1 border-b border-orange-100/60 pb-2">
          <button
            type="button"
            onClick={() => setSelectedDate(addDaysToDateString(selectedDate, -1))}
            className="shrink-0 rounded-lg px-2 py-1.5 text-lg text-stone-500 active:bg-orange-50"
            aria-label="前一天"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h2 className="truncate text-base font-bold text-stone-800">
              {getPlanTitle(selectedDate)}
            </h2>
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
        </header>

        {/* 任务列表优先：手机端主要是勾选执行 */}
        <div className="mt-2">
          <TaskList />
        </div>

        {/* 添加任务：收在下方，体积小 */}
        <div className="mt-3 border-t border-orange-50 pt-3">
          <PlanQuickEntry compact />
        </div>

        {/* 月历放最底，需要时再展开 */}
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
