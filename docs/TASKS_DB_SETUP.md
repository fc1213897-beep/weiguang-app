# tasks 表 · Supabase 初始化与验证

> 第一阶段：仅建表 + RLS + 代码层 CRUD 封装，**不接 Todo UI / localStorage**。

SQL 文件：[supabase/sql/tasks_init.sql](../supabase/sql/tasks_init.sql)

---

## 一、在 Supabase SQL Editor 执行

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard) → 选择微光项目  
2. 左侧 **SQL Editor** → **New query**  
3. 打开仓库 `supabase/sql/tasks_init.sql`，**全选复制**到编辑器  
4. 点击 **Run**（或 Ctrl+Enter）  
5. 底部显示 `Success. No rows returned` 即执行成功  

若表已存在，`CREATE TABLE IF NOT EXISTS` 不会覆盖原表；改结构需另写迁移 SQL。

---

## 二、如何验证表创建成功

### 方式 A：Table Editor（推荐）

1. **Table Editor** → 应出现 **`tasks`** 表  
2. 列应包含：`id`, `user_id`, `title`, `completed`, `task_type`, `priority`, `pomodoro_minutes`, `task_date`, `created_at`, `updated_at`  
3. 表详情 → **RLS** 为 **Enabled**，Policies 4 条：`select/insert/update/delete` own  

### 方式 B：SQL 查询

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tasks'
ORDER BY ordinal_position;
```

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'tasks';
```

应看到 4 条策略。

---

## 三、如何测试 CRUD（代码层）

前提：本地已登录（Magic Link），且 `.env.local` 配置正确。

1. `npm run dev`  
2. 浏览器打开应用并完成登录  
3. 打开开发者工具 Console，粘贴（需支持顶层 await 的浏览器）：

```javascript
const { createTask, listTasks, updateTask, deleteTask } = await import('/lib/supabase/tasks.ts')
// 若路径别名不可用，在任意临时 client 组件里 import 后挂到 window 测试
```

**更稳妥**：在任意 **client 组件** 临时加按钮调用（测完删除），例如：

```typescript
import { createTask, listTasks, updateTask, deleteTask } from "@/lib/supabase/tasks";

// 创建
const created = await createTask({
  title: "测试任务",
  task_date: "2026-05-21",
  task_type: "study",
  priority: "medium",
});
console.log("create", created);

// 列表
const list = await listTasks({ task_date: "2026-05-21" });
console.log("list", list);

// 更新
if (created.data) {
  const updated = await updateTask(created.data.id, { completed: true });
  console.log("update", updated);

  // 删除
  const removed = await deleteTask(created.data.id);
  console.log("delete", removed);
}
```

4. 在 **Table Editor → tasks** 中应能看到测试行出现/更新/消失  

### 未登录时

`createTask` 应返回 `{ data: null, error: "未登录，无法操作云端任务" }`。

### RLS 抽测（可选）

用两个不同邮箱登录两个浏览器，各自 `createTask` 后，在 Table Editor 用 Service Role 能看到两行，但各自客户端 `listTasks` 只能看到自己的行。

---

## 四、与本地 Todo 的字段对照（供后续同步）

| 本地 `TaskItem` | 云端 `tasks` |
|---------------|--------------|
| `text` | `title` |
| `done` | `completed` |
| `date` | `task_date` |
| `category` | `task_type` |
| `priority` | `priority` |
| `pomodoroMinutes` | `pomodoro_minutes` |

本地 `note` 字段云端表暂未包含，同步阶段可扩列或忽略。

---

*微光 · 温柔陪伴你的学习与小目标*
