"use client";

import TaskInput from "@/components/todo/TaskInput";
import TaskList from "@/components/todo/TaskList";
import TaskStats from "@/components/todo/TaskStats";
import TodoCalendar from "@/components/todo/TodoCalendar";
import { Section } from "@/components/ui/section";
import { wgTokens } from "@/lib/tokens";
import { getPlanTitle } from "@/lib/task-utils";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { useTodoStore } from "@/store/todoStore";

/** 任务主栏：日历 + 列表 + 输入 */
export default function TaskPanel() {
  const { selectedDate, datesWithTasks } = useTodoSelectors();
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);

  return (
    <Section title={getPlanTitle(selectedDate)}>
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
        <TaskInput />
      </div>

      <div className={wgTokens.spacing.section}>
        <TaskList />
      </div>

      <p className="mt-4 text-center text-xs text-stone-400 sm:mt-6 lg:mt-8">
        完成一个小目标，也是在前进。
      </p>
    </Section>
  );
}
