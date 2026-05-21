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
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400 sm:p-10 sm:text-base">
        {isToday
          ? "今天还没有任务，先添加一两个吧 ✨"
          : "这一天还没有任务，可以添加新计划 ✨"}
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
