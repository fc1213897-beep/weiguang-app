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

type Props = { embedded?: boolean };

/** 桌面端：今日计划 — 列表为主，创建区次要 */
export default function TodayPlanView({ embedded = false }: Props) {
  const { selectedDate, datesWithTasks } = useTodoSelectors();
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="min-w-0">
      {!embedded && (
        <header className="border-b border-orange-50 pb-4">
          <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">
            {getPlanTitle(selectedDate)}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {formatSelectedDateDisplay(selectedDate)}
            {isToday ? " · 今天" : ""}
          </p>
        </header>
      )}

      <div
        className={[
          "grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]",
          embedded ? "" : "mt-5",
        ].join(" ")}
      >
        <div className="min-w-0 space-y-5">
          <TodoCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithTasks={datesWithTasks}
            defaultExpanded
          />
          <TaskList />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">
          <TaskStats variant="companion" />
          <details className="rounded-2xl border border-orange-100/70 bg-orange-50/30 open:shadow-sm">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-orange-700 marker:content-none [&::-webkit-details-marker]:hidden">
              ＋ 新建学习计划（展开填写）
            </summary>
            <div className="border-t border-orange-100/60 px-3 pb-3 pt-1">
              <PlanCreateForm variant="desktop" showSuggestionBlock={false} />
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
