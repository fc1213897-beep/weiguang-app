import { createMpSupabase } from "@/lib/mp-supabase";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MpAuthContext = {
  user: User;
  supabase: SupabaseClient;
  accessToken: string;
};

/** 从请求头读取 Bearer Token */
export function getBearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization")?.trim();
  if (!raw?.toLowerCase().startsWith("bearer ")) return null;
  const token = raw.slice(7).trim();
  return token || null;
}

/** 校验小程序登录态，失败时返回 error 与 HTTP 状态码 */
export async function requireMpAuth(
  request: Request
): Promise<MpAuthContext | { error: string; status: number }> {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return { error: "请先登录", status: 401 };
  }

  const supabase = createMpSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { error: "登录已失效，请重新打开小程序", status: 401 };
  }

  return { user: data.user, supabase, accessToken };
}
