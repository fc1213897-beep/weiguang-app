"use client";

import { useEffect } from "react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { normalizeTaskItems } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";

/** 挂载时恢复 Todo，变更时写入 localStorage */
export function useTodoHydration() {
  const tasks = useTodoStore((s) => s.tasks);
  const storageReady = useTodoStore((s) => s.storageReady);
  const setTasks = useTodoStore((s) => s.setTasks);
  const setStorageReady = useTodoStore((s) => s.setStorageReady);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const raw = loadFromStorage<unknown>(STORAGE_KEYS.tasks, []);
      setTasks(normalizeTaskItems(raw));
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [setTasks, setStorageReady]);

  useEffect(() => {
    if (!storageReady) return;
    saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks, storageReady]);
}
