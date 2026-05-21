"use client";

import PlanCreateModal from "@/components/todo/PlanCreateModal";
import PlanQuickEntry from "@/components/todo/PlanQuickEntry";
import TaskList from "@/components/todo/TaskList";
import TaskStats from "@/components/todo/TaskStats";
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

/** 手机端：轻量今日任务 */
export default function MobileTaskView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const { selectedDate, datesWithTasks } = useTodoSelectors();
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const isToday = selectedDate === getTodayDateString();

  if (mobileTab !== "tasks") return null;

  return (
    <>
      <div className={[panelClass, "min-w-0"].join(" ")}>
        <header className="border-b border-orange-50 pb-3">
          <h2 className="text-lg font-bold text-stone-800">
            {getPlanTitle(selectedDate)}
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">
            {formatSelectedDateDisplay(selectedDate)}
            {isToday ? " · 今天" : ""}
          </p>
        </header>

        <div className="mt-4 space-y-4">
          <TodoCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithTasks={datesWithTasks}
            defaultExpanded={false}
          />
          <TaskStats variant="companion" />
          <PlanQuickEntry />
          <TaskList />
        </div>
      </div>

      <PlanCreateModal />
    </>
  );
}
