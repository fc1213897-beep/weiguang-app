"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import WebScanLogin from "@/components/auth/WebScanLogin";
import WechatScanLogin from "@/components/auth/WechatScanLogin";

/** 账号登录：网页扫码（手机+电脑）或邮箱 Magic Link */
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
    setAuthError,
  } = useAuth();

  const [inputEmail, setInputEmail] = useState("");
  const [showWxMp, setShowWxMp] = useState(false);

  return (
    <section className="rounded-2xl border border-orange-100/80 bg-gradient-to-b from-white to-orange-50/40 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-stone-800">账号与同步</h3>
      <p className="mt-1 text-xs text-stone-500">
        登录后可在手机与电脑使用同一账号（任务云同步逐步开放）
      </p>

      {isLoading && <p className="mt-4 text-sm text-stone-500">正在检查登录状态…</p>}

      {!isLoading && isAuthenticated && email && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-orange-50/80 px-3 py-2.5 text-sm text-stone-700">
            <span className="text-stone-500">已登录 · </span>
            <span className="font-medium break-all">{email}</span>
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

          <WebScanLogin onError={setAuthError} onSuccess={() => setAuthError(null)} />

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200" />
            </div>
            <p className="relative mx-auto w-fit bg-white/80 px-2 text-xs text-stone-400">
              或使用邮箱（手机/电脑均可）
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-2">
              <p className="rounded-xl bg-green-50/90 px-3 py-2.5 text-sm text-green-800">
                登录链接已发送到邮箱。在手机或电脑邮箱里点开链接即可完成登录。
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
                onClick={() => signInWithMagicLink(inputEmail)}
              >
                {authActionLoading ? "发送中…" : "发送邮箱登录链接"}
              </Button>
            </>
          )}

          <button
            type="button"
            className="w-full text-center text-xs text-stone-400 hover:text-stone-600"
            onClick={() => setShowWxMp((v) => !v)}
          >
            {showWxMp ? "收起微信小程序登录" : "展开微信小程序登录（可选）"}
          </button>
          {showWxMp && (
            <WechatScanLogin
              onError={setAuthError}
              onSuccess={() => setAuthError(null)}
            />
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
