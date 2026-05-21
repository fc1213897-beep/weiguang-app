"use client";

import AIChat from "@/components/AIChat";
import TaskStats from "@/components/TaskStats";
import TimeGreeting from "@/components/TimeGreeting";
import type { TaskItem } from "@/lib/storage";

type Props = {
  tasks: TaskItem[];
  selectedDate: string;
  className?: string;
};

/** 左侧陪伴区：统计与对话优先，品牌与小光问候置底 */
export default function CompanionSidebar({
  tasks,
  selectedDate,
  className = "",
}: Props) {
  return (
    <div className={["flex h-full flex-col", className].join(" ")}>
      <header className="shrink-0 border-b border-orange-100/60 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-orange-500 sm:text-2xl">
          微光 ✨
        </h1>
      </header>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
        <TaskStats
          tasks={tasks}
          selectedDate={selectedDate}
          variant="companion"
        />

        <div className="flex min-h-0 flex-1 flex-col">
          <AIChat className="mt-0 flex h-full min-h-0 flex-col" />
        </div>
      </div>

      <footer className="mt-4 shrink-0 space-y-3 border-t border-orange-100/60 pt-4">
        <div className="flex items-start gap-3 rounded-2xl bg-orange-50/70 px-3 py-2.5 sm:rounded-3xl sm:px-4 sm:py-3">
          <span className="text-2xl sm:text-3xl" aria-hidden>
            🌙
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-700">小光</p>
            <TimeGreeting className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <p className="text-center text-xs leading-5 text-stone-400">
          陪你熬过备考的每一天
        </p>
      </footer>
    </div>
  );
}
