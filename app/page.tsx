"use client";

import { useEffect, useMemo, useState } from "react";
import AIChat from "@/components/AIChat";
import CharacterModal from "@/components/CharacterModal";
import MobileTabNav, { type MobileTabId } from "@/components/MobileTabNav";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import TaskStats from "@/components/TaskStats";
import TimeGreeting from "@/components/TimeGreeting";
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

const panelClass =
  "rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6";

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

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const raw = loadFromStorage<unknown>(STORAGE_KEYS.tasks, []);
      setTasks(normalizeTaskItems(raw));
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

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

  /** 左栏：品牌、小光、今日进度（桌面端固定展示） */
  const leftRail = (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-orange-100/60 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-orange-500 lg:text-2xl">
          微光 ✨
        </h1>
      </header>

      <div className="mt-4 shrink-0 rounded-2xl bg-orange-50/80 px-3 py-3 sm:rounded-3xl sm:px-4 sm:py-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl lg:text-4xl" aria-hidden>
            🌙
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-700">小光</p>
            <TimeGreeting className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6" />
          </div>
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <TaskStats
          tasks={tasksForSelectedDate}
          selectedDate={selectedDate}
          variant="companion"
        />
      </div>

      <p className="mt-auto hidden pt-4 text-center text-xs leading-5 text-stone-400 lg:block">
        陪你熬过备考的每一天
      </p>
    </div>
  );

  /** 右栏 / 手机陪伴 Tab：聊天区 */
  const chatPanel = (
    <AIChat className="mt-0 flex h-full min-h-0 flex-col lg:min-h-[calc(100vh-11rem)]" />
  );

  return (
    <main className="min-h-screen bg-[#FFF7ED] p-4 pb-20 sm:p-6 sm:pb-20 lg:p-8 lg:pb-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)_minmax(300px,400px)] lg:items-start lg:gap-5 xl:max-w-[88rem] xl:grid-cols-[240px_minmax(0,1fr)_400px] xl:gap-6">
        {/* 左栏：桌面常显 */}
        <aside
          className={[
            panelClass,
            "hidden flex-col lg:col-start-1 lg:row-start-1 lg:flex lg:sticky lg:top-8 lg:min-h-[calc(100vh-4rem)]",
          ].join(" ")}
        >
          {leftRail}
        </aside>

        {/* 中栏：任务主视觉；手机「今日任务」Tab */}
        <section
          className={[
            panelClass,
            "lg:col-start-2 lg:row-start-1 lg:p-7 lg:shadow-md",
            mobileTab === "tasks" ? "block" : "hidden",
            "lg:block",
          ].join(" ")}
        >
          <header className="border-b border-orange-50 pb-4 lg:pb-5">
            <h2 className="text-2xl font-bold text-stone-800 sm:text-3xl lg:text-[1.75rem] xl:text-3xl">
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

          {/* 手机端任务 Tab 内展示统计；桌面端已在左栏展示，避免重复 */}
          <div className="mt-4 lg:hidden sm:mt-5">
            <TaskStats
              tasks={tasksForSelectedDate}
              selectedDate={selectedDate}
              variant="companion"
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

          <p className="mt-4 text-center text-xs text-stone-400 sm:mt-6 lg:mt-8">
            完成一个小目标，也是在前进。
          </p>
        </section>

        {/* 右栏：桌面聊天区 */}
        <aside
          className={[
            panelClass,
            "hidden flex-col lg:col-start-3 lg:row-start-1 lg:flex lg:sticky lg:top-8 lg:min-h-[calc(100vh-4rem)] lg:p-5",
          ].join(" ")}
        >
          <header className="mb-3 shrink-0 border-b border-orange-100/60 pb-3">
            <h2 className="text-lg font-bold text-stone-800">小光陪伴</h2>
            <p className="mt-1 text-xs text-stone-500">说说今天的心情吧</p>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{chatPanel}</div>
        </aside>

        {/* 手机「小光陪伴」Tab：左栏信息 + 聊天上下排列 */}
        <aside
          className={[
            panelClass,
            "flex flex-col gap-4 lg:hidden",
            mobileTab === "companion" ? "flex" : "hidden",
          ].join(" ")}
        >
          {leftRail}
          <div className="border-t border-orange-100/60 pt-4">
            <p className="mb-3 text-sm font-semibold text-stone-700">
              和小光聊聊
            </p>
            {chatPanel}
          </div>
        </aside>
      </div>

      <MobileTabNav active={mobileTab} onChange={setMobileTab} />
      <CharacterModal />
    </main>
  );
}
