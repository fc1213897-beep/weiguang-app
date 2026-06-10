"use client";

import AppShell from "@/components/layout/AppShell";
import type { AppRouteId } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useChatHydration } from "@/hooks/useChatHydration";
import { useChatSync } from "@/hooks/useChatSync";
import { useCountdownHydration } from "@/hooks/useCountdownHydration";
import { useTodoHydration } from "@/hooks/useTodoHydration";
import { useTodoSync } from "@/hooks/useTodoSync";

type Props = {
  route: AppRouteId;
};

export default function WorkspaceApp({ route }: Props) {
  useAuth();
  useTodoHydration();
  useTodoSync();
  useCountdownHydration();
  useChatHydration();
  useChatSync();

  return <AppShell route={route} />;
}
