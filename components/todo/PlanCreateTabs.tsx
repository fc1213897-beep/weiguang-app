"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TaskBatchPreview from "@/components/todo/TaskBatchPreview";
import type { PlanDraft } from "@/types/task";
import { useTodoStore } from "@/store/todoStore";

type TabId = "single" | "split" | "import";

type Props = {
  taskDate: string;
  onDone: () => void;
  showTabs?: boolean;
};

/** 新建计划：单条 / 智能拆分 / 导入清单 */
export default function PlanCreateTabs({
  taskDate,
  onDone,
  showTabs = true,
}: Props) {
  const addTasksFromDrafts = useTodoStore((s) => s.addTasksFromDrafts);
  const [tab, setTab] = useState<TabId>("single");
  const [goal, setGoal] = useState("");
  const [importText, setImportText] = useState("");
  const [polish, setPolish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewDrafts, setPreviewDrafts] = useState<PlanDraft[] | null>(null);
  const [previewSummary, setPreviewSummary] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function requestSplit(mode: "ai" | "import") {
    setLoading(true);
    setError("");
    try {
      const lines =
        mode === "import"
          ? importText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
          : undefined;

      const res = await fetch("/api/tasks/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          goal: mode === "ai" ? goal : undefined,
          lines,
          task_date: taskDate,
          polish: mode === "import" ? polish : undefined,
        }),
      });
      const data = (await res.json()) as {
        drafts?: PlanDraft[];
        summary?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "请求失败");
      setPreviewDrafts(data.drafts ?? []);
      setPreviewSummary(data.summary ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "拆分失败");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmBatch(selected: PlanDraft[]) {
    if (selected.length === 0) return;
    setConfirming(true);
    const dated = selected.map((d) => ({ ...d, date: taskDate }));
    addTasksFromDrafts(dated);
    setConfirming(false);
    onDone();
  }

  if (previewDrafts) {
    return (
      <TaskBatchPreview
        drafts={previewDrafts}
        summary={previewSummary}
        confirming={confirming}
        onCancel={() => setPreviewDrafts(null)}
        onConfirm={handleConfirmBatch}
      />
    );
  }

  return (
    <div className="space-y-4">
      {showTabs && (
        <div className="flex gap-1 rounded-xl bg-stone-100/80 p-1">
          {(
            [
              { id: "single" as const, label: "单条" },
              { id: "split" as const, label: "智能拆分" },
              { id: "import" as const, label: "导入清单" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setError("");
              }}
              className={[
                "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                tab === t.id
                  ? "bg-white text-orange-700 shadow-sm"
                  : "text-stone-500",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === "single" && (
        <p className="text-xs text-stone-500">
          在下方填写单条计划，或使用「智能拆分」「导入清单」批量添加。
        </p>
      )}

      {tab === "split" && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-stone-600">
            今天想完成的大目标
          </label>
          <textarea
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-300"
            rows={4}
            placeholder="例如：复习线性代数第一章，并完成配套习题"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <Button
            fullWidth
            disabled={loading || !goal.trim()}
            onClick={() => void requestSplit("ai")}
          >
            {loading ? "小光思考中…" : "让小光拆分 ✨"}
          </Button>
        </div>
      )}

      {tab === "import" && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-stone-600">
            每行一条任务（从 Excel / 备忘录粘贴）
          </label>
          <textarea
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-orange-300"
            rows={8}
            placeholder={"背 50 个单词\n看专业课视频 2 节\n整理错题本"}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-stone-600">
            <input
              type="checkbox"
              checked={polish}
              onChange={(e) => setPolish(e.target.checked)}
              className="accent-orange-500"
            />
            让小光顺便整理一下措辞
          </label>
          <Button
            fullWidth
            disabled={loading || !importText.trim()}
            onClick={() => void requestSplit("import")}
          >
            {loading ? "处理中…" : "预览导入列表"}
          </Button>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
