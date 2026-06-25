-- 微信订阅消息与用户通知偏好

create table if not exists public.wx_subscribe_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  openid text not null,
  template_id text not null,
  status text not null default 'accept',
  granted_at timestamptz not null default now(),
  unique (user_id, template_id)
);

create index if not exists idx_wx_subscribe_grants_user on public.wx_subscribe_grants(user_id);

create table if not exists public.user_notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  remind_enabled boolean not null default false,
  remind_time text not null default '08:00',
  instant_on_add boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text not null,
  kind text not null,
  sent_at timestamptz not null default now(),
  payload jsonb
);

create index if not exists idx_notification_log_user_kind_date
  on public.notification_log(user_id, kind, sent_at desc);

alter table public.wx_subscribe_grants enable row level security;
alter table public.user_notification_prefs enable row level security;
alter table public.notification_log enable row level security;

create policy "users read own subscribe grants"
  on public.wx_subscribe_grants for select
  using (auth.uid() = user_id);

create policy "users manage own subscribe grants"
  on public.wx_subscribe_grants for all
  using (auth.uid() = user_id);

create policy "users read own notification prefs"
  on public.user_notification_prefs for select
  using (auth.uid() = user_id);

create policy "users manage own notification prefs"
  on public.user_notification_prefs for all
  using (auth.uid() = user_id);

create policy "users read own notification log"
  on public.notification_log for select
  using (auth.uid() = user_id);
