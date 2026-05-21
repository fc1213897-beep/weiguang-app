"use client";

import { useMemo } from "react";
import { filterTasksByDate } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

export function useTodoSelectors() {
  const tasks = useTodoStore((s) => s.tasks);
  const selectedDate = useTodoStore((s) => s.selectedDate);

  const tasksForSelectedDate = useMemo(
    () => filterTasksByDate(tasks, selectedDate),
    [tasks, selectedDate]
  );

  const datesWithTasks = useMemo(() => {
    const set = new Set<string>();
    for (const item of tasks) set.add(item.date);
    return set;
  }, [tasks]);

  return { tasksForSelectedDate, datesWithTasks, selectedDate };
}
