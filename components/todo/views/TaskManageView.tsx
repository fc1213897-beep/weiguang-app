"use client";

import PlanCreateForm from "@/components/todo/PlanCreateForm";
import TaskManageList from "@/components/todo/TaskManageList";

/** 桌面端：任务管理 */
export default function TaskManageView() {
  return (
    <div className="min-w-0">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">任务管理</h2>
        <p className="mt-1 text-sm text-stone-500">
          查看和管理所有日期的学习计划
        </p>
      </header>

      <div className="mt-5 space-y-5">
        <PlanCreateForm variant="desktop" showSuggestionBlock={false} />
        <TaskManageList />
      </div>
    </div>
  );
}
