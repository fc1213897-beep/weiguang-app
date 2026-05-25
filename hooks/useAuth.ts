"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

export type AuthStatus = "loading" | "guest" | "authenticated";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  emailSent: boolean;
  authError: string | null;
  authActionLoading: boolean;
  setFromSession: (session: Session | null) => void;
  setEmailSent: (sent: boolean) => void;
  setAuthError: (msg: string | null) => void;
  setAuthActionLoading: (loading: boolean) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  session: null,
  emailSent: false,
  authError: null,
  authActionLoading: false,
  setFromSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session?.user ? "authenticated" : "guest",
    }),
  setEmailSent: (emailSent) => set({ emailSent }),
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
      useAuthStore.getState().setEmailSent(false);
      useAuthStore.getState().setAuthError(null);
    }
  });
}

function getAuthRedirectUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

/**
 * 微光登录：Magic Link + Session 状态
 * 不接 Todo / Chat 云同步
 */
export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const emailSent = useAuthStore((s) => s.emailSent);
  const authError = useAuthStore((s) => s.authError);
  const authActionLoading = useAuthStore((s) => s.authActionLoading);
  const setEmailSent = useAuthStore((s) => s.setEmailSent);
  const setAuthError = useAuthStore((s) => s.setAuthError);
  const setAuthActionLoading = useAuthStore((s) => s.setAuthActionLoading);

  useEffect(() => {
    startAuthListener();
  }, []);

  async function signInWithMagicLink(email: string) {
    const trimmed = email.trim();
    if (!trimmed) {
      setAuthError("请输入邮箱");
      return false;
    }

    setAuthActionLoading(true);
    setAuthError(null);
    setEmailSent(false);

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    setAuthActionLoading(false);

    if (error) {
      setAuthError(error.message);
      return false;
    }

    setEmailSent(true);
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

    setEmailSent(false);
    return true;
  }

  const email = user?.email ?? null;

  return {
    status,
    user,
    session,
    email,
    emailSent,
    authError,
    authActionLoading,
    isGuest: status === "guest",
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signInWithMagicLink,
    signOut,
    resetEmailSent: () => setEmailSent(false),
    setAuthError,
  };
}
