import { randomBytes } from "crypto";
import { WX_SCENE_MAX_LEN } from "@/lib/wechat";

/** 扫码会话有效时间（毫秒），默认 5 分钟 */
export const WX_LOGIN_TTL_MS = 5 * 60 * 1000;

/** 生成高强度 scene（仅字母数字，≤32 字符，满足微信限制） */
export function generateWxScene(): string {
  const raw = randomBytes(18).toString("base64url");
  return raw.slice(0, WX_SCENE_MAX_LEN);
}

export function getWxLoginExpiresAt(from = Date.now()): string {
  return new Date(from + WX_LOGIN_TTL_MS).toISOString();
}

/** 微信 openid 映射为 Supabase 用户邮箱（内部域名，不用于真实发信） */
export function wxOpenidToEmail(openid: string): string {
  const safe = openid.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  return `wx.${safe}@weiguang.internal`;
}
