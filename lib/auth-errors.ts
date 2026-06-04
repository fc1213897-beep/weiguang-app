/** 将 Supabase Auth 英文错误转为更易懂的中文提示 */
export function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "账号或密码不正确，请再试一次";
  }
  if (lower.includes("user already registered")) {
    return "该账号已被注册，请直接登录";
  }
  if (lower.includes("password should be at least")) {
    return "密码至少 6 位";
  }
  if (lower.includes("unable to validate email")) {
    return "账号格式不正确";
  }
  if (lower.includes("email not confirmed")) {
    return "账号尚未激活，请在 Supabase 开启 GOTRUE_MAILER_AUTOCONFIRM=true 后重新注册";
  }
  if (lower.includes("signup is disabled")) {
    return "当前未开放注册，请联系管理员";
  }

  return message;
}
