"use client";

import { useEffect, useMemo, useState } from "react";
import CharacterModal from "@/components/CharacterModal";
import CompanionSidebar from "@/components/CompanionSidebar";
import MobileTabNav, { type MobileTabId } from "@/components/MobileTabNav";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import TaskStats from "@/components/TaskStats";
import TodoCalendar from "@/components/TodoCalendar";
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  type TaskItem,
} from "@/lib/storage";
import {
  filterTasksByDate,
  generateTaskId,
  getPlanTitle,
  getTodayDateString,
  normalizeTaskItems,
} from "@/lib/task-utils";

export default function Home() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const [storageReady, setStorageReady] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTabId>("tasks");

  const datesWithTasks = useMemo(() => {
    const set = new Set<string>();
    for (const item of tasks) {
      set.add(item.date);
    }
    return set;
  }, [tasks]);

  const tasksForSelectedDate = useMemo(
    () => filterTasksByDate(tasks, selectedDate),
    [tasks, selectedDate]
  );

  // 首次进入：客户端挂载后从 localStorage 恢复任务（兼容旧数据）
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const raw = loadFromStorage<unknown>(STORAGE_KEYS.tasks, []);
      setTasks(normalizeTaskItems(raw));
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 任务变化后写入 localStorage
  useEffect(() => {
    if (!storageReady) return;
    saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks, storageReady]);

  function addTask() {
    const value = task.trim();
    if (!value) return;

    setTasks((prev) => [
      ...prev,
      {
        id: generateTaskId(),
        text: value,
        done: false,
        date: selectedDate,
      },
    ]);
    setTask("");
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  function editTask(id: string, text: string) {
    const value = text.trim();
    if (!value) return;

    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#FFF7ED] p-4 pb-20 sm:p-6 sm:pb-20 lg:p-8 lg:pb-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        {/* 左侧区域：桌面端常显；手机端仅在「小光陪伴」Tab */}
        <aside
          className={[
            "flex flex-col rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:min-h-[32rem]",
            mobileTab === "companion" ? "flex" : "hidden",
            "lg:flex",
          ].join(" ")}
        >
          <CompanionSidebar
            tasks={tasksForSelectedDate}
            selectedDate={selectedDate}
            className="min-h-0 flex-1"
          />
        </aside>

        {/* 右侧区域：桌面端常显；手机端仅在「今日任务」Tab */}
        <section
          className={[
            "rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8",
            mobileTab === "tasks" ? "block" : "hidden",
            "lg:block",
          ].join(" ")}
        >
          <header className="border-b border-orange-50 pb-4">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {getPlanTitle(selectedDate)}
            </h2>
          </header>

          <div className="mt-4 sm:mt-5">
            <TodoCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithTasks={datesWithTasks}
            />
          </div>

          <div className="mt-4 sm:mt-5">
            <TaskStats
              tasks={tasksForSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          <div className="mt-4 sm:mt-5">
            <TaskInput value={task} onChange={setTask} onAdd={addTask} />
          </div>

          <div className="mt-4 sm:mt-5">
            <TaskList
              tasks={tasksForSelectedDate}
              selectedDate={selectedDate}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          </div>

          <p className="mt-4 text-center text-xs text-stone-400 sm:mt-6">
            完成一个小目标，也是在前进。
          </p>
        </section>
      </div>

      <MobileTabNav active={mobileTab} onChange={setMobileTab} />
      <CharacterModal />
    </main>
  );
}
