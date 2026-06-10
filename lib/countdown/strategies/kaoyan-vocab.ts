import { loadDataSourceItems } from "@/lib/countdown/data-sources";
import {
  generateRoundFrequencyPlans,
  parseRoundFrequencyParams,
  previewRoundFrequency,
  ROUND_FREQUENCY_CONFIG_FIELDS,
} from "@/lib/countdown/strategies/round-frequency";
import type { PlanStrategy } from "@/types/countdown";
/** 考研词汇：round_frequency 的预置实例 */
export const kaoyanVocabStrategy: PlanStrategy = {
  id: "kaoyan_vocab",
  label: "考研英语词汇",
  description: "三轮复习考研高频词，最后一轮按词频加权",
  configFields: ROUND_FREQUENCY_CONFIG_FIELDS.filter(
    (f) => f.key !== "taskPrefix" && f.key !== "itemLabel"
  ),
  validateParams(params) {
    const p = parseRoundFrequencyParams({
      ...params,
      dataSourceId: params.dataSourceId ?? "kaoyan_top3000",
      rounds: params.rounds ?? 3,
      itemLabel: "词",
      taskPrefix: "背单词",
    });
    if (!p.dataSourceId) return "请选择词库";
    return null;
  },
  async resolveItems(params) {
    const dataSourceId =
      typeof params.dataSourceId === "string"
        ? params.dataSourceId
        : "kaoyan_top3000";
    return loadDataSourceItems(dataSourceId);
  },
  async generate(ctx) {
    const params = parseRoundFrequencyParams({
      ...ctx.blueprint.params,
      dataSourceId: ctx.blueprint.params.dataSourceId ?? "kaoyan_top3000",
      rounds: ctx.blueprint.params.rounds ?? 3,
      itemLabel: "词",
      taskPrefix: "背单词",
    });
    const items =
      ctx.items ??
      (await loadDataSourceItems(params.dataSourceId ?? "kaoyan_top3000"));
    return generateRoundFrequencyPlans(
      { ...ctx, items },
      "kaoyan_vocab",
      params
    );
  },
  preview(ctx) {
    return previewRoundFrequency(
      ctx,
      parseRoundFrequencyParams({
        ...ctx.blueprint.params,
        dataSourceId: ctx.blueprint.params.dataSourceId ?? "kaoyan_top3000",
        rounds: ctx.blueprint.params.rounds ?? 3,
        itemLabel: "词",
        taskPrefix: "背单词",
      })
    );
  },
};