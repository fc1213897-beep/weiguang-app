"use client";

import PlanCreateModal from "@/components/todo/PlanCreateModal";
import PlanQuickEntry from "@/components/todo/PlanQuickEntry";
import TaskList from "@/components/todo/TaskList";
import TodoCalendar from "@/components/todo/TodoCalendar";
import {
  formatSelectedDateDisplay,
  getPlanTitle,
  getTodayDateString,
} from "@/lib/task-utils";
import { panelClass } from "@/lib/tokens";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { useTodoStore } from "@/store/todoStore";
import { useUIStore } from "@/store/uiStore";

/** 手机端：今日任务（首页主内容，尽量短） */
export default function MobileTaskView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const { selectedDate, datesWithTasks } = useTodoSelectors();
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const isToday = selectedDate === getTodayDateString();

  if (mobileTab !== "tasks") return null;

  return (
    <>
      <div className={[panelClass, "min-w-0"].join(" ")}>
        <header className="flex items-end justify-between gap-2 border-b border-orange-100/60 pb-2.5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-stone-800">
              {getPlanTitle(selectedDate)}
            </h2>
            <p className="text-xs text-stone-500">
              {formatSelectedDateDisplay(selectedDate)}
              {isToday ? " · 今天" : ""}
            </p>
          </div>
        </header>

        <div className="mt-3 space-y-3">
          <TodoCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithTasks={datesWithTasks}
            defaultExpanded={false}
          />
          <PlanQuickEntry />
          <TaskList />
        </div>
      </div>

      <PlanCreateModal />
    </>
  );
}
