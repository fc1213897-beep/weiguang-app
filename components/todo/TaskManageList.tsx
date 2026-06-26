"use client";

import { useMemo } from "react";
import TaskCard from "@/components/todo/TaskCard";
import { useAuth } from "@/hooks/useAuth";
import { formatSelectedDateDisplay } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

/** 桌面端：按日期分组的全局任务管理列表 */
export default function TaskManageList() {
  const tasks = useTodoStore((s) => s.tasks);
  const { isAuthenticated } = useAuth();
  const toggleTask = useTodoStore((s) => s.toggleTask);
  const editTask = useTodoStore((s) => s.editTask);
  const setTaskRemind = useTodoStore((s) => s.setTaskRemind);
  const deleteTask = useTodoStore((s) => s.deleteTask);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    const sorted = [...tasks].sort((a, b) => b.date.localeCompare(a.date));
    for (const item of sorted) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return Array.from(map.entries());
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-400">
        还没有任何计划，在上方创建第一条吧 ✨
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, items]) => (
        <section key={date}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-600">
            <span className="h-px flex-1 bg-orange-100" />
            <span>{formatSelectedDateDisplay(date)}</span>
            <span className="text-xs font-normal text-stone-400">
              {items.length} 项
            </span>
            <span className="h-px flex-1 bg-orange-100" />
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <TaskCard
                key={item.id}
                text={item.text}
                done={item.done}
                category={item.category}
                priority={item.priority}
                pomodoroMinutes={item.pomodoroMinutes}
                note={item.note}
                remindAt={item.remindAt}
                onToggle={() => toggleTask(item.id)}
                onSave={(text) => editTask(item.id, text)}
                onRemindChange={
                  isAuthenticated ? (at) => setTaskRemind(item.id, at) : undefined
                }
                onDelete={() => deleteTask(item.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
