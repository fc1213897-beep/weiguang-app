"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/** 账号登录卡片：Magic Link，用于设置页或手机折叠区 */
export default function AuthCard() {
  const {
    status,
    email,
    emailSent,
    authError,
    authActionLoading,
    isAuthenticated,
    isLoading,
    signInWithMagicLink,
    signOut,
    resetEmailSent,
  } = useAuth();

  const [inputEmail, setInputEmail] = useState("");

  async function handleSendLink() {
    await signInWithMagicLink(inputEmail);
  }

  return (
    <section className="rounded-2xl border border-orange-100/80 bg-gradient-to-b from-white to-orange-50/40 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-stone-800">账号与同步</h3>
      <p className="mt-1 text-xs text-stone-500">
        登录后可在手机与电脑同步学习计划（云端同步即将上线）
      </p>

      {isLoading && (
        <p className="mt-4 text-sm text-stone-500">正在检查登录状态…</p>
      )}

      {!isLoading && isAuthenticated && email && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-orange-50/80 px-3 py-2.5 text-sm text-stone-700">
            <span className="text-stone-500">已登录 · </span>
            <span className="font-medium break-all">{email}</span>
          </div>
          <Button
            variant="soft"
            fullWidth
            disabled={authActionLoading}
            onClick={() => signOut()}
          >
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

          {emailSent ? (
            <div className="space-y-2">
              <p className="rounded-xl bg-green-50/90 px-3 py-2.5 text-sm text-green-800">
                登录链接已发送到邮箱，请查收邮件（含垃圾箱）并点击链接完成登录。
              </p>
              <button
                type="button"
                className="w-full text-center text-xs text-orange-600 hover:underline"
                onClick={() => resetEmailSent()}
              >
                使用其他邮箱
              </button>
            </div>
          ) : (
            <>
              <label className="block text-xs font-medium text-stone-600">
                邮箱
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <Button
                fullWidth
                disabled={authActionLoading}
                onClick={handleSendLink}
              >
                {authActionLoading ? "发送中…" : "发送 Magic Link 登录链接"}
              </Button>
            </>
          )}
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
