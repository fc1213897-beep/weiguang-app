import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { listDueTaskReminders, listTasksForMp } from "@/lib/mp-tasks-server";
import { sendSubscribeMessage } from "@/lib/wechat";
import {
  getWxSubscribeTemplateDaily,
  getWxSubscribeTemplateTaskAdded,
  getWxSubscribeTemplateTaskRemind,
} from "@/lib/wx-subscribe-config";

const CHINA_TZ = "Asia/Shanghai";

function getTodayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHINA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getChinaNowMinutes(): { dateStr: string; totalMinutes: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHINA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const dateStr = `${get("year")}-${get("month")}-${get("day")}`;
  const hours = Number(get("hour"));
  const minutes = Number(get("minute"));
  return { dateStr, totalMinutes: hours * 60 + minutes };
}

/** 用户设定的每日摘要时刻是否落在当前时间窗口内 */
function isWithinRemindWindow(remindTime: string, windowMinutes = 5): boolean {
  const [h, m] = remindTime.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const china = getChinaNowMinutes();
  const target = h * 60 + m;
  const diff = Math.abs(china.totalMinutes - target);
  return diff <= windowMinutes || diff >= 24 * 60 - windowMinutes;
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
  templateId: string,
  taskId?: string | null
): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  let query = admin
    .from("wx_subscribe_grants")
    .select("status")
    .eq("user_id", userId)
    .eq("template_id", templateId)
    .eq("status", "accept");

  if (taskId) {
    query = query.eq("task_id", taskId);
  } else {
    query = query.is("task_id", null);
  }

  const { data } = await query.maybeSingle();
  return !!data;
}

async function markGrantSent(
  userId: string,
  templateId: string,
  taskId?: string | null
) {
  const admin = getSupabaseAdminClient();
  let query = admin
    .from("wx_subscribe_grants")
    .update({ status: "sent" })
    .eq("user_id", userId)
    .eq("template_id", templateId);

  if (taskId) {
    query = query.eq("task_id", taskId);
  } else {
    query = query.is("task_id", null);
  }

  await query;
}

async function hasDailyDigestSentToday(userId: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const china = getChinaNowMinutes();
  const dayStart = new Date(`${china.dateStr}T00:00:00+08:00`).toISOString();
  const { data } = await admin
    .from("notification_log")
    .select("id")
    .eq("user_id", userId)
    .eq("kind", "daily_digest")
    .gte("sent_at", dayStart)
    .limit(1);

  return (data?.length ?? 0) > 0;
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

    await markGrantSent(userId, templateId);
    await logNotification(userId, templateId, "task_added", { count, source });
  } catch (e) {
    console.error("[wx-notify] task_added:", e);
  }
}

/** 每日待办摘要推送（cron 调用，按用户 remind_time 窗口） */
export async function pushDailyTaskDigestForUser(userId: string): Promise<boolean> {
  const templateId = getWxSubscribeTemplateDaily();
  if (!templateId) return false;

  const prefs = await getNotificationPrefs(userId);
  if (!prefs?.remind_enabled) return false;

  const remindTime = prefs.remind_time || "08:00";
  if (!isWithinRemindWindow(remindTime)) return false;
  if (await hasDailyDigestSentToday(userId)) return false;

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

  await markGrantSent(userId, templateId);
  await logNotification(userId, templateId, "daily_digest", {
    pending: pending.length,
    today,
    remind_time: remindTime,
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

/** 到点单任务提醒推送（cron 每 1–5 分钟） */
export async function pushDueTaskReminders(): Promise<{
  sent: number;
  skipped: number;
}> {
  const templateId = getWxSubscribeTemplateTaskRemind();
  if (!templateId) return { sent: 0, skipped: 0 };

  const due = await listDueTaskReminders();
  let sent = 0;
  let skipped = 0;

  for (const task of due) {
    try {
      const openid = await getUserOpenid(task.user_id);
      if (!openid) {
        skipped += 1;
        continue;
      }

      const granted = await hasSubscribeGrant(
        task.user_id,
        templateId,
        task.id
      );
      if (!granted) {
        skipped += 1;
        continue;
      }

      const timeLabel = task.remind_at
        ? new Intl.DateTimeFormat("zh-CN", {
            timeZone: CHINA_TZ,
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(task.remind_at))
        : "";

      await sendSubscribeMessage({
        openid,
        templateId,
        page: "pages/tasks/tasks",
        data: {
          thing1: { value: task.title.slice(0, 20) },
          time2: { value: timeLabel.slice(0, 20) },
        },
      });

      const admin = getSupabaseAdminClient();
      await admin
        .from("tasks")
        .update({ remind_sent_at: new Date().toISOString() })
        .eq("id", task.id);

      await markGrantSent(task.user_id, templateId, task.id);
      await logNotification(task.user_id, templateId, "task_remind", {
        task_id: task.id,
        title: task.title,
      });
      sent += 1;
    } catch (e) {
      console.error("[wx-notify] task_remind:", task.id, e);
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
  taskId?: string | null;
}) {
  const admin = getSupabaseAdminClient();
  let query = admin
    .from("wx_subscribe_grants")
    .select("id")
    .eq("user_id", input.userId)
    .eq("template_id", input.templateId);

  if (input.taskId) {
    query = query.eq("task_id", input.taskId);
  } else {
    query = query.is("task_id", null);
  }

  const { data: existing } = await query.maybeSingle();

  const row = {
    user_id: input.userId,
    openid: input.openid,
    template_id: input.templateId,
    status: input.status,
    task_id: input.taskId ?? null,
    granted_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await admin
      .from("wx_subscribe_grants")
      .update(row)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("wx_subscribe_grants").insert(row);
    if (error) throw new Error(error.message);
  }
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
