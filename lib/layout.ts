/**
 * 微光布局层级与间距规则（避免 Tab / 弹窗遮挡）
 *
 * z-index:
 *   45  — 小光浮动入口按钮
 *   49  — 手机今日快捷添加条（MobileQuickAddBar）
 *   50  — 手机底部 Tab（MobileTabNav）
 *   55  — 任务卡操作菜单
 *   95  — 小光聊天 Drawer
 *   100 — 全屏遮罩弹窗（新建计划等）
 *   110 — 欢迎弹窗（CharacterModal）
 *
 * 手机主内容底部留白：Tab 内容区 3.25rem + 安全区
 */

export const Z_FLOATING_CHAT = 45;
export const Z_MOBILE_QUICK_ADD = 49;
export const Z_MOBILE_TAB = 50;
export const Z_TASK_CARD_MENU = 55;
export const Z_FLOATING_CHAT_PANEL = 95;
export const Z_MODAL = 100;
export const Z_WELCOME_MODAL = 110;

/** Tab 内容区高度（与 MobileTabNav 一致） */
export const MOBILE_TAB_CONTENT_H = "3.25rem";
/** Tab 底部安全区内边距 */
export const MOBILE_TAB_SAFE_PB = "max(0.5rem, env(safe-area-inset-bottom))";
/** Tab 总占位高度（QuickAddBar 的 bottom 基准） */
export const MOBILE_TAB_TOTAL_BOTTOM = `calc(${MOBILE_TAB_CONTENT_H} + ${MOBILE_TAB_SAFE_PB})`;

/** 快捷添加条内容高度（py-2 + 按钮行） */
export const MOBILE_QUICK_ADD_H = "3.75rem";

/** 手机端 main 底部 padding（仅 Tab，不含快捷条） */
export const MOBILE_MAIN_PB =
  "max-lg:pb-[max(4.25rem,calc(3.25rem+max(0.5rem,env(safe-area-inset-bottom))+0.5rem))]";

/** 手机今日页：Tab + 快捷添加条（不与 MOBILE_MAIN_PB 叠加） */
export const MOBILE_TASK_PB =
  "max-lg:pb-[max(8rem,calc(7rem+max(0.5rem,env(safe-area-inset-bottom))+0.5rem))]";

/** 手机聊天区最小高度：视口 - 顶栏 - Tab */
export const MOBILE_CHAT_MIN_H =
  "calc(100dvh - 4rem - 3.25rem - max(0.5rem, env(safe-area-inset-bottom)))";

/**
 * 今日任务 Tab 由 MobileTaskView 单独留白，避免与 MOBILE_TASK_PB 双重叠加
 */
export function getMobileMainPbClass(route: string, mobileTab: string): string {
  const isTodayTasksTab =
    (route === "today" || route === "tasks") && mobileTab === "tasks";
  return isTodayTasksTab ? "" : MOBILE_MAIN_PB;
}

/** 桌面两栏：左菜单 | 主内容区（AI 为右下角浮动入口） */
export const DESKTOP_GRID_CLASS =
  "lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]";
