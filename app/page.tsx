"use client";

import { useState } from "react";

export default function Home() {
 const [task, setTask] = useState("");

const [tasks, setTasks] = useState<
  { text: string; done: boolean }[]
>([]);

  function addTask() {
    const value = task.trim();
console.log(tasks);
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

  return (
    <main className="min-h-screen bg-[#FFF7ED] p-8">
      <div className="mx-auto grid max-w-6xl grid-cols-[280px_1fr] gap-6">
        
        {/* 左侧区域 */}
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-orange-500">
            微光 ✨
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            陪你熬过备考的每一天
          </p>

          <div className="mt-8 rounded-3xl bg-orange-100 p-6 text-center">
            <div className="text-7xl">🌙</div>

            <p className="mt-4 text-xl font-semibold">
              小光
            </p>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              今天也慢慢来，
              不用一下子做到完美。
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              今日任务数
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {tasks.length}
            </p>
          </div>
        </aside>

        {/* 右侧区域 */}
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold">
            今日学习计划
          </h2>

          <p className="mt-3 text-gray-500">
            完成一个小目标，也是在前进。
          </p>

          {/* 输入区域 */}
          <div className="mt-8 flex gap-4">
            <input
              className="flex-1 rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:border-orange-400"
              placeholder="例如：背50个英语单词"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />

            <button
              className="rounded-2xl bg-orange-500 px-6 py-4 text-white transition hover:bg-orange-600"
              onClick={addTask}
            >
              添加任务
            </button>
          </div>

          {/* 任务列表 */}
          <div className="mt-8 space-y-4">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
                还没有任务，
                先添加一个吧 ✨
              </div>
            ) : (
              tasks.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-orange-50 p-5"
                >
                  <span
  className={`text-lg ${
    item.done ? "line-through text-gray-400" : ""
  }`}
>
  🌙 {item.text}
</span>

                  <button
  className={`rounded-full px-3 py-1 text-sm text-white ${
    item.done ? "bg-green-500" : "bg-orange-400"
  }`}
  onClick={() => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  }}
>
  {item.done ? "已完成" : "待完成"}
</button>
                </div>
              ))
            )}
          </div>

          {/* 底部陪伴语 */}
          <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-gray-600">
            小光：
            今天不求完美，
            先完成一个任务就很好。
          </div>
        </section>
      </div>
    </main>
  );
}