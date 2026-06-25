import {
  fallbackSingleDraft,
  importLinesToDrafts,
  normalizeAiDraft,
  type TaskSplitMode,
  type TaskSplitResult,
} from "@/lib/task-split";
import type { PlanDraft } from "@/types/task";

const QWEN_API_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const TASK_SPLIT_SYSTEM_PROMPT = `你是微光学习助手的任务规划模块。用户会给出一个较大的学习目标，你需要拆成 3–8 条可在今天或近期完成的、具体可执行的小任务。

只输出 JSON，不要 markdown，不要解释：
{
  "summary": "一句温柔的拆分说明",
  "tasks": [
    {
      "text": "任务标题，15字内为佳",
      "category": "study|coding|sport|life|other",
      "priority": "low|medium|high",
      "pomodoroMinutes": 0|15|25|45
    }
  ]
}

要求：
- 每条任务要具体、可勾选完成，避免空泛
- 优先学习/备考场景，语气温柔不施压
- tasks 数组 3–8 条`;

const POLISH_SYSTEM_PROMPT = `你是任务清单整理助手。用户粘贴了多行任务，请逐行润色为简洁可执行的任务标题，保持条数不变。

只输出 JSON：
{
  "summary": "一句说明",
  "tasks": [{ "text": "...", "category": "study|...", "priority": "medium|...", "pomodoroMinutes": 25 }]
}`;

type AiSplitPayload = {
  summary?: string;
  tasks?: Record<string, unknown>[];
};

function parseAiJson(content: string): AiSplitPayload | null {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as AiSplitPayload;
  } catch {
    return null;
  }
}

async function callQwen(system: string, user: string, maxTokens = 800): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("missing_api_key");
  }

  const res = await fetch(QWEN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      temperature: 0.6,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error("qwen_request_failed");
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("empty_reply");
  return reply;
}

function payloadToDrafts(
  payload: AiSplitPayload,
  taskDate: string,
  notePrefix: string
): PlanDraft[] {
  const items = payload.tasks ?? [];
  const drafts: PlanDraft[] = [];
  items.forEach((raw, i) => {
    const d = normalizeAiDraft(raw, taskDate, i);
    if (d) {
      drafts.push({ ...d, note: `${notePrefix}#${i + 1}` });
    }
  });
  return drafts.slice(0, 8);
}

/** AI 拆分大目标 */
export async function splitGoalWithAi(
  goal: string,
  taskDate: string
): Promise<TaskSplitResult> {
  const userPrompt = `目标：${goal.trim()}\n归属日期：${taskDate}\n请拆成今日可执行的小任务。`;

  try {
    const raw = await callQwen(TASK_SPLIT_SYSTEM_PROMPT, userPrompt);
    const payload = parseAiJson(raw);
    const drafts = payload
      ? payloadToDrafts(payload, taskDate, "source:ai_split")
      : [];

    if (drafts.length === 0) {
      return {
        drafts: fallbackSingleDraft(goal, taskDate),
        summary: "没能拆太细，先当作一个整体目标吧～",
        mode: "ai",
      };
    }

    return {
      drafts,
      summary: payload?.summary?.trim() || `小光帮你拆成了 ${drafts.length} 个小步骤`,
      mode: "ai",
    };
  } catch {
    return {
      drafts: fallbackSingleDraft(goal, taskDate),
      summary: "网络有点慢，先把整体目标记下来吧",
      mode: "ai",
    };
  }
}

/** import 模式：可选 AI 润色 */
export async function splitImportLines(
  lines: string[],
  taskDate: string,
  polish: boolean
): Promise<TaskSplitResult> {
  const cleaned = lines.map((l) => l.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return {
      drafts: [],
      summary: "没有可导入的内容",
      mode: "import",
    };
  }

  if (!polish) {
    const drafts = importLinesToDrafts(cleaned, taskDate);
    return {
      drafts,
      summary: `已识别 ${drafts.length} 条任务`,
      mode: "import",
    };
  }

  try {
    const userPrompt = `清单：\n${cleaned.map((l, i) => `${i + 1}. ${l}`).join("\n")}`;
    const raw = await callQwen(POLISH_SYSTEM_PROMPT, userPrompt, 600);
    const payload = parseAiJson(raw);
    const drafts = payload
      ? payloadToDrafts(payload, taskDate, "source:import_polish")
      : importLinesToDrafts(cleaned, taskDate);

    return {
      drafts: drafts.length > 0 ? drafts : importLinesToDrafts(cleaned, taskDate),
      summary: payload?.summary?.trim() || `整理了 ${drafts.length} 条任务`,
      mode: "import",
    };
  } catch {
    return {
      drafts: importLinesToDrafts(cleaned, taskDate),
      summary: `已导入 ${cleaned.length} 条（未润色）`,
      mode: "import",
    };
  }
}

/** 统一入口 */
export async function runTaskSplit(input: {
  goal?: string;
  task_date: string;
  mode: TaskSplitMode;
  lines?: string[];
  polish?: boolean;
}): Promise<TaskSplitResult> {
  const taskDate = input.task_date.trim();

  if (input.mode === "import") {
    return splitImportLines(input.lines ?? [], taskDate, !!input.polish);
  }

  const goal = (input.goal ?? "").trim();
  if (!goal) {
    return { drafts: [], summary: "请先描述你的目标", mode: "ai" };
  }

  return splitGoalWithAi(goal, taskDate);
}
