"use client";

import PlanCreateModal from "@/components/todo/PlanCreateModal";
import PlanQuickEntry from "@/components/todo/PlanQuickEntry";
import TaskList from "@/components/todo/TaskList";
import TaskStats from "@/components/todo/TaskStats";
import TodoCalendar from "@/components/todo/TodoCalendar";
import { Section } from "@/components/ui/section";
import { wgTokens } from "@/lib/tokens";
import {
  formatSelectedDateDisplay,
  getPlanTitle,
  getTodayDateString,
} from "@/lib/task-utils";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { useTodoStore } from "@/store/todoStore";

/** 任务主栏：日期 · 概览 · 快捷入口 · 列表 */
export default function TaskPanel() {
  const { selectedDate, datesWithTasks } = useTodoSelectors();
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);
  const isToday = selectedDate === getTodayDateString();

  return (
    <>
      <Section title={getPlanTitle(selectedDate)}>
        <p className="mt-1 text-sm text-stone-500">
          {formatSelectedDateDisplay(selectedDate)}
          {isToday ? " · 今天" : ""}
        </p>

        <div className={wgTokens.spacing.section}>
          <TodoCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithTasks={datesWithTasks}
          />
        </div>

        <div className={`${wgTokens.spacing.section} lg:hidden`}>
          <TaskStats variant="companion" />
        </div>

        <div className={wgTokens.spacing.section}>
          <PlanQuickEntry />
        </div>

        <div className={wgTokens.spacing.section}>
          <TaskList />
        </div>

        <p className="mt-4 text-center text-xs text-stone-400 sm:mt-6">
          完成一个小目标，也是在前进。
        </p>
      </Section>

      <PlanCreateModal />
    </>
  );
}
