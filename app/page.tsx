"use client";

import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useChatHydration } from "@/hooks/useChatHydration";
import { useTodoHydration } from "@/hooks/useTodoHydration";

/** 页面入口：仅负责挂载布局与全局持久化 */
export default function Home() {
  useAuth();
  useTodoHydration();
  useChatHydration();

  return <AppShell />;
}
