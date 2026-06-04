"use client";

import { useAuth } from "@/hooks/useAuth";

type Props = {
  onOpenLogin?: () => void;
  className?: string;
};

/** 紧凑登录状态：游客模式 / 邮箱 */
export default function AuthStatusBadge({ onOpenLogin, className = "" }: Props) {
  const { displayAccount, isLoading } = useAuth();

  let label = "游客模式";
  if (isLoading) label = "…";
  else if (displayAccount) label = displayAccount;

  const content = (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1.5 truncate text-xs",
        displayAccount ? "text-orange-600" : "text-stone-500",
        className,
      ].join(" ")}
      title={displayAccount ?? "未登录，数据仅保存在本机"}
    >
      <span aria-hidden>{displayAccount ? "✓" : "○"}</span>
      <span className="truncate">{label}</span>
    </span>
  );

  if (!onOpenLogin) return content;

  return (
    <button
      type="button"
      onClick={onOpenLogin}
      className="w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-orange-50/80"
      aria-label={displayAccount ? `已登录 ${displayAccount}，打开账号设置` : "游客模式，打开登录"}
    >
      {content}
    </button>
  );
}
