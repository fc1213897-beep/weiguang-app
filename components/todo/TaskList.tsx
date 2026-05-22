"use client";

import TaskCard from "@/components/todo/TaskCard";
import { getTodayDateString } from "@/lib/task-utils";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { useTodoStore } from "@/store/todoStore";

export default function TaskList() {
  const { tasksForSelectedDate, selectedDate } = useTodoSelectors();
  const toggleTask = useTodoStore((s) => s.toggleTask);
  const editTask = useTodoStore((s) => s.editTask);
  const deleteTask = useTodoStore((s) => s.deleteTask);

  const isToday = selectedDate === getTodayDateString();

  if (tasksForSelectedDate.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200/80 bg-orange-50/30 p-6 text-center sm:p-10">
        <p className="text-3xl" aria-hidden>🗒️</p>
        <p className="mt-2 text-sm font-medium text-stone-700 sm:text-base">当前还没有任务</p>
        <p className="mt-1 text-xs text-stone-500 sm:text-sm">
          {isToday ? "先添加一个最小目标，开始就很棒。" : "这一天还没有安排，可以补充一个小计划。"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {tasksForSelectedDate.map((item) => (
        <TaskCard
          key={item.id}
          text={item.text}
          done={item.done}
          category={item.category}
          priority={item.priority}
          pomodoroMinutes={item.pomodoroMinutes}
          onToggle={() => toggleTask(item.id)}
          onSave={(text) => editTask(item.id, text)}
          onDelete={() => deleteTask(item.id)}
        />
      ))}
    </div>
  );
}
