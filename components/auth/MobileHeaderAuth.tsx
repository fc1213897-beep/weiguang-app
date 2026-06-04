"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";

/** 手机顶栏：登录按钮或账号 chip */
export default function MobileHeaderAuth() {
  const { displayAccount, isLoading, isAuthenticated } = useAuth();
  const setAuthSheetOpen = useUIStore((s) => s.setAuthSheetOpen);

  if (isLoading) {
    return <span className="text-xs text-stone-400">…</span>;
  }

  if (isAuthenticated && displayAccount) {
    return (
      <button
        type="button"
        onClick={() => setAuthSheetOpen(true)}
        className="max-w-[7rem] truncate rounded-full border border-orange-200/80 bg-orange-50/80 px-2.5 py-1.5 text-xs font-medium text-orange-700"
        aria-label={`已登录 ${displayAccount}，打开账号`}
      >
        ✓ {displayAccount}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAuthSheetOpen(true)}
      className="rounded-full border border-orange-200 bg-orange-500 px-3 py-1.5 text-xs font-medium text-white"
    >
      登录
    </button>
  );
}
