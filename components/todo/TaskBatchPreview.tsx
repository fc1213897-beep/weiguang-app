"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PlanDraft } from "@/types/task";

type PreviewItem = PlanDraft & { id: string; selected: boolean };

function toPreviewItems(drafts: PlanDraft[]): PreviewItem[] {
  return drafts.map((d, i) => ({
    ...d,
    id: `preview-${i}-${Date.now()}`,
    selected: true,
  }));
}

type Props = {
  drafts: PlanDraft[];
  summary?: string;
  onConfirm: (selected: PlanDraft[]) => void;
  onCancel?: () => void;
  confirming?: boolean;
};

/** 批量任务预览：勾选、编辑标题后确认写入 */
export default function TaskBatchPreview({
  drafts,
  summary,
  onConfirm,
  onCancel,
  confirming = false,
}: Props) {
  const [items, setItems] = useState<PreviewItem[]>(() => toPreviewItems(drafts));

  const updateText = useCallback((id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const selectedCount = items.filter((i) => i.selected && i.text.trim()).length;

  function handleConfirm() {
    const selected = items
      .filter((i) => i.selected && i.text.trim())
      .map(({ text, category, priority, pomodoroMinutes, date, note }) => ({
        text: text.trim(),
        category,
        priority,
        pomodoroMinutes,
        date,
        note,
      }));
    onConfirm(selected);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl bg-stone-50 px-3 py-4 text-center text-sm text-stone-500">
        没有可添加的任务
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {summary && (
        <p className="rounded-xl bg-orange-50/80 px-3 py-2.5 text-sm leading-relaxed text-stone-600">
          {summary}
        </p>
      )}

      <ul className="max-h-[min(40vh,320px)] space-y-2 overflow-y-auto">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2 rounded-xl border border-orange-100/70 bg-white px-2.5 py-2"
          >
            <input
              type="checkbox"
              checked={item.selected}
              onChange={() => toggleSelect(item.id)}
              className="mt-2.5 h-4 w-4 shrink-0 accent-orange-500"
              aria-label="选中任务"
            />
            <input
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-stone-50/80 px-2.5 py-2 text-sm text-stone-800 outline-none focus:border-orange-300"
              value={item.text}
              onChange={(e) => updateText(item.id, e.target.value)}
            />
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="soft" className="flex-1" onClick={onCancel} disabled={confirming}>
            返回
          </Button>
        )}
        <Button
          className="flex-1"
          disabled={confirming || selectedCount === 0}
          onClick={handleConfirm}
        >
          {confirming ? "添加中…" : `添加 ${selectedCount} 项到今日 ✨`}
        </Button>
      </div>
    </div>
  );
}
