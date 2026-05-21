"use client";

import { useEffect, useMemo, useState } from "react";
import AIChat from "@/components/AIChat";
import CharacterModal from "@/components/CharacterModal";
import MobileTabNav, { type MobileTabId } from "@/components/MobileTabNav";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import TodoCalendar from "@/components/TodoCalendar";
import TimeGreeting from "@/components/TimeGreeting";
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

  const today = getTodayDateString();

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

  const todayTaskCount = useMemo(
    () => filterTasksByDate(tasks, today).length,
    [tasks, today]
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
            "rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6",
            mobileTab === "companion" ? "block" : "hidden",
            "lg:block",
          ].join(" ")}
        >
          <h1 className="text-2xl font-bold text-orange-500 sm:text-3xl">
            微光 ✨
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:mt-3">
            陪你熬过备考的每一天
          </p>

          <div className="mt-5 rounded-2xl bg-orange-100 p-4 text-center sm:mt-8 sm:rounded-3xl sm:p-6">
            <div className="text-5xl sm:text-7xl">🌙</div>

            <p className="mt-3 text-lg font-semibold sm:mt-4 sm:text-xl">
              小光
            </p>

            <TimeGreeting className="mt-2 text-sm leading-6 text-gray-600 sm:mt-3 sm:leading-7" />
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-3 sm:mt-6 sm:p-4">
            <p className="text-sm text-gray-500">今日任务数</p>

            <p className="mt-1 text-2xl font-bold text-orange-500 sm:mt-2 sm:text-3xl">
              {todayTaskCount}
            </p>
          </div>

          <AIChat />
        </aside>

        {/* 右侧区域：桌面端常显；手机端仅在「今日任务」Tab */}
        <section
          className={[
            "rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8",
            mobileTab === "tasks" ? "block" : "hidden",
            "lg:block",
          ].join(" ")}
        >
          <h2 className="text-2xl font-bold sm:text-3xl">
            {getPlanTitle(selectedDate)}
          </h2>

          <p className="mt-2 text-sm text-gray-500 sm:mt-3 sm:text-base">
            完成一个小目标，也是在前进。
          </p>

          <div className="mt-5 sm:mt-6">
            <TodoCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithTasks={datesWithTasks}
            />
          </div>

          <div className="mt-5 sm:mt-8">
            <TaskInput value={task} onChange={setTask} onAdd={addTask} />
          </div>

          <div className="mt-5 sm:mt-8">
            <TaskList
              tasks={tasksForSelectedDate}
              selectedDate={selectedDate}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600 sm:mt-8 sm:p-5 sm:text-base sm:leading-normal">
            小光：
            今天不求完美，
            先完成一个任务就很好。
          </div>
        </section>
      </div>

      <MobileTabNav active={mobileTab} onChange={setMobileTab} />
      <CharacterModal />
    </main>
  );
}
