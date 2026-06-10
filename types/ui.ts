export type MobileTabId = "tasks" | "chat" | "me";

/** 桌面端左侧菜单 */
export type DesktopNavId =
  | "today"
  | "growth"
  | "ledger"
  | "chat"
  | "me"
  /** @deprecated 旧路由兼容 */
  | "home"
  | "journey"
  | "tasks"
  | "stats"
  | "settings"
  | "companion";
