"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { normalizeTaskItems } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

/** 游客模式：挂载时恢复 Todo，变更时写入 localStorage */
export function useTodoHydration() {
  const { isAuthenticated, isLoading } = useAuth();
  const tasks = useTodoStore((s) => s.tasks);
  const storageReady = useTodoStore((s) => s.storageReady);
  const syncEnabled = useTodoStore((s) => s.syncEnabled);
  const setTasks = useTodoStore((s) => s.setTasks);
  const setStorageReady = useTodoStore((s) => s.setStorageReady);

  const useLocal = !isLoading && !isAuthenticated;

  useEffect(() => {
    if (!useLocal) return;

    const frameId = requestAnimationFrame(() => {
      const raw = loadFromStorage<unknown>(STORAGE_KEYS.tasks, []);
      setTasks(normalizeTaskItems(raw));
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [useLocal, setTasks, setStorageReady]);

  useEffect(() => {
    if (!useLocal || !storageReady || syncEnabled) return;
    saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks, storageReady, useLocal, syncEnabled]);
}
