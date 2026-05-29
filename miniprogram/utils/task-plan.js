/** 与 lib/task-plan.ts 对齐的任务计划配置（小程序端） */

const TASK_CATEGORIES = [
  { id: "study", label: "学习", icon: "📚" },
  { id: "coding", label: "编程", icon: "💻" },
  { id: "sport", label: "运动", icon: "🏃" },
  { id: "life", label: "生活", icon: "🌿" },
  { id: "other", label: "其他", icon: "✨" },
];

const TASK_PRIORITIES = [
  { id: "low", label: "轻柔" },
  { id: "medium", label: "刚好" },
  { id: "high", label: "重要" },
];

const POMODORO_OPTIONS = [
  { minutes: 0, label: "不设" },
  { minutes: 15, label: "15 分" },
  { minutes: 25, label: "25 分" },
  { minutes: 45, label: "45 分" },
];

const QUICK_PLAN_PRESETS = [
  {
    text: "背 10 个单词",
    category: "study",
    priority: "low",
    pomodoroMinutes: 15,
  },
  {
    text: "看 1 节视频课",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
  },
  {
    text: "写 3 道题",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
  },
];

const XIAOGUANG_SUGGESTIONS = [
  { text: "背 10 个单词", category: "study", priority: "low", pomodoroMinutes: 15 },
  { text: "复习一章笔记", category: "study", priority: "medium", pomodoroMinutes: 25 },
  { text: "写 20 分钟代码", category: "coding", priority: "medium", pomodoroMinutes: 25 },
  { text: "散步 15 分钟", category: "sport", priority: "low", pomodoroMinutes: 15 },
  { text: "收拾书桌 10 分钟", category: "life", priority: "low", pomodoroMinutes: 15 },
  { text: "做一道错题复盘", category: "study", priority: "medium", pomodoroMinutes: 25 },
];

function createDefaultPlanDraft(date) {
  return {
    text: "",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
    date,
  };
}

function getRandomXiaoguangSuggestion() {
  const pick =
    XIAOGUANG_SUGGESTIONS[Math.floor(Math.random() * XIAOGUANG_SUGGESTIONS.length)];
  return { ...pick };
}

function getCategoryMeta(category) {
  return (
    TASK_CATEGORIES.find((c) => c.id === category) || TASK_CATEGORIES[4]
  );
}

function getPriorityLabel(priority) {
  const item = TASK_PRIORITIES.find((p) => p.id === priority);
  return item ? item.label : "刚好";
}

function getPomodoroLabel(minutes) {
  const item = POMODORO_OPTIONS.find((o) => o.minutes === minutes);
  return item ? item.label : "不设";
}

module.exports = {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  POMODORO_OPTIONS,
  QUICK_PLAN_PRESETS,
  createDefaultPlanDraft,
  getRandomXiaoguangSuggestion,
  getCategoryMeta,
  getPriorityLabel,
  getPomodoroLabel,
};
