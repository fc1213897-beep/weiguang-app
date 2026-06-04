"use client";

import Link from "next/link";
import AuthStatusBadge from "@/components/auth/AuthStatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

const LINKS = [
  { href: "/ledger", label: "记账本", icon: "💰" },
  { href: "/stats", label: "成长统计", icon: "📊" },
  { href: "/home", label: "成长空间", icon: "🏠" },
  { href: "/journey", label: "微光旅程", icon: "🗺️" },
  { href: "/settings", label: "账号与设置", icon: "⚙️" },
] as const;

/** 手机端：我的 Tab */
export default function MobileMeView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setAuthSheetOpen = useUIStore((s) => s.setAuthSheetOpen);
  const { isAuthenticated, authActionLoading, signOut } = useAuth();

  if (mobileTab !== "me") return null;

  return (
    <div className={[panelClass, "min-w-0 space-y-3"].join(" ")}>
      <header className="border-b border-orange-100/60 pb-2">
        <h2 className="text-lg font-bold text-stone-800">我的</h2>
      </header>

      <div className="rounded-xl border border-orange-100/80 bg-orange-50/30 px-3 py-3">
        <AuthStatusBadge onOpenLogin={() => setAuthSheetOpen(true)} />
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => setAuthSheetOpen(true)}
            className="mt-2 w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white"
          >
            登录 / 注册
          </button>
        )}
        {isAuthenticated && (
          <Button
            variant="soft"
            fullWidth
            className="mt-2"
            disabled={authActionLoading}
            onClick={() => signOut()}
          >
            {authActionLoading ? "退出中…" : "退出登录"}
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-lg border border-stone-200/70 bg-white px-3 py-2.5 text-sm text-stone-700 active:bg-stone-50"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </span>
            <span className="text-stone-400">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
