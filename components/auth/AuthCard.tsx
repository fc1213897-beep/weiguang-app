"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import PasswordAuthForm from "@/components/auth/PasswordAuthForm";

/** 账号登录：账号 + 密码（临时主方案） */
export default function AuthCard() {
  const {
    displayAccount,
    authError,
    authActionLoading,
    isAuthenticated,
    isLoading,
    signOut,
  } = useAuth();

  return (
    <section className="rounded-2xl border border-orange-100/80 bg-gradient-to-b from-white to-orange-50/40 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-stone-800">账号与同步</h3>
      <p className="mt-1 text-xs text-stone-500">
        注册账号后可在不同设备登录，同步学习计划
      </p>

      {isLoading && <p className="mt-4 text-sm text-stone-500">正在检查登录状态…</p>}

      {!isLoading && isAuthenticated && displayAccount && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-orange-50/80 px-3 py-2.5 text-sm text-stone-700">
            <span className="text-stone-500">已登录 · </span>
            <span className="font-medium">{displayAccount}</span>
          </div>
          <Button variant="soft" fullWidth disabled={authActionLoading} onClick={() => signOut()}>
            {authActionLoading ? "退出中…" : "退出登录"}
          </Button>
        </div>
      )}

      {!isLoading && !isAuthenticated && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-dashed border-orange-200/80 bg-white/60 px-3 py-2 text-sm text-stone-600">
            当前为 <span className="font-medium text-orange-600">游客模式</span>
            ，数据仅保存在本浏览器
          </div>

          <PasswordAuthForm />
        </div>
      )}

      {authError && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {authError}
        </p>
      )}
    </section>
  );
}
