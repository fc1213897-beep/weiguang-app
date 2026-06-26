/** 微信订阅消息模板 ID（公众平台申请后填入 .env） */

export function getWxSubscribeTemplateDaily(): string | null {
  return process.env.WX_SUBSCRIBE_TMPL_DAILY?.trim() || null;
}

export function getWxSubscribeTemplateTaskAdded(): string | null {
  return process.env.WX_SUBSCRIBE_TMPL_TASK_ADDED?.trim() || null;
}

export function getWxSubscribeTemplateTaskRemind(): string | null {
  return process.env.WX_SUBSCRIBE_TMPL_TASK_REMIND?.trim() || null;
}

export function getCronSecret(): string | null {
  return process.env.CRON_SECRET?.trim() || null;
}
