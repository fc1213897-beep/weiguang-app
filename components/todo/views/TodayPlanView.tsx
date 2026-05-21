"use client";

import PlanCreateForm from "@/components/todo/PlanCreateForm";
import TaskList from "@/components/todo/TaskList";
import TaskStats from "@/components/todo/TaskStats";
import TodoCalendar from "@/components/todo/TodoCalendar";
import {
  formatSelectedDateDisplay,
  getPlanTitle,
  getTodayDateString,
} from "@/lib/task-utils";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { useTodoStore } from "@/store/todoStore";

/** 桌面端：今日计划工作台 */
export default function TodayPlanView() {
  const { selectedDate, datesWithTasks } = useTodoSelectors();
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="min-w-0">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">
          {getPlanTitle(selectedDate)}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {formatSelectedDateDisplay(selectedDate)}
          {isToday ? " · 今天" : ""}
        </p>
      </header>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-5">
          <TodoCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithTasks={datesWithTasks}
          />
          <TaskList />
        </div>
        <div className="min-w-0 space-y-5">
          <TaskStats variant="companion" />
          <PlanCreateForm variant="desktop" showSuggestionBlock />
        </div>
      </div>
    </div>
  );
}
