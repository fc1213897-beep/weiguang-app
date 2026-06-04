"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import {
  formatDisplayAccount,
  usernameToAuthEmail,
  validateUsername,
} from "@/lib/account-auth";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { getSupabaseClient } from "@/lib/supabase/client";

export type AuthStatus = "loading" | "guest" | "authenticated";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  authError: string | null;
  authActionLoading: boolean;
  setFromSession: (session: Session | null) => void;
  setAuthError: (msg: string | null) => void;
  setAuthActionLoading: (loading: boolean) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  session: null,
  authError: null,
  authActionLoading: false,
  setFromSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session?.user ? "authenticated" : "guest",
    }),
  setAuthError: (authError) => set({ authError }),
  setAuthActionLoading: (authActionLoading) => set({ authActionLoading }),
}));

let listenerStarted = false;

/** 全局只注册一次 Supabase Auth 监听 */
function startAuthListener() {
  if (listenerStarted || typeof window === "undefined") return;
  listenerStarted = true;

  const supabase = getSupabaseClient();
  const { setFromSession } = useAuthStore.getState();

  void (async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setFromSession(null);
      useAuthStore.getState().setAuthError(error.message);
      return;
    }
    setFromSession(data.session);
  })();

  supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
    setFromSession(session);
    if (session) {
      useAuthStore.getState().setAuthError(null);
    }
  });
}

/**
 * 微光登录：账号 + 密码（临时主方案，不依赖邮箱与备案）
 */
export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const authError = useAuthStore((s) => s.authError);
  const authActionLoading = useAuthStore((s) => s.authActionLoading);
  const setAuthError = useAuthStore((s) => s.setAuthError);
  const setAuthActionLoading = useAuthStore((s) => s.setAuthActionLoading);

  useEffect(() => {
    startAuthListener();
  }, []);

  async function signInWithAccount(username: string, password: string) {
    const nameError = validateUsername(username);
    if (nameError) {
      setAuthError(nameError);
      return false;
    }
    if (!password) {
      setAuthError("请输入密码");
      return false;
    }

    setAuthActionLoading(true);
    setAuthError(null);

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToAuthEmail(username),
      password,
    });

    setAuthActionLoading(false);

    if (error) {
      setAuthError(mapAuthErrorMessage(error.message));
      return false;
    }

    return true;
  }

  async function signUpWithAccount(username: string, password: string) {
    const nameError = validateUsername(username);
    if (nameError) {
      setAuthError(nameError);
      return false;
    }
    if (password.length < 6) {
      setAuthError("密码至少 6 位");
      return false;
    }

    setAuthActionLoading(true);
    setAuthError(null);

    const normalized = username.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normalized, password }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setAuthActionLoading(false);
        setAuthError(payload.error ?? "注册失败");
        return false;
      }
    } catch {
      setAuthActionLoading(false);
      setAuthError("网络错误，请稍后重试");
      return false;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToAuthEmail(normalized),
      password,
    });

    setAuthActionLoading(false);

    if (error) {
      setAuthError(mapAuthErrorMessage(error.message));
      return false;
    }

    return true;
  }

  async function signOut() {
    setAuthActionLoading(true);
    setAuthError(null);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    setAuthActionLoading(false);

    if (error) {
      setAuthError(error.message);
      return false;
    }

    return true;
  }

  const displayAccount = formatDisplayAccount(user);

  return {
    status,
    user,
    session,
    displayAccount,
    authError,
    authActionLoading,
    isGuest: status === "guest",
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signInWithAccount,
    signUpWithAccount,
    signOut,
    setAuthError,
  };
}
