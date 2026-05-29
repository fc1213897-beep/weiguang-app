import {
  CATEGORY_KEYWORDS,
  getCategoriesForType,
  resolveCategoryFromKeyword,
} from "@/lib/expense-plan";
import type { CreateExpenseInput, DbEntryType } from "@/types/database";

export type ParsedExpense = CreateExpenseInput & {
  /** 解析出的备注片段 */
  parsedNote: string;
};

/** 从用户消息中解析记账意图，未命中返回 null */
export function parseExpenseFromMessage(
  message: string,
  defaultDate: string
): ParsedExpense | null {
  const text = message.trim();
  if (!text) return null;

  // 必须包含明确数字金额
  const amountMatch = text.match(/(\d+(?:\.\d{1,2})?)\s*元?/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  let entryType: DbEntryType = "expense";
  if (/收入|入账|到账|工资|薪水/.test(text)) {
    entryType = "income";
  } else if (/花了|支出|消费|买了|付了|记账/.test(text) || !/收入/.test(text)) {
    // 默认支出；含「记账」或消费动词
    if (/收入/.test(text)) entryType = "income";
    else entryType = "expense";
  }

  // 显式收入优先
  if (/^收入|收到|到账/.test(text)) entryType = "income";

  let category = resolveCategoryFromKeyword(text);
  if (!category) {
    const defaults = getCategoriesForType(entryType);
    category = defaults[0].id;
  }

  // 收入分类校正
  if (entryType === "income") {
    if (/工资|薪水/.test(text)) category = "salary";
    else if (/副业/.test(text)) category = "side";
    else if (!getCategoriesForType("income").some((c) => c.id === category)) {
      category = "other";
    }
  }

  // 提取备注：去掉金额与记账关键词后的片段
  let note = text
    .replace(amountMatch[0], "")
    .replace(/^(记账|花了|支出|收入|消费|买了|付了)\s*/u, "")
    .replace(/\s*(元|块)\s*$/u, "")
    .trim();

  // 若备注为空，尝试用分类关键词
  if (!note) {
    for (const keyword of Object.keys(CATEGORY_KEYWORDS)) {
      if (text.includes(keyword)) {
        note = keyword;
        break;
      }
    }
  }

  // 防误触：纯情感聊天若只有数字但无消费语境，不记账
  const hasExpenseContext =
    /记账|花了|支出|收入|消费|买了|付了|午饭|早饭|晚饭|早餐|午餐|晚餐|咖啡|奶茶|外卖|交通|地铁|公交|打车|工资|薪水|副业|到账|收到/.test(
      text
    );
  if (!hasExpenseContext) return null;

  return {
    amount,
    entry_type: entryType,
    category,
    note: note.slice(0, 100),
    entry_date: defaultDate,
    source: "chat",
    parsedNote: note,
  };
}
