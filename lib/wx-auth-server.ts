import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { wxOpenidToEmail } from "@/lib/wx-login";
import type { WxLoginSessionRow } from "@/types/wx-login";
import type { Session, User } from "@supabase/supabase-js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function matchUserEmail(user: User, targetEmail: string): boolean {
  if (!user.email) return false;
  return normalizeEmail(user.email) === normalizeEmail(targetEmail);
}

/** Admin API filter 查邮箱（避免 listUsers 分页漏查） */
async function findUserByEmailWithFilter(email: string): Promise<User | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!baseUrl || !serviceKey) return null;

  const res = await fetch(
    `${baseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&page=1&per_page=10`,
    {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const body = (await res.json()) as { users?: User[] };
  return body.users?.find((u) => matchUserEmail(u, email)) ?? null;
}

/** RPC 直连 auth.users（需先执行 supabase/sql/auth_lookup_rpc.sql） */
async function findUserByEmailWithRpc(email: string): Promise<User | null> {
  const admin = getSupabaseAdminClient();
  const { data: userId, error } = await admin.rpc("get_auth_user_id_by_email", {
    p_email: email,
  });

  if (error || !userId) return null;

  const { data, error: getError } = await admin.auth.admin.getUserById(
    userId as string
  );
  if (getError || !data.user) return null;
  return data.user;
}

/** 按邮箱查找用户（filter → RPC → 分页兜底） */
async function findUserByEmail(email: string): Promise<User | null> {
  const admin = getSupabaseAdminClient();

  const fromFilter = await findUserByEmailWithFilter(email);
  if (fromFilter) return fromFilter;

  try {
    const fromRpc = await findUserByEmailWithRpc(email);
    if (fromRpc) return fromRpc;
  } catch {
    // RPC 未建时忽略
  }

  let page = 1;
  const perPage = 200;

  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const found = data.users.find((u) => matchUserEmail(u, email));
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
      throw new Error(
        "该微信账号在系统中已存在但无法自动关联，请在 Supabase → Authentication 删除对应 wx.*@weiguang.internal 用户后重试"
      );
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
