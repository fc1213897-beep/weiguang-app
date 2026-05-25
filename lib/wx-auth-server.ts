import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { wxOpenidToEmail } from "@/lib/wx-login";
import type { WxLoginSessionRow } from "@/types/wx-login";
import type { Session, User } from "@supabase/supabase-js";

/** 按邮箱查找用户（分页遍历） */
async function findUserByEmail(email: string): Promise<User | null> {
  const admin = getSupabaseAdminClient();
  let page = 1;
  const perPage = 200;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const found = data.users.find((u) => u.email === email);
    if (found) return found;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

/** 确保微信 openid 对应 Supabase 用户存在 */
export async function ensureWxAuthUser(openid: string): Promise<User> {
  const admin = getSupabaseAdminClient();
  const email = wxOpenidToEmail(openid);

  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const password = crypto.randomUUID() + crypto.randomUUID();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        wx_openid: openid,
        provider: "weixin_mp",
      },
    });

  if (createError) {
    if (
      createError.message.toLowerCase().includes("already") ||
      createError.message.includes("registered")
    ) {
      const again = await findUserByEmail(email);
      if (again) return again;
    }
    throw new Error(createError.message);
  }

  if (!created.user) {
    throw new Error("创建微信用户失败");
  }

  return created.user;
}

/** 为指定用户签发 Session（generateLink + verifyOtp） */
export async function createSessionForUser(user: User): Promise<Session> {
  const admin = getSupabaseAdminClient();
  const email = user.email;

  if (!email) {
    throw new Error("用户缺少邮箱，无法签发 Session");
  }

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError) {
    throw new Error(linkError.message);
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error("生成登录令牌失败");
  }

  const { data: verified, error: verifyError } =
    await admin.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

  if (verifyError) {
    throw new Error(verifyError.message);
  }

  if (!verified.session) {
    throw new Error("兑换 Session 失败");
  }

  return verified.session;
}

/** 读取并校验扫码会话 */
export async function getValidWxSession(
  scene: string
): Promise<WxLoginSessionRow> {
  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from("wx_login_sessions")
    .select("*")
    .eq("scene", scene)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("登录会话不存在或已失效");
  }

  const row = data as WxLoginSessionRow;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin
      .from("wx_login_sessions")
      .update({ status: "expired" })
      .eq("scene", scene);
    throw new Error("二维码已过期，请刷新重试");
  }

  return row;
}

/** 小程序授权：pending → completed 并写入 openid */
export async function completeWxLoginSession(
  scene: string,
  openid: string
): Promise<void> {
  const row = await getValidWxSession(scene);

  if (row.status !== "pending") {
    throw new Error("该二维码已使用或已过期，请回到电脑刷新重扫");
  }

  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("wx_login_sessions")
    .update({ openid, status: "completed" })
    .eq("scene", scene)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
}
