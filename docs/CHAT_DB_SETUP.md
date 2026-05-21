# chat_sessions / messages · Supabase 初始化与验证

> 第一阶段：默认单会话 + 消息上云，**不接多会话 UI**。

SQL 文件：[supabase/sql/chat_init.sql](../supabase/sql/chat_init.sql)

---

## 一、在 Supabase SQL Editor 执行

1. [Supabase Dashboard](https://supabase.com/dashboard) → 微光项目  
2. **SQL Editor** → **New query**  
3. 复制 `supabase/sql/chat_init.sql` 全文 → **Run**  
4. 成功提示且无报错  

若尚未建 `tasks` 表，可先执行 `supabase/sql/tasks_init.sql`（互不依赖，顺序任意）。

---

## 二、验证表创建成功

| 检查项 | 预期 |
|--------|------|
| Table Editor | 存在 `chat_sessions`、`messages` |
| `chat_sessions` | 含 `is_default`、`reply_index` 等列 |
| `messages` | 含 `session_id`、`role`、`content`、`client_seq` |
| RLS | 两表均为 **Enabled** |
| Policies | `chat_sessions` 1 条；`messages` select + insert |

```sql
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('chat_sessions', 'messages');
```

---

## 三、与应用联调（登录后）

1. `npm run dev`，Magic Link **登录**  
2. 打开「小光陪伴」发送一条消息  
3. **Table Editor**  
   - `chat_sessions`：当前用户 1 行，`is_default = true`  
   - `messages`：至少 2 行（user + assistant），`client_seq` 有值  

---

## 四、字段对照（本地 ↔ 云端）

| 本地 `ChatMessage` / `AIChatStorage` | 云端 |
|--------------------------------------|------|
| `id` (number) | `messages.client_seq` |
| `text` | `messages.content` |
| `role` | `messages.role` |
| `replyIndex` | `chat_sessions.reply_index` |
| 单会话 | `chat_sessions.is_default = true` |

---

*微光 · 温柔陪伴你的学习与小目标*
