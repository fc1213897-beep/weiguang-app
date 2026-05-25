-- 微信扫码登录会话表（PC 生成 scene，小程序写入 openid，网页轮询后兑换 Session）
-- 在 Supabase SQL Editor 中执行

create table if not exists public.wx_login_sessions (
  scene text primary key,
  openid text,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'consumed', 'expired')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists wx_login_sessions_expires_at_idx
  on public.wx_login_sessions (expires_at);

alter table public.wx_login_sessions enable row level security;

-- 网页端 / 小程序：按 scene 查询状态（scene 为高强度随机串）
drop policy if exists "wx_login_select" on public.wx_login_sessions;
create policy "wx_login_select"
  on public.wx_login_sessions
  for select
  to anon, authenticated
  using (true);

-- 小程序端：将 pending 会话更新为 completed 并写入 openid
drop policy if exists "wx_login_mp_update" on public.wx_login_sessions;
create policy "wx_login_mp_update"
  on public.wx_login_sessions
  for update
  to anon
  using (status = 'pending' and expires_at > now())
  with check (
    status = 'completed'
    and openid is not null
    and length(trim(openid)) > 0
  );

-- 插入仅由服务端 service_role 完成（不开放 anon insert）

comment on table public.wx_login_sessions is '微信扫码登录临时会话';
