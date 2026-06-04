import type { User } from "@supabase/supabase-js";

/** 账号规范化（小写，去首尾空格） */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** 校验账号格式，通过返回 null */
export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (username.length < 3) return "账号至少 3 个字符";
  if (username.length > 20) return "账号最多 20 个字符";
  if (!/^[a-z0-9_]+$/.test(username)) {
    return "账号只能包含字母、数字和下划线";
  }
  return null;
}

/** 账号映射为 Supabase Auth 内部邮箱（不用于真实发信） */
export function usernameToAuthEmail(raw: string): string {
  const username = normalizeUsername(raw);
  return `acc.${username}@weiguang.internal`;
}

/** 从内部邮箱解析账号名 */
export function authEmailToUsername(email: string): string | null {
  const match = email.match(/^acc\.([a-z0-9_]+)@weiguang\.internal$/i);
  return match?.[1] ?? null;
}

/** 界面展示用名称 */
export function formatDisplayAccount(user: User | null): string | null {
  if (!user) return null;

  const meta = user.user_metadata?.username;
  if (typeof meta === "string" && meta.trim()) {
    return meta.trim();
  }

  if (user.email) {
    const fromEmail = authEmailToUsername(user.email);
    if (fromEmail) return fromEmail;
    if (user.email.endsWith("@weiguang.internal")) return "微信用户";
  }

  return user.email ?? null;
}
