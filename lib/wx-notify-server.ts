import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { listTasksForMp } from "@/lib/mp-tasks-server";
import { sendSubscribeMessage } from "@/lib/wechat";
import {
  getWxSubscribeTemplateDaily,
  getWxSubscribeTemplateTaskAdded,
} from "@/lib/wx-subscribe-config";

function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getUserOpenid(userId: string): Promise<string | null> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  const meta = data.user.user_metadata as Record<string, unknown> | undefined;
  const openid = meta?.wx_openid;
  return typeof openid === "string" && openid ? openid : null;
}

async function hasSubscribeGrant(
  userId: string,
  templateId: string
): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("wx_subscribe_grants")
    .select("status")
    .eq("user_id", userId)
    .eq("template_id", templateId)
    .eq("status", "accept")
    .maybeSingle();
  return !!data;
}

async function getNotificationPrefs(userId: string) {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("user_notification_prefs")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function logNotification(
  userId: string,
  templateId: string,
  kind: string,
  payload: Record<string, unknown>
) {
  const admin = getSupabaseAdminClient();
  await admin.from("notification_log").insert({
    user_id: userId,
    template_id: templateId,
    kind,
    payload,
  });
}

/** 批量添加后尝试发送即时通知 */
export async function trySendTaskAddedNotify(
  userId: string,
  count: number,
  source: string
): Promise<void> {
  if (count <= 0) return;

  const templateId = getWxSubscribeTemplateTaskAdded();
  if (!templateId) return;

  try {
    const prefs = await getNotificationPrefs(userId);
    if (!prefs?.instant_on_add) return;

    const openid = await getUserOpenid(userId);
    if (!openid) return;

    const granted = await hasSubscribeGrant(userId, templateId);
    if (!granted) return;

    await sendSubscribeMessage({
      openid,
      templateId,
      page: "pages/tasks/tasks",
      data: {
        thing1: { value: `已添加 ${count} 项今日计划`.slice(0, 20) },
        thing2: { value: source.slice(0, 20) },
      },
    });

    await logNotification(userId, templateId, "task_added", { count, source });
  } catch (e) {
    console.error("[wx-notify] task_added:", e);
  }
}

/** 每日待办摘要推送（cron 调用） */
export async function pushDailyTaskDigestForUser(userId: string): Promise<boolean> {
  const templateId = getWxSubscribeTemplateDaily();
  if (!templateId) return false;

  const prefs = await getNotificationPrefs(userId);
  if (!prefs?.remind_enabled) return false;

  const openid = await getUserOpenid(userId);
  if (!openid) return false;

  const granted = await hasSubscribeGrant(userId, templateId);
  if (!granted) return false;

  const today = getTodayDateString();
  const tasks = await listTasksForMp(userId, today);
  const pending = tasks.filter((t) => !t.completed);
  if (pending.length === 0) return false;

  const titles = pending
    .slice(0, 2)
    .map((t) => t.title)
    .join("、");

  const summary =
    pending.length > 2
      ? `${titles} 等${pending.length}项`
      : titles || `${pending.length}项待办`;

  await sendSubscribeMessage({
    openid,
    templateId,
    page: "pages/tasks/tasks",
    data: {
      thing1: { value: summary.slice(0, 20) },
      number2: { value: String(pending.length) },
      date3: { value: today },
    },
  });

  await logNotification(userId, templateId, "daily_digest", {
    pending: pending.length,
    today,
  });

  return true;
}

/** 为所有开启提醒的用户推送每日摘要 */
export async function pushDailyTaskDigestAll(): Promise<{
  sent: number;
  skipped: number;
}> {
  const admin = getSupabaseAdminClient();
  const { data: prefsList } = await admin
    .from("user_notification_prefs")
    .select("user_id")
    .eq("remind_enabled", true);

  let sent = 0;
  let skipped = 0;

  for (const row of prefsList ?? []) {
    try {
      const ok = await pushDailyTaskDigestForUser(row.user_id);
      if (ok) sent += 1;
      else skipped += 1;
    } catch (e) {
      console.error("[wx-notify] daily user:", row.user_id, e);
      skipped += 1;
    }
  }

  return { sent, skipped };
}

export async function saveSubscribeGrant(input: {
  userId: string;
  openid: string;
  templateId: string;
  status: string;
}) {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("wx_subscribe_grants").upsert(
    {
      user_id: input.userId,
      openid: input.openid,
      template_id: input.templateId,
      status: input.status,
      granted_at: new Date().toISOString(),
    },
    { onConflict: "user_id,template_id" }
  );
  if (error) throw new Error(error.message);
}

export async function upsertNotificationPrefs(
  userId: string,
  patch: {
    remind_enabled?: boolean;
    remind_time?: string;
    instant_on_add?: boolean;
  }
) {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("user_notification_prefs").upsert(
    {
      user_id: userId,
      ...patch,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
}

export async function getNotificationPrefsForUser(userId: string) {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("user_notification_prefs")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return (
    data ?? {
      user_id: userId,
      remind_enabled: false,
      remind_time: "08:00",
      instant_on_add: false,
    }
  );
}
