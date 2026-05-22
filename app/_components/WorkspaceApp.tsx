"use client";

import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useChatHydration } from "@/hooks/useChatHydration";
import { useChatSync } from "@/hooks/useChatSync";
import { useTodoHydration } from "@/hooks/useTodoHydration";
import { useTodoSync } from "@/hooks/useTodoSync";

type Props = { route: "home" | "today" | "tasks" | "chat" | "stats" | "settings" };

export default function WorkspaceApp({ route }: Props) {
  useAuth();
  useTodoHydration();
  useTodoSync();
  useChatHydration();
  useChatSync();

  return <AppShell route={route} />;
}
