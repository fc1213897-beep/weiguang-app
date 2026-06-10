"use client";

import { getStrategy } from "@/lib/countdown/strategy-registry";
import type { PlanBlueprint, StrategyConfigField } from "@/types/countdown";

type Props = {
  plan: PlanBlueprint;
  onChange: (patch: Partial<PlanBlueprint>) => void;
};

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: StrategyConfigField;
  value: unknown;
  onChange: (key: string, val: unknown) => void;
}) {
  if (field.type === "number") {
    return (
      <label className="block text-sm">
        <span className="text-stone-600">{field.label}</span>
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={typeof value === "number" ? value : (field.defaultValue as number) ?? 0}
          onChange={(e) =>
            onChange(field.key, Number(e.target.value) || 0)
          }
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </label>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <label className="block text-sm">
        <span className="text-stone-600">{field.label}</span>
        <select
          value={typeof value === "string" ? value : String(field.defaultValue ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block text-sm">
      <span className="text-stone-600">{field.label}</span>
      <input
        type="text"
        value={typeof value === "string" ? value : String(field.defaultValue ?? "")}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
      />
    </label>
  );
}

/** 子计划参数表单（按策略 configFields 动态渲染） */
export default function PlanBlueprintForm({ plan, onChange }: Props) {
  const strategy = getStrategy(plan.strategyId);
  if (!strategy) return null;

  function handleParamChange(key: string, val: unknown) {
    onChange({
      params: { ...plan.params, [key]: val },
    });
  }

  return (
    <div className="space-y-3 rounded-xl bg-stone-50/80 p-3">
      <label className="block text-sm">
        <span className="text-stone-600">子计划名称</span>
        <input
          type="text"
          value={plan.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={plan.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
        />
        <span className="text-stone-600">启用此子计划</span>
      </label>

      <label className="block text-sm">
        <span className="text-stone-600">优先级</span>
        <select
          value={plan.priority}
          onChange={(e) =>
            onChange({
              priority: e.target.value as PlanBlueprint["priority"],
            })
          }
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </label>

      {strategy.configFields.map((field) => (
        <ConfigField
          key={field.key}
          field={field}
          value={plan.params[field.key] ?? field.defaultValue}
          onChange={handleParamChange}
        />
      ))}
    </div>
  );
}
