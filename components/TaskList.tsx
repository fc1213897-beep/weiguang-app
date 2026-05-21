"use client";

import TaskCard from "@/components/TaskCard";
import type { TaskItem } from "@/lib/storage";
import { getTodayDateString } from "@/lib/task-utils";

type Props = {
  tasks: TaskItem[];
  selectedDate: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
};

export default function TaskList({
  tasks,
  selectedDate,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const isToday = selectedDate === getTodayDateString();

  if (tasks.length === 0) {
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
      {tasks.map((item) => (
        <TaskCard
          key={item.id}
          text={item.text}
          done={item.done}
          onToggle={() => onToggle(item.id)}
          onSave={(text) => onEdit(item.id, text)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
}
