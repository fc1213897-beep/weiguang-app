/**
 * 微光布局层级与间距规则（避免 Tab / 弹窗遮挡）
 *
 * z-index:
 *   50  — 手机底部 Tab（MobileTabNav）
 *   100 — 全屏遮罩弹窗（新建计划等）
 *   110 — 欢迎弹窗（CharacterModal）
 *
 * 手机主内容底部留白：Tab 高度约 3.5rem + 安全区
 */

export const Z_MOBILE_TAB = 50;
export const Z_MODAL = 100;
export const Z_WELCOME_MODAL = 110;

/** 手机端 main 底部 padding（Tailwind 类名） */
export const MOBILE_MAIN_PB =
  "max-lg:pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom)))]";

/** 桌面三栏：左菜单 | 主任务区 | 聊天 */
export const DESKTOP_GRID_CLASS =
  "lg:grid lg:grid-cols-[220px_minmax(0,1fr)_minmax(360px,400px)] xl:grid-cols-[220px_minmax(0,1fr)_420px]";
