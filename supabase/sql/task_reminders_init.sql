-- 单任务提醒字段 + 订阅授权关联任务

alter table public.tasks
  add column if not exists remind_at timestamptz null,
  add column if not exists remind_sent_at timestamptz null;

comment on column public.tasks.remind_at is '用户设定的微信提醒时刻（UTC）';
comment on column public.tasks.remind_sent_at is '提醒已推送时间，避免重复发送';

create index if not exists tasks_due_remind_idx
  on public.tasks (remind_at)
  where remind_sent_at is null and completed = false;

-- 订阅授权可关联到具体任务（单任务提醒一次授权一次推送）
alter table public.wx_subscribe_grants
  add column if not exists task_id uuid null references public.tasks(id) on delete cascade;

-- 原唯一约束 (user_id, template_id) 无法区分多任务提醒，改为含 task_id
alter table public.wx_subscribe_grants
  drop constraint if exists wx_subscribe_grants_user_id_template_id_key;

create unique index if not exists wx_subscribe_grants_user_tmpl_task_uidx
  on public.wx_subscribe_grants (
    user_id,
    template_id,
    coalesce(task_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists idx_wx_subscribe_grants_task
  on public.wx_subscribe_grants(task_id)
  where task_id is not null;
