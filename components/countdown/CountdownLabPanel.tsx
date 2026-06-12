"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import PlanBlueprintForm from "@/components/countdown/PlanBlueprintForm";
import { getRecipes } from "@/lib/countdown/load-recipes";
import { formatDaysLeft } from "@/lib/countdown/progress-utils";
import { previewPlansForTarget } from "@/lib/countdown/plan-orchestrator";
import { listStrategies } from "@/lib/countdown/strategy-registry";
import { validateCountdownTarget } from "@/lib/countdown/validate-target";
import { useCountdownStore } from "@/store/countdownStore";
import type { CountdownTarget } from "@/types/countdown";

/** 备考倒计时：配置与计划生成 */
export default function CountdownLabPanel() {
  const targets = useCountdownStore((s) => s.settings.targets);
  const addFromRecipe = useCountdownStore((s) => s.addFromRecipe);
  const addEmptyTarget = useCountdownStore((s) => s.addEmptyTarget);
  const updateTarget = useCountdownStore((s) => s.updateTarget);
  const removeTarget = useCountdownStore((s) => s.removeTarget);
  const addPlan = useCountdownStore((s) => s.addPlan);
  const updatePlan = useCountdownStore((s) => s.updatePlan);
  const removePlan = useCountdownStore((s) => s.removePlan);
  const generatePlans = useCountdownStore((s) => s.generatePlans);
  const importSettings = useCountdownStore((s) => s.importSettings);
  const exportSettings = useCountdownStore((s) => s.exportSettings);

  const [selectedId, setSelectedId] = useState<string | null>(
    targets[0]?.id ?? null
  );
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ date: string; texts: string[] }[]>(
    []
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recipes = getRecipes();
  const strategies = listStrategies();

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 4000);
  }, []);

  function handleApplyRecipe(recipeId: string) {
    const title = "2026 考研";
    const targetDate = "2026-12-21";
    const id = addFromRecipe(recipeId, title, targetDate);
    if (id) {
      setSelectedId(id);
      showMessage("已从模板创建倒计时，请调整日期和参数");
    }
  }

  function handleAddEmpty() {
    const id = addEmptyTarget("我的考试", "2026-12-21");
    setSelectedId(id);
  }

  async function handlePreview(target: CountdownTarget) {
    setLoading(true);
    try {
      const rows = await previewPlansForTarget(target, 7);
      setPreview(rows);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(target: CountdownTarget) {
    const validation = validateCountdownTarget(target);
    if (!validation.ok) {
      showMessage(validation.errors.join("；"));
      return;
    }
    setLoading(true);
    try {
      const result = await generatePlans(target.id);
      const warn =
        result.warnings.length > 0 ? `（${result.warnings[0]}）` : "";
      showMessage(
        `已生成 ${result.created} 条任务，跳过 ${result.skipped} 条重复${warn}`
      );
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    const json = JSON.stringify(exportSettings(), null, 2);
    void navigator.clipboard.writeText(json).then(() => {
      showMessage("配置已复制到剪贴板");
    });
  }

  function handleImport() {
    const raw = window.prompt("粘贴 JSON 配置：");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ReturnType<typeof exportSettings>;
      importSettings(parsed);
      showMessage("配置已导入");
    } catch {
      showMessage("JSON 格式无效");
    }
  }

  function handleAddPlan(targetId: string, strategyId: string) {
    const strategy = strategies.find((s) => s.id === strategyId);
    if (!strategy) return;
    const params: Record<string, unknown> = {};
    for (const f of strategy.configFields) {
      if (f.defaultValue !== undefined) {
        params[f.key] = f.defaultValue;
      }
    }
    addPlan(targetId, {
      label: strategy.label,
      strategyId,
      enabled: true,
      priority: "medium",
      params,
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/40 to-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-stone-800">备考倒计时</h3>
        <p className="mt-1 text-sm text-stone-500">
          设置考试日期，选择模板或自定义子计划，自动生成每日任务
        </p>
      </div>

      {message && (
        <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
          {message}
        </p>
      )}

      {/* Recipe 模板 */}
      <section>
        <p className="mb-2 text-xs font-medium text-stone-500">从模板开始</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {recipes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleApplyRecipe(r.id)}
              className="rounded-xl border border-indigo-100 bg-white p-3 text-left transition hover:border-indigo-200 hover:shadow-sm"
            >
              <span className="text-lg">{r.icon ?? "📋"}</span>
              <p className="mt-1 text-sm font-medium text-stone-800">
                {r.label}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">{r.description}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="soft" onClick={handleAddEmpty}>
          自定义倒计时
        </Button>
        <Button type="button" variant="soft" onClick={handleExport}>
          导出配置
        </Button>
        <Button type="button" variant="soft" onClick={handleImport}>
          导入配置
        </Button>
      </div>

      {/* 倒计时列表 */}
      {targets.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium text-stone-500">我的倒计时</p>
          {targets.map((t) => (
            <div
              key={t.id}
              className={[
                "rounded-xl border p-4 transition",
                selectedId === t.id
                  ? "border-indigo-300 bg-white shadow-sm"
                  : "border-stone-200 bg-white/60",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className="text-left"
                >
                  <p className="font-medium text-stone-800">{t.title}</p>
                  <p className="text-xs text-stone-500">
                    {t.targetDate} · 剩余 {formatDaysLeft(t)} 天 ·{" "}
                    {t.status}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => removeTarget(t.id)}
                  className="text-xs text-stone-400 hover:text-red-500"
                >
                  删除
                </button>
              </div>

              {selectedId === t.id && (
                <div className="mt-4 space-y-4 border-t border-stone-100 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="text-stone-600">标题</span>
                      <input
                        type="text"
                        value={t.title}
                        onChange={(e) =>
                          updateTarget(t.id, { title: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="text-stone-600">考试日期</span>
                      <input
                        type="date"
                        value={t.targetDate}
                        onChange={(e) =>
                          updateTarget(t.id, { targetDate: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>

                  {/* 子计划 */}
                  <div>
                    <p className="mb-2 text-xs font-medium text-stone-500">
                      子计划
                    </p>
                    <ul className="space-y-2">
                      {t.plans.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-lg border border-stone-100 bg-stone-50/50 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingPlanId(
                                  editingPlanId === p.id ? null : p.id
                                )
                              }
                              className="text-left text-sm text-stone-700"
                            >
                              {p.enabled ? "✓" : "○"} {p.label}
                              <span className="ml-2 text-xs text-stone-400">
                                {p.strategyId}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removePlan(t.id, p.id)}
                              className="text-xs text-stone-400 hover:text-red-500"
                            >
                              移除
                            </button>
                          </div>
                          {editingPlanId === p.id && (
                            <div className="mt-3">
                              <PlanBlueprintForm
                                plan={p}
                                onChange={(patch) =>
                                  updatePlan(t.id, p.id, patch)
                                }
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {strategies.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleAddPlan(t.id, s.id)}
                          className="rounded-full border border-dashed border-stone-300 px-3 py-1 text-xs text-stone-500 hover:border-indigo-300 hover:text-indigo-600"
                        >
                          + {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="soft"
                      disabled={loading}
                      onClick={() => void handlePreview(t)}
                    >
                      预览 7 天
                    </Button>
                    <Button
                      type="button"
                      disabled={loading}
                      onClick={() => void handleGenerate(t)}
                    >
                      生成未来 14 天计划
                    </Button>
                  </div>

                  {preview.length > 0 && selectedId === t.id && (
                    <div className="rounded-xl bg-stone-50 p-3 text-sm">
                      <p className="mb-2 text-xs font-medium text-stone-500">
                        预览
                      </p>
                      <ul className="space-y-2">
                        {preview.map((row) => (
                          <li key={row.date}>
                            <span className="font-mono text-xs text-stone-400">
                              {row.date}
                            </span>
                            <ul className="mt-1 space-y-0.5">
                              {row.texts.map((text) => (
                                <li key={text} className="text-stone-700">
                                  · {text}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
