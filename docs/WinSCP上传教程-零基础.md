# WinSCP 上传文件到服务器（零基础）

GitHub 拉不动时，用本教程把电脑上的文件传到腾讯云服务器。

本次只需上传 **1 个文件** 修复登录：

| 你电脑上的文件 | 服务器上的位置 |
|----------------|----------------|
| `D:\Learn\weiguang-app\lib\wx-auth-server.ts` | `/root/weiguang-app/lib/wx-auth-server.ts` |

---

## 第一步：安装 WinSCP

1. 浏览器打开：https://winscp.net/eng/download.php  
2. 下载 **Installation package** 并安装（一路「下一步」即可）。

---

## 第二步：连接服务器

1. 打开 WinSCP，弹出「登录」窗口。  
2. 按下面填写（和你 SSH 登录服务器时一样）：

| 项 | 填什么 |
|----|--------|
| 文件协议 | **SFTP** |
| 主机名 | 服务器 **公网 IP**（腾讯云控制台 → 云服务器 → 实例里能看到；域名有时也行） |
| 端口号 | **22** |
| 用户名 | **root**（你终端里是 `root@VM-0-2-ubuntu` 就用 root） |
| 密码 | 买服务器时设的密码，或腾讯云重置后的密码 |

3. 点 **保存**（下次不用重填），再点 **登录**。  
4. 第一次会问「是否信任主机」，点 **是**。

连上后界面分左右两栏：

- **左边** = 你的 Windows 电脑  
- **右边** = 服务器

---

## 第三步：找到两边目录

### 右边（服务器）

1. 在地址栏输入：`/root/weiguang-app/lib` 回车。  
2. 应能看到 `wx-auth-server.ts` 等文件（没有 `lib` 文件夹就先打开 `/root/weiguang-app` 看结构）。

### 左边（电脑）

1. 地址栏输入：`D:\Learn\weiguang-app\lib` 回车。  
2. 找到 **`wx-auth-server.ts`**。

---

## 第四步：上传（拖拽）

1. 用鼠标把左边的 **`wx-auth-server.ts`** 拖到右边同一目录。  
2. 提示「是否覆盖」→ 选 **覆盖** / **是**。  
3. 下方传输完成，没有红色失败即可。

---

## 第五步：在服务器上重启服务

用 **PuTTY**、**腾讯云网页终端** 或 WinSCP 菜单 **命令** → **在 PuTTY 中打开终端**，执行：

```bash
cd ~/weiguang-app
npm run build
pm2 restart weiguang-app
```

没有报错就成功了。

---

## 第六步：小程序再试

1. 微信开发者工具 → **调试器 → Storage** → 删除 `wg_session`。  
2. **编译** 重新打开小程序。  
3. 看顶部红条是否消失。

---

## 常见问题

### 连不上 / 超时

- 检查腾讯云 **安全组** 是否放行 **22** 端口。  
- 主机名用 **公网 IP**，不要用内网 IP。

### 右边没有 weiguang-app

说明项目不在 `/root/weiguang-app`，在服务器执行 `find / -name wx-auth-server.ts 2>/dev/null` 找真实路径。

### 不想装 WinSCP

在 **Windows PowerShell**（需能 SSH 登录）执行，把 `你的IP` 换成公网 IP：

```powershell
scp "D:\Learn\weiguang-app\lib\wx-auth-server.ts" root@你的IP:/root/weiguang-app/lib/
```

输入 root 密码后开始上传。

---

## 上传完成后可选：Supabase 清测试用户

SQL Editor 执行：

```sql
DELETE FROM auth.users WHERE email LIKE 'wx.%@weiguang.internal';
```
