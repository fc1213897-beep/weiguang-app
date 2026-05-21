# 微光 Weiguang · V0.4 数据库方案

> 版本：V0.4（设计稿，**不修改现有代码**）  
> 目标：为登录、多端同步、Todo 云端保存、AI 聊天记录保存做准备  
> 推荐栈：**Supabase**（Auth + Postgres + RLS + Realtime）  
> 对齐现状：`lib/storage.ts` · `types/task.ts` · `types/chat.ts` · `docs/ARCHITECTURE.md`

---

## 1. 当前 localStorage 的局限

微光 V1 通过浏览器 `localStorage` 持久化两类数据（见 `STORAGE_KEYS`）：

| 键名 | 内容 | 对应 Store |
|------|------|------------|
| `weiguang-tasks` | `TaskItem[]` 全量任务 | `todoStore` |
| `weiguang-ai-chat` | `{ messages, replyIndex, nextId }` | `chatStore` |

另有 `sessionStorage` 的 `weiguang-welcome-seen`（欢迎弹窗），**不属于业务数据**，本方案不纳入云端。

### 1.1 功能与产品局限

| 局限 | 说明 |
|------|------|
| **单设备绑定** | 数据只存在于当前浏览器，换手机/换电脑/清缓存即丢失，无法「多端一致」。 |
| **无账号体系** | 无法识别「这是谁的数据」，不能登录、不能找回、不能家庭/班级等多用户隔离。 |
| **无协作与备份** | 无法做服务端备份、导出、运营统计或合规审计。 |
| **容量与可靠性** | `localStorage` 通常约 5MB；写入失败时当前实现**静默失败**（`saveToStorage` catch），用户可能以为已保存。 |
| **无冲突解决** | 若未来双写或多端编辑，缺少 `updated_at` / 版本号，无法判断以哪端为准。 |
| **聊天无会话概念** | 全应用仅一条扁平 `messages[]`，无法按日期/主题分会话，也不利于 AI 长期记忆按会话归档。 |
| **ID 类型不统一** | 任务 `id` 为客户端字符串；消息 `id` 为递增 `number`，迁移到服务端 UUID 需做映射或一次性转换。 |

### 1.2 安全局限

- 数据以明文 JSON 存于本机，**无加密、无访问控制**；同一设备上其他脚本/扩展理论上可读（XSS 风险下等同用户数据暴露）。
- AI 对话内容若含学习隐私，**无法**按用户做服务端留存策略、删除权（GDPR/个保法场景）或密钥托管。

---

## 2. 为什么需要数据库

| 需求 | 数据库能提供的 capability |
|------|---------------------------|
| **登录与身份** | 与 `auth.users` 绑定，稳定 `user_id`。 |
| **Todo 云端保存** | 结构化存储 `tasks`，支持按 `date` 查询、软删除、审计字段。 |
| **聊天记录保存** | `chat_sessions` + `messages` 分表，可分页加载、按会话检索。 |
| **多端同步** | 以 `updated_at` 为准的拉取/推送；后续可加 Supabase Realtime。 |
| **权限隔离** | Postgres **RLS**，保证用户只能读写自己的行。 |
| **AI 长期记忆（预留）** | `jsonb` / 向量字段挂在 session 或 profile，不阻塞 MVP 上线。 |

原则：**MVP 只上 4 张核心表**，不引入过度拆分的领域表；客户端 Zustand 仍为 UI 单一数据源，数据库作为**权威持久层**（与 `ARCHITECTURE.md` §9 渐进迁移一致）。

---

## 3. 推荐使用 Supabase 的原因

| 维度 | 说明 |
|------|------|
| **Auth 与数据库一体** | `auth.users` 与 `public.profiles` 同项目，`user_id` 天然 UUID，减少自建认证成本。 |
| **RLS 原生支持** | 行级策略在数据库层强制执行，即使前端漏校验也不易越权（需配合 Service Role 仅服务端使用）。 |
| **与 Next.js 契合** | `@supabase/ssr` 支持 App Router；`/api/chat` 可校验 JWT 后再调模型，API Key 不暴露到浏览器。 |
| **Realtime（可选阶段）** | `tasks` / `messages` 表可订阅变更，多端同步不必自研 WebSocket。 |
| **运维成本低** | 托管 Postgres、自动备份、Dashboard 管理；免费档适合个人 MVP。 |
| **扩展路径清晰** | 后续可加 Storage（头像）、Edge Functions（定时摘要）、pgvector（记忆检索）而不换栈。 |

备选（本阶段不优先）：自建 Postgres + NextAuth、Firebase（NoSQL 对关系型任务/消息查询较弱）。

---

## 4. 核心数据表设计（总览）

```
auth.users (Supabase 内置)
    │
    │ 1 : 1
    ▼
profiles
    │
    │ 1 : N
    ├──────────────────┐
    ▼                  ▼
  tasks          chat_sessions
                       │
                       │ 1 : N
                       ▼
                    messages
```

| 表名 | 职责 |
|------|------|
| `profiles` | 用户资料与全局偏好（时区、展示名、记忆开关等） |
| `tasks` | 学习计划 / Todo（对齐 `TaskItem` + 同步字段） |
| `chat_sessions` | 与小光的一次对话会话（标题、摘要、记忆元数据） |
| `messages` | 会话内逐条消息（用户 / 助手） |

---

## 5. 每张表的字段设计

### 5.1 `profiles` — 用户资料表

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `id` | `uuid` | 是 | — | **主键**，等于 `auth.users.id` |
| `display_name` | `text` | 否 | `null` | 昵称，如「小明」 |
| `avatar_url` | `text` | 否 | `null` | 头像 URL（可接 Supabase Storage） |
| `timezone` | `text` | 否 | `'Asia/Shanghai'` | IANA 时区，用于「今日」边界 |
| `locale` | `text` | 否 | `'zh-CN'` | 界面语言预留 |
| `settings` | `jsonb` | 否 | `'{}'` | 扩展偏好：主题、通知、番茄钟默认值等 |
| `memory_enabled` | `boolean` | 否 | `false` | 是否开启 AI 长期记忆（V0.4 仅占位） |
| `memory_summary` | `text` | 否 | `null` | **AI 长期记忆预留**：用户级压缩摘要 |
| `memory_metadata` | `jsonb` | 否 | `'{}'` | **预留**：记忆版本、来源会话 id 列表、embedding 指针等 |
| `created_at` | `timestamptz` | 是 | `now()` | 创建时间 |
| `updated_at` | `timestamptz` | 是 | `now()` | 更新时间（触发器维护） |

**说明**：注册后通过 Database Trigger 或应用层 `upsert` 自动创建一行 `profiles`。

---

### 5.2 `tasks` — 任务表

对齐现有 `TaskItem`（`types/task.ts`），并增加同步与软删除字段。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `id` | `uuid` | 是 | `gen_random_uuid()` | 服务端主键 |
| `user_id` | `uuid` | 是 | — | 所属用户，FK → `profiles.id` |
| `client_id` | `text` | 否 | `null` | **同步用**：对应本地 `TaskItem.id`（`generateTaskId()`），用于登录后合并去重 |
| `text` | `text` | 是 | — | 任务正文 |
| `done` | `boolean` | 是 | `false` | 是否完成 |
| `date` | `date` | 是 | — | 归属日期 `YYYY-MM-DD`（日历维度） |
| `category` | `text` | 是 | `'other'` | `study \| coding \| sport \| life \| other` |
| `priority` | `text` | 是 | `'medium'` | `low \| medium \| high` |
| `pomodoro_minutes` | `smallint` | 是 | `0` | 番茄钟分钟，0 表示未设置 |
| `note` | `text` | 是 | `''` | 备注 |
| `sort_order` | `integer` | 否 | `0` | 同日内排序（可选，MVP 可按 `created_at`） |
| `deleted_at` | `timestamptz` | 否 | `null` | 软删除，同步时仍可下发 tombstone |
| `created_at` | `timestamptz` | 是 | `now()` | 创建时间 |
| `updated_at` | `timestamptz` | 是 | `now()` | **多端冲突裁决字段** |

**约束建议**：

- `CHECK (category IN (...))`、`CHECK (priority IN (...))`、`CHECK (pomodoro_minutes >= 0)`
- 唯一索引（可选）：`(user_id, client_id) WHERE client_id IS NOT NULL`，防止重复导入本地任务

---

### 5.3 `chat_sessions` — 聊天会话表

V1 前端只有单会话；表结构按**多会话**设计，MVP 可固定使用 `is_default = true` 的一条。

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `id` | `uuid` | 是 | `gen_random_uuid()` | 会话主键 |
| `user_id` | `uuid` | 是 | — | FK → `profiles.id` |
| `title` | `text` | 否 | `'和小光的对话'` | 会话标题（可自动生成） |
| `is_default` | `boolean` | 是 | `false` | 是否默认会话（每用户建议至多一条 `true`） |
| `reply_index` | `integer` | 是 | `0` | 对齐本地 `replyIndex`（兜底回复轮换） |
| `summary` | `text` | 否 | `null` | **AI 长期记忆预留**：会话级摘要 |
| `memory_metadata` | `jsonb` | 否 | `'{}'` | **预留**：情绪标签、学习主题、token 统计、摘要模型版本 |
| `last_message_at` | `timestamptz` | 否 | `null` | 最后一条消息时间，列表排序用 |
| `created_at` | `timestamptz` | 是 | `now()` | 创建时间 |
| `updated_at` | `timestamptz` | 是 | `now()` | 更新时间 |

---

### 5.4 `messages` — 聊天消息表

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `id` | `uuid` | 是 | `gen_random_uuid()` | 消息主键 |
| `session_id` | `uuid` | 是 | — | FK → `chat_sessions.id` ON DELETE CASCADE |
| `user_id` | `uuid` | 是 | — | 冗余 `user_id`，便于 RLS 与按用户清理（须与 session 一致） |
| `role` | `text` | 是 | — | `user \| assistant \| system`（`system` 供提示词注入预留） |
| `content` | `text` | 是 | — | 消息正文（对应本地 `text`） |
| `client_seq` | `bigint` | 否 | `null` | **同步用**：对应本地递增 `id`，导入历史时保序 |
| `model` | `text` | 否 | `null` | 助手回复使用的模型名（审计/计费） |
| `tokens_in` | `integer` | 否 | `null` | 输入 token（可选） |
| `tokens_out` | `integer` | 否 | `null` | 输出 token（可选） |
| `memory_metadata` | `jsonb` | 否 | `'{}'` | **AI 长期记忆预留**：是否纳入记忆、embedding_id、引用任务 id 等 |
| `created_at` | `timestamptz` | 是 | `now()` | 发送时间（只增不改，MVP 不做编辑消息） |

**索引建议**：`(session_id, created_at)`、`(user_id, created_at DESC)`

---

## 6. 字段类型说明

| Postgres 类型 | 使用场景 |
|---------------|----------|
| `uuid` | 主键、`user_id`、外键；与 Supabase Auth 一致 |
| `text` | 任务正文、消息内容、枚举类字符串（MVP 用 CHECK 约束即可，不必单独 enum 类型） |
| `date` | 任务归属日，不含时分区，避免时区导致「今日」错位 |
| `boolean` | `done`、`memory_enabled`、`is_default` |
| `smallint` | `pomodoro_minutes`，节省空间 |
| `integer` / `bigint` | 排序、`reply_index`、`client_seq`、token 计数 |
| `timestamptz` | 所有时间戳，存储 UTC，展示层用 `profiles.timezone` 转换 |
| `jsonb` | `settings`、`memory_metadata` 等半结构化扩展，避免频繁改表 |

**不采用的过度设计（MVP 阶段）**：独立 `categories` 字典表、消息全文检索、分库分表。

---

## 7. 表之间关系

```
auth.users (1) ────── (1) profiles
                           │
                           ├── (1:N) tasks
                           │         user_id → profiles.id
                           │
                           └── (1:N) chat_sessions
                                     │
                                     └── (1:N) messages
                                               session_id → chat_sessions.id
                                               user_id → profiles.id（与 session.user_id 一致）
```

**级联建议**：

- 删除 `chat_sessions` → `CASCADE` 删除其 `messages`
- 删除 `auth.users` → 通过 Trigger 或应用逻辑删除 `profiles` 及名下 `tasks` / `sessions`（或使用 `ON DELETE CASCADE` 从 `profiles` 挂到子表）

**与现有前端映射**：

| 本地 | 云端 |
|------|------|
| `TaskItem` | `tasks` 行（`client_id` = 本地 `id`） |
| `AIChatStorage.messages[]` | 默认 `chat_sessions` + 多条 `messages` |
| `replyIndex` | `chat_sessions.reply_index` |
| `nextId` | 导入后改用 UUID；`client_seq` 保留旧序号 |

---

## 8. `user_id` 如何关联 `auth.users`

1. 用户在 Supabase Auth 注册/登录后，JWT 的 `sub` 即为 **`auth.users.id`**（`uuid`）。
2. `public.profiles.id` **必须等于** `auth.users.id`（1:1，不用独立自增 id）。
3. 所有业务表的 `user_id` / `profiles.id` 外键指向 **`profiles.id`**，不直接指向 `auth.users`（便于将来扩展非 Auth 来源的服务账号，但 MVP 仅 Auth）。
4. RLS 中使用 `auth.uid()` 与 `user_id` 比较：

```sql
-- 示例：tasks 表
user_id = auth.uid()
```

5. **服务端**（`/api/chat`）使用 Supabase **Service Role** 或校验用户 JWT 后，以该 `user_id` 写入 `messages`；切勿在浏览器暴露 Service Role Key。

**注册钩子（推荐）**：

```sql
-- 新用户注册后自动创建 profile（Database Trigger 示意）
-- AFTER INSERT ON auth.users → INSERT INTO profiles (id) VALUES (NEW.id);
```

---

## 9. 未登录游客模式是否保留

**建议：保留。** 与当前产品体验一致，降低首次使用门槛。

| 模式 | 存储 | 云端 |
|------|------|------|
| **游客** | 继续 `localStorage`（`weiguang-tasks`、`weiguang-ai-chat`） | 无 `user_id`，不写库 |
| **已登录** | Zustand + 以 Supabase 为权威；localStorage 可降级为离线草稿缓存 | 读写受 RLS 保护 |

**登录后迁移（一次性）**：

1. 读取本地 `tasks` → `bulk insert`，带 `client_id` = 原 `id`，`ON CONFLICT (user_id, client_id) DO UPDATE`。
2. 读取本地 `messages` → 创建/获取 `is_default = true` 的 `chat_sessions`，按 `client_seq` 插入 `messages`。
3. 迁移成功后：可选清除本地键或标记 `weiguang-migrated-at`，避免重复导入。

**可选增强（V0.5+，非 MVP 必须）**：

- Supabase **Anonymous Sign-In**：游客也有 `auth.uid()`，仍可用 RLS，登录后再 **link identity** 合并账号。
- MVP 为简单起见：**游客纯本地，登录才上云**。

---

## 10. RLS 权限策略设计

原则：**默认拒绝，仅允许本人访问；禁止客户端写他人数据。**

### 10.1 启用 RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### 10.2 `profiles`

| 策略 | 操作 | 条件 |
|------|------|------|
| `profiles_select_own` | `SELECT` | `id = auth.uid()` |
| `profiles_update_own` | `UPDATE` | `id = auth.uid()` |
| `profiles_insert_own` | `INSERT` | `id = auth.uid()` |

不开放 `DELETE`（由账号注销流程处理）。

### 10.3 `tasks`

| 策略 | 操作 | 条件 |
|------|------|------|
| `tasks_select_own` | `SELECT` | `user_id = auth.uid()` |
| `tasks_insert_own` | `INSERT` | `user_id = auth.uid()` |
| `tasks_update_own` | `UPDATE` | `user_id = auth.uid()` |
| `tasks_delete_own` | `DELETE` | `user_id = auth.uid()` |

软删除场景：客户端发 `UPDATE deleted_at`，仍走 `UPDATE` 策略。

### 10.4 `chat_sessions`

| 策略 | 操作 | 条件 |
|------|------|------|
| `sessions_all_own` | `SELECT/INSERT/UPDATE/DELETE` | `user_id = auth.uid()` |

### 10.5 `messages`

| 策略 | 操作 | 条件 |
|------|------|------|
| `messages_select_own` | `SELECT` | `user_id = auth.uid()` |
| `messages_insert_own` | `INSERT` | `user_id = auth.uid()` AND EXISTS (SELECT 1 FROM chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()) |

MVP **不允许**用户 `UPDATE`/`DELETE` 历史消息（如需「清空对话」走专用 RPC 或 `DELETE` 策略按 `session_id` 批量删）。

### 10.6 安全补充

- 浏览器仅使用 **anon key** + 用户 JWT；RLS 生效。
- **Service Role** 仅用于受信服务端（Edge Function、迁移脚本），禁止打包进前端。
- `/api/chat` 在 BFF 层验证登录态后再代写 `messages`（或前端直写但须带有效 JWT）。

---

## 11. 后续支持多端同步的流程

与 `ARCHITECTURE.md` §9.2 一致，分阶段实施：

```
┌─────────────┐     debounce      ┌──────────────┐
│ Zustand     │ ────────────────► │ Supabase     │
│ (UI 源)     │ ◄──────────────── │ (权威存储)   │
└─────────────┘   pull / realtime └──────────────┘
```

| 阶段 | 行为 |
|------|------|
| **A 双写** | 任务/消息变更 → 300–500ms debounce → `upsert`；失败入重试队列 |
| **B 冷启动拉取** | `storageReady` 后：`tasks` 按 `updated_at > last_sync_at` 拉取；`messages` 按 `session_id` 分页 |
| **C 冲突** | 同 `id` 比较 `updated_at`，**较新者胜**；删除以 `deleted_at` 为准 |
| **D Realtime** | 订阅 `tasks:user_id=eq.{uid}`、`messages:session_id=eq.{sid}`，远端变更合并进 Store |
| **E 离线** | 未登录或断网：仅写 localStorage；恢复网络后按队列补写 |

**客户端需新增概念（实施时，非本稿改代码）**：

- `last_sync_at`（存 `profiles.settings` 或 localStorage）
- `sync_status: idle | syncing | error`

---

## 12. 后续支持 AI 长期记忆的预留字段

MVP **不实现**记忆流水线，仅在 schema 留扩展位：

| 位置 | 字段 | 用途 |
|------|------|------|
| `profiles` | `memory_enabled` | 用户总开关 |
| `profiles` | `memory_summary` | 跨会话压缩画像（「用户常学英语、偏好简短鼓励」） |
| `profiles` | `memory_metadata` | 版本号、最后更新时间、embedding 集合 id |
| `chat_sessions` | `summary` | 单会话摘要 |
| `chat_sessions` | `memory_metadata` | 主题标签、关联 `tasks.date` 等 |
| `messages` | `memory_metadata` | 如 `{ "included_in_memory": true, "embedding_id": "..." }` |

**V0.5+ 可选扩展（不改 MVP 表名）**：

- 启用 `pgvector` 扩展，新增 `memory_chunks` 表；或仅在 `memory_metadata` 存 Supabase Vector / 外部向量库 id。
- 定时 Edge Function：读取近期 `messages` → 更新 `session.summary` / `profiles.memory_summary`。
- `/api/chat` 请求体附带 `memory_summary` + 最近 N 条消息，**不把 API Key 或全量历史下发到模型外的不可信层**。

---

## 13. 推荐 SQL 建表语句

> 在 Supabase SQL Editor 执行。执行前请确认扩展：`gen_random_uuid()` 依赖 `pgcrypto`（Supabase 默认已启用）。

```sql
-- ========== profiles ==========
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  timezone text NOT NULL DEFAULT 'Asia/Shanghai',
  locale text NOT NULL DEFAULT 'zh-CN',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  memory_enabled boolean NOT NULL DEFAULT false,
  memory_summary text,
  memory_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== tasks ==========
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  client_id text,
  text text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  date date NOT NULL,
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('study', 'coding', 'sport', 'life', 'other')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  pomodoro_minutes smallint NOT NULL DEFAULT 0 CHECK (pomodoro_minutes >= 0),
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tasks_user_client_id_idx
  ON public.tasks (user_id, client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX tasks_user_date_idx ON public.tasks (user_id, date);
CREATE INDEX tasks_user_updated_idx ON public.tasks (user_id, updated_at);

-- ========== chat_sessions ==========
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '和小光的对话',
  is_default boolean NOT NULL DEFAULT false,
  reply_index integer NOT NULL DEFAULT 0,
  summary text,
  memory_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX chat_sessions_user_default_idx
  ON public.chat_sessions (user_id)
  WHERE is_default = true;

-- ========== messages ==========
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  client_seq bigint,
  model text,
  tokens_in integer,
  tokens_out integer,
  memory_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_session_created_idx
  ON public.messages (session_id, created_at);
CREATE INDEX messages_user_created_idx
  ON public.messages (user_id, created_at DESC);

-- ========== updated_at 触发器（通用） ==========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== RLS ==========
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY tasks_select_own ON public.tasks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY tasks_insert_own ON public.tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY tasks_update_own ON public.tasks
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY tasks_delete_own ON public.tasks
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY chat_sessions_own ON public.chat_sessions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY messages_select_own ON public.messages
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY messages_insert_own ON public.messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );
```

**注册自动创建 Profile（示例 Trigger）**：

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', '微光用户'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 14. 下一步实施顺序

| 顺序 | 事项 | 产出 |
|------|------|------|
| **1** | Supabase 项目、环境变量（`NEXT_PUBLIC_SUPABASE_URL`、anon key、service role） | 可连通的空项目 |
| **2** | 执行 §13 SQL，验证 RLS（用两个测试账号互相不可见） | 表 + 策略就绪 |
| **3** | 接入 Auth UI（邮箱 magic link / OAuth 择一）+ 注册创建 `profiles` | 可登录 |
| **4** | `lib/supabase/client.ts` + `lib/supabase/server.ts`（SSR） | 基础设施 |
| **5** | `lib/repositories/tasks.ts`：`list` / `upsert` / `softDelete` | Todo 云端 CRUD |
| **6** | `hooks/useTodoSync` 替代/并行 `useTodoHydration`：登录后拉取 + debounce 双写 | 任务上云 |
| **7** | 登录迁移：localStorage → `tasks`（`client_id` 去重） | 游客数据不丢 |
| **8** | `chat_sessions` + `messages` repository；默认会话 | 聊天上云 |
| **9** | `/api/chat` 校验 JWT，助手回复写入 `messages` | 服务端留痕 |
| **10** | `useChatSync` + 分页加载历史 | 聊天同步完成 |
| **11** | （可选）Realtime 订阅 `tasks` | 多端近实时 |
| **12** | （可选）`memory_*` 字段 + 摘要 Job | AI 长期记忆 |

**本阶段明确不做**：改现有 Zustand 业务逻辑、改千问 API 协议、强制登录才能用（游客路径保留）。

---

## 附录 A：与现有类型的字段对照

| `TaskItem` | `tasks` 列 |
|------------|------------|
| `id` | `client_id`（迁移）/ 新 UUID 为 `id` |
| `text` | `text` |
| `done` | `done` |
| `date` | `date` |
| `category` | `category` |
| `priority` | `priority` |
| `pomodoroMinutes` | `pomodoro_minutes` |
| `note` | `note` |

| `ChatMessage` | `messages` 列 |
|---------------|---------------|
| `id` (number) | `client_seq` |
| `role` | `role` |
| `text` | `content` |

---

## 附录 B：文档维护

- 表结构变更请同步更新本文档版本号（如 V0.4.1）。
- 实施代码时优先更新 `docs/ARCHITECTURE.md` §9 与本文件保持一致。
- **V0.4 仅设计，不修改仓库代码**；实施从 §14 第 1 步开始。

---

*微光 · 温柔陪伴你的学习与小目标*
