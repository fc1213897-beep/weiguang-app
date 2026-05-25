/**
 * 微信小程序本地/测试环境配置
 * localhost 开发不依赖域名备案，服务端直接用 AppID + Secret 调微信 API
 */

export type WxEnvVersion = "develop" | "trial" | "release";

/** 是否为本地开发（Next.js dev 或显式开关） */
export function isWxLocalDev(): boolean {
  if (process.env.WX_LOCAL_DEV === "1") return true;
  return process.env.NODE_ENV === "development";
}

/**
 * 小程序码打开的版本
 * - 测试号 / 未发布：用 develop（开发版）或 trial（体验版）
 * - 已正式发布：release
 */
export function getWxEnvVersion(): WxEnvVersion {
  const raw = process.env.WX_MP_ENV_VERSION?.trim() as WxEnvVersion | "";
  if (raw === "develop" || raw === "trial" || raw === "release") {
    return raw;
  }
  return isWxLocalDev() ? "develop" : "release";
}

/** 扫码进入的小程序页面（须在 app.json 的 pages 里存在） */
export function getWxLoginPage(): string {
  return process.env.WX_MP_LOGIN_PAGE?.trim() || "pages/login/login";
}

/** 脱敏 AppID，用于开发调试展示 */
export function maskAppId(appId: string): string {
  if (appId.length <= 8) return "***";
  return `${appId.slice(0, 4)}…${appId.slice(-4)}`;
}
