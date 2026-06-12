"use client";

import { useEffect } from "react";
import { listTasks } from "@/lib/supabase/tasks";
import { taskRowToTaskItem } from "@/lib/task-cloud-map";
import { useAuth } from "@/hooks/useAuth";
import { useTodoStore } from "@/store/todoStore";

/**
 * 已登录：从 Supabase 拉取任务并开启 store 云同步
 * 未登录：由 useTodoHydration 负责 localStorage
 */
export function useTodoSync() {
  const { isAuthenticated, isLoading } = useAuth();
  const selectedDate = useTodoStore((s) => s.selectedDate);
  const setSyncEnabled = useTodoStore((s) => s.setSyncEnabled);
  const mergeTasksForDate = useTodoStore((s) => s.mergeTasksForDate);
  const setStorageReady = useTodoStore((s) => s.setStorageReady);

  useEffect(() => {
    if (isLoading) return;
    if (useTodoStore.getState().syncEnabled !== isAuthenticated) {
      setSyncEnabled(isAuthenticated);
    }
    // 游客 storageReady 由 useTodoHydration 设置，此处勿 reset
  }, [isAuthenticated, isLoading, setSyncEnabled]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let cancelled = false;

    void (async () => {
      const { data, error } = await listTasks({ task_date: selectedDate });
      if (cancelled) return;

      if (error) {
        console.error("[todo sync] listTasks", error);
        setStorageReady(true);
        return;
      }

      mergeTasksForDate(
        selectedDate,
        (data ?? []).map(taskRowToTaskItem)
      );
      setStorageReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    isLoading,
    selectedDate,
    mergeTasksForDate,
    setStorageReady,
  ]);
}
