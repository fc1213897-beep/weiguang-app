-- 微光 · 清理测试数据（Supabase SQL Editor 整段执行）
-- 作用：
--   1. 清空 wx_login_sessions（扫码临时会话）
--   2. 删除所有微信虚拟邮箱用户 wx.*@weiguang.internal
--   3. tasks / chat_sessions / messages 随 auth.users 外键 CASCADE 自动删除
--
-- 注意：执行前请确认没有要保留的真实用户（本项目的微信用户都是该邮箱格式）

BEGIN;

-- ---------- 1. 扫码登录临时表 ----------
TRUNCATE TABLE public.wx_login_sessions;

-- ---------- 2. profiles（仅当已执行过 profiles 建表 SQL 时取消注释） ----------
-- DELETE FROM public.profiles
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email LIKE 'wx.%@weiguang.internal'
-- );

-- ---------- 3. 微信测试账号（Supabase Auth） ----------
DELETE FROM auth.users
WHERE email LIKE 'wx.%@weiguang.internal';

COMMIT;

-- ---------- 验证（应均为 0，auth.users 可能还有非微信账号） ----------
SELECT 'wx_login_sessions' AS 表名, count(*) AS 行数 FROM public.wx_login_sessions
UNION ALL
SELECT 'tasks', count(*) FROM public.tasks
UNION ALL
SELECT 'chat_sessions', count(*) FROM public.chat_sessions
UNION ALL
SELECT 'messages', count(*) FROM public.messages
UNION ALL
SELECT 'wx用户(auth)', count(*) FROM auth.users WHERE email LIKE 'wx.%@weiguang.internal';
