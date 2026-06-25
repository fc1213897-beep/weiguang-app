"use client";

import { Button } from "@/components/ui/button";
import type { PlanDraft } from "@/types/task";
import { useTodoStore } from "@/store/todoStore";

type Props = {
  drafts: PlanDraft[];
  onAdded?: () => void;
};

/** 聊天内：小光建议任务卡片 */
export default function ChatTaskSuggestCard({ drafts, onAdded }: Props) {
  const addTasksFromDrafts = useTodoStore((s) => s.addTasksFromDrafts);
  const selectedDate = useTodoStore((s) => s.selectedDate);

  if (!drafts.length) return null;

  function handleAdd() {
    const dated = drafts.map((d) => ({ ...d, date: selectedDate }));
    addTasksFromDrafts(dated);
    onAdded?.();
  }

  return (
    <div className="mt-2 rounded-xl border border-orange-200/80 bg-white/90 p-2.5">
      <p className="mb-1.5 text-[11px] font-medium text-orange-700">建议加入今日</p>
      <ul className="mb-2 space-y-1">
        {drafts.slice(0, 6).map((d, i) => (
          <li key={`${d.text}-${i}`} className="text-xs text-stone-600">
            · {d.text}
          </li>
        ))}
      </ul>
      <Button className="w-full rounded-xl text-xs py-1.5" onClick={handleAdd}>
        加入今日计划 ({drafts.length})
      </Button>
    </div>
  );
}
