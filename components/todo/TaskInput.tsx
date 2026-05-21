"use client";

import { Button } from "@/components/ui/button";
import { useTodoStore } from "@/store/todoStore";

export default function TaskInput() {
  const taskDraft = useTodoStore((s) => s.taskDraft);
  const setTaskDraft = useTodoStore((s) => s.setTaskDraft);
  const addTask = useTodoStore((s) => s.addTask);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <input
        className="w-full min-w-0 flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-orange-400 sm:px-5 sm:py-4"
        placeholder="例如：背50个英语单词"
        value={taskDraft}
        onChange={(e) => setTaskDraft(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button fullWidth className="sm:w-auto sm:py-4 sm:px-6" onClick={addTask}>
        添加任务
      </Button>
    </div>
  );
}
