"use client";

import MobileTaskCard from "@/components/mobile/MobileTaskCard";
import Link from "next/link";
import { useMemo } from "react";
import { isCountdownAutoTask } from "@/lib/countdown/note-utils";
import { computeTaskStats, getTodayDateString } from "@/lib/task-utils";
import { useTodoSelectors } from "@/hooks/useTodoSelectors";
import { useTodoStore } from "@/store/todoStore";

function TaskGroup({
  title,
  icon,
  tasks,
  onToggle,
  onSave,
  onDelete,
}: {
  title: string;
  icon: string;
  tasks: ReturnType<typeof useTodoSelectors>["tasksForSelectedDate"];
  onToggle: (id: string) => void;
  onSave: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) return null;

  const stats = computeTaskStats(tasks);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-xs font-semibold text-stone-500">
          <span className="mr-1" aria-hidden>
            {icon}
          </span>
          {title}
        </h3>
        <span className="text-[11px] text-stone-400">
          {stats.completed}/{stats.total}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((item) => (
          <MobileTaskCard
            key={item.id}
            text={item.text}
            done={item.done}
            note={item.note}
            onToggle={() => onToggle(item.id)}
            onSave={(text) => onSave(item.id, text)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

/** 手机任务列表：备考任务置顶，其余次之 */
export default function MobileTaskList() {
  const { tasksForSelectedDate, selectedDate } = useTodoSelectors();
  const toggleTask = useTodoStore((s) => s.toggleTask);
  const editTask = useTodoStore((s) => s.editTask);
  const deleteTask = useTodoStore((s) => s.deleteTask);
  const isToday = selectedDate === getTodayDateString();

  const { examTasks, otherTasks } = useMemo(() => {
    const exam: typeof tasksForSelectedDate = [];
    const other: typeof tasksForSelectedDate = [];
    for (const t of tasksForSelectedDate) {
      if (isCountdownAutoTask(t.note ?? "")) exam.push(t);
      else other.push(t);
    }
    return { examTasks: exam, otherTasks: other };
  }, [tasksForSelectedDate]);

  if (tasksForSelectedDate.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200/80 bg-orange-50/20 px-4 py-8 text-center">
        <p className="text-3xl" aria-hidden>
          📖
        </p>
        <p className="mt-2 text-sm font-medium text-stone-700">
          {isToday ? "今天还没有学习任务" : "这一天还没有安排"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          {isToday
            ? "点下方「添加任务」，或先配置备考计划让小光每天帮你生成"
            : "可以切换日期，或从下方快速添加"}
        </p>
        {isToday && (
          <Link
            href="/me?section=exam"
            className="mt-3 inline-block rounded-full bg-indigo-500 px-4 py-2 text-xs font-medium text-white active:bg-indigo-600"
          >
            配置考研倒计时
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TaskGroup
        title="今日备考"
        icon="📅"
        tasks={examTasks}
        onToggle={toggleTask}
        onSave={editTask}
        onDelete={deleteTask}
      />
      <TaskGroup
        title="其他任务"
        icon="📝"
        tasks={otherTasks}
        onToggle={toggleTask}
        onSave={editTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
