"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

/** 备案期间：账号 + 密码，无需邮箱 */
export default function PasswordAuthForm() {
  const {
    authActionLoading,
    signInWithAccount,
    signUpWithAccount,
    setAuthError,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit() {
    setAuthError(null);
    const ok =
      mode === "login"
        ? await signInWithAccount(username, password)
        : await signUpWithAccount(username, password);
    if (ok) setPassword("");
  }

  return (
    <div className="rounded-2xl border border-orange-100/80 bg-white/70 p-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={[
            "flex-1 rounded-xl py-2 text-xs font-medium transition",
            mode === "login"
              ? "bg-orange-500 text-white"
              : "bg-white text-stone-500 ring-1 ring-orange-100/80",
          ].join(" ")}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={[
            "flex-1 rounded-xl py-2 text-xs font-medium transition",
            mode === "register"
              ? "bg-orange-500 text-white"
              : "bg-white text-stone-500 ring-1 ring-orange-100/80",
          ].join(" ")}
        >
          注册
        </button>
      </div>

      <label className="mt-4 block text-xs font-medium text-stone-600">
        账号
        <input
          type="text"
          autoComplete="username"
          placeholder="3–20 位字母、数字或下划线"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="mt-3 block text-xs font-medium text-stone-600">
        密码
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="至少 6 位"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      <Button
        fullWidth
        className="mt-4 rounded-2xl py-3"
        disabled={authActionLoading}
        onClick={() => void handleSubmit()}
      >
        {authActionLoading
          ? "处理中…"
          : mode === "login"
            ? "登录"
            : "注册并登录"}
      </Button>
    </div>
  );
}
