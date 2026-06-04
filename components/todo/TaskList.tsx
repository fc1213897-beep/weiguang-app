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
      <div className="rounded-xl border border-dashed border-orange-200/70 bg-orange-50/20 px-4 py-5 text-center lg:rounded-2xl lg:p-10">
        <p className="text-2xl lg:text-3xl" aria-hidden>
          🗒️
        </p>
        <p className="mt-1.5 text-sm font-medium text-stone-700">还没有任务</p>
        <p className="mt-0.5 text-xs text-stone-500">
          {isToday ? "下方点「添加」即可" : "这一天还没有安排"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 lg:space-y-4">
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
