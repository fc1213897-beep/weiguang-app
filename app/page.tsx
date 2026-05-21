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
  "wg-panel-card min-w-0 max-w-full overflow-hidden rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6";

const innerCardClass =
  "wg-inner-card rounded-2xl bg-orange-50/80 sm:rounded-3xl";

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

  const progressStats = (
    <TaskStats
      tasks={tasksForSelectedDate}
      selectedDate={selectedDate}
      variant="companion"
    />
  );

  /** 桌面左栏 */
  const leftRailDesktop = (
    <div className="flex h-full min-w-0 flex-col">
      <header className="shrink-0 border-b border-orange-100/60 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-orange-500 lg:text-2xl">
          微光 ✨
        </h1>
      </header>

      <div
        className={`${innerCardClass} shrink-0 px-3 py-3 sm:px-4 sm:py-4`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="wg-character-breathe shrink-0 text-3xl lg:text-4xl"
            aria-hidden
          >
            🌙
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-700">小光</p>
            <TimeGreeting className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6" />
          </div>
        </div>
      </div>

      <div className="mt-4 min-w-0 shrink-0">{progressStats}</div>

      <p className="mt-auto hidden pt-4 text-center text-xs leading-5 text-stone-400 lg:block">
        陪你熬过备考的每一天
      </p>
    </div>
  );

  /** 手机陪伴 Tab：更紧凑的顶部信息 */
  const leftRailMobile = (
    <div className="w-full min-w-0 space-y-3">
      <header className="border-b border-orange-100/60 pb-2.5">
        <h1 className="text-lg font-bold text-orange-500">微光 ✨</h1>
      </header>

      <div className={`${innerCardClass} flex min-w-0 items-start gap-2.5 p-2.5`}>
        <span className="wg-character-breathe shrink-0 text-2xl" aria-hidden>
          🌙
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-700">小光</p>
          <TimeGreeting className="mt-0.5 line-clamp-3 text-xs leading-5 text-stone-500" />
        </div>
      </div>

      <div className="min-w-0">{progressStats}</div>
    </div>
  );

  const chatPanel = (
    <AIChat
      hideHeader
      className="mt-0 w-full min-w-0 max-w-full lg:min-h-[calc(100vh-11rem)] lg:flex lg:flex-col"
    />
  );

  return (
    <>
      <style>{`
        @keyframes wg-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
        .wg-character-breathe {
          display: inline-block;
          animation: wg-breathe 4s ease-in-out infinite;
          will-change: transform;
        }
        .wg-panel-card,
        .wg-inner-card {
          transition:
            transform 0.45s ease,
            box-shadow 0.45s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .wg-panel-card:hover {
            transform: translateY(-2px);
            box-shadow:
              0 12px 32px -12px rgba(251, 146, 60, 0.18),
              0 4px 16px -6px rgba(120, 113, 108, 0.08);
          }
          .wg-inner-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 24px -10px rgba(251, 146, 60, 0.2);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wg-character-breathe {
            animation: none;
          }
          .wg-panel-card,
          .wg-inner-card {
            transition: none;
          }
          .wg-panel-card:hover,
          .wg-inner-card:hover {
            transform: none;
          }
        }
      `}</style>

      <main className="min-h-screen overflow-x-hidden bg-[#FFF7ED] p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8">
      <div className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)_minmax(300px,400px)] lg:items-start lg:gap-5 xl:max-w-[88rem] xl:grid-cols-[240px_minmax(0,1fr)_400px] xl:gap-6">
        {/* 左栏：桌面 */}
        <aside
          className={[
            panelClass,
            "hidden flex-col lg:col-start-1 lg:row-start-1 lg:flex lg:sticky lg:top-8 lg:min-h-[calc(100vh-4rem)]",
          ].join(" ")}
        >
          {leftRailDesktop}
        </aside>

        {/* 中栏：今日任务 */}
        <section
          className={[
            panelClass,
            "lg:col-start-2 lg:row-start-1 lg:overflow-visible lg:p-7 lg:shadow-md",
            mobileTab === "tasks" ? "block" : "hidden",
            "lg:block",
          ].join(" ")}
        >
          <header className="border-b border-orange-50 pb-4 lg:pb-5">
            <h2 className="text-xl font-bold text-stone-800 sm:text-2xl lg:text-[1.75rem] xl:text-3xl">
              {getPlanTitle(selectedDate)}
            </h2>
          </header>

          <div className="mt-4 min-w-0 sm:mt-5">
            <TodoCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithTasks={datesWithTasks}
            />
          </div>

          <div className="mt-4 min-w-0 lg:hidden sm:mt-5">
            {progressStats}
          </div>

          <div className="mt-4 min-w-0 sm:mt-5">
            <TaskInput value={task} onChange={setTask} onAdd={addTask} />
          </div>

          <div className="mt-4 min-w-0 sm:mt-5">
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

        {/* 右栏：桌面聊天 */}
        <aside
          className={[
            panelClass,
            "hidden min-w-0 flex-col lg:col-start-3 lg:row-start-1 lg:flex lg:sticky lg:top-8 lg:min-h-[calc(100vh-4rem)] lg:p-5",
          ].join(" ")}
        >
          <header className="mb-3 shrink-0 border-b border-orange-100/60 pb-3">
            <h2 className="text-lg font-bold text-stone-800">小光陪伴</h2>
            <p className="mt-1 text-xs text-stone-500">说说今天的心情吧</p>
          </header>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{chatPanel}</div>
        </aside>

        {/* 手机「小光陪伴」Tab */}
        <aside
          className={[
            panelClass,
            "w-full flex-col gap-3 lg:hidden",
            mobileTab === "companion" ? "flex" : "hidden",
          ].join(" ")}
        >
          {leftRailMobile}

          <div className="min-w-0 border-t border-orange-100/60 pt-3">
            <p className="mb-2 text-sm font-semibold text-stone-700">
              和小光聊聊
            </p>
            <div className="min-w-0">{chatPanel}</div>
          </div>

          <p className="pb-1 text-center text-xs text-stone-400">
            陪你熬过备考的每一天
          </p>
        </aside>
      </div>

      <MobileTabNav active={mobileTab} onChange={setMobileTab} />
      <CharacterModal />
      </main>
    </>
  );
}
