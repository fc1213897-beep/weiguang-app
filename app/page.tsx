"use client";

import { useState } from "react";
import TaskCard from "@/components/TaskCard";

export default function Home() {
  const [task, setTask] = useState("");

  const [tasks, setTasks] = useState<
    { text: string; done: boolean }[]
  >([]);

  function addTask() {
    const value = task.trim();
    if (!value) return;

    setTasks([
      ...tasks,
      {
        text: value,
        done: false,
      },
    ]);
    setTask("");
  }

  function toggleTask(index: number) {
    setTasks((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7ED] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        {/* 左侧区域 */}
        <aside className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
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

            <p className="mt-2 text-sm leading-6 text-gray-600 sm:mt-3 sm:leading-7">
              今天也慢慢来，
              不用一下子做到完美。
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-3 sm:mt-6 sm:p-4">
            <p className="text-sm text-gray-500">今日任务数</p>

            <p className="mt-1 text-2xl font-bold text-orange-500 sm:mt-2 sm:text-3xl">
              {tasks.length}
            </p>
          </div>
        </aside>

        {/* 右侧区域 */}
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
          <h2 className="text-2xl font-bold sm:text-3xl">今日学习计划</h2>

          <p className="mt-2 text-sm text-gray-500 sm:mt-3 sm:text-base">
            完成一个小目标，也是在前进。
          </p>

          {/* 输入区域 */}
          <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <input
              className="w-full flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-orange-400 sm:px-5 sm:py-4"
              placeholder="例如：背50个英语单词"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />

            <button
              className="w-full shrink-0 rounded-2xl bg-orange-500 px-6 py-3 text-white transition hover:bg-orange-600 sm:w-auto sm:py-4"
              onClick={addTask}
            >
              添加任务
            </button>
          </div>

          {/* 任务列表 */}
          <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400 sm:p-10 sm:text-base">
                还没有任务，
                先添加一两个吧 ✨
              </div>
            ) : (
              tasks.map((item, index) => (
                <TaskCard
                  key={`${item.text}-${index}`}
                  text={item.text}
                  done={item.done}
                  onToggle={() => toggleTask(index)}
                />
              ))
            )}
          </div>
          {/* 底部陪伴语 */}
          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600 sm:mt-8 sm:p-5 sm:text-base sm:leading-normal">
            小光：
            今天不求完美，
            先完成一个任务就很好。
          </div>
        </section>
      </div>
    </main>
  );
}
