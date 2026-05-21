"use client";

import { useEffect } from "react";
import {
  getOrCreateDefaultSession,
  listSessionMessages,
} from "@/lib/supabase/chat";
import {
  computeNextIdFromMessages,
  messageRowsToChatMessages,
} from "@/lib/chat-cloud-map";
import { useAuth } from "@/hooks/useAuth";
import { INITIAL_MESSAGES, useChatStore } from "@/store/chatStore";

/**
 * 已登录：默认会话 + 拉取 messages
 * 未登录：由 useChatHydration 负责 localStorage
 */
export function useChatSync() {
  const { isAuthenticated, isLoading } = useAuth();
  const setSyncEnabled = useChatStore((s) => s.setSyncEnabled);
  const setCloudSessionId = useChatStore((s) => s.setCloudSessionId);
  const hydrate = useChatStore((s) => s.hydrate);
  const setStorageReady = useChatStore((s) => s.setStorageReady);

  useEffect(() => {
    if (isLoading) return;
    setSyncEnabled(isAuthenticated);
    if (!isAuthenticated) {
      setCloudSessionId(null);
      setStorageReady(false);
    }
  }, [isAuthenticated, isLoading, setSyncEnabled, setCloudSessionId, setStorageReady]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let cancelled = false;

    void (async () => {
      const sessionRes = await getOrCreateDefaultSession();
      if (cancelled) return;

      if (sessionRes.error || !sessionRes.data) {
        console.error("[chat sync] session", sessionRes.error);
        setStorageReady(true);
        return;
      }

      const session = sessionRes.data;
      setCloudSessionId(session.id);

      const msgRes = await listSessionMessages(session.id);
      if (cancelled) return;

      if (msgRes.error) {
        console.error("[chat sync] listMessages", msgRes.error);
        setStorageReady(true);
        return;
      }

      const rows = msgRes.data ?? [];
      const messages =
        rows.length > 0
          ? messageRowsToChatMessages(rows)
          : INITIAL_MESSAGES;

      hydrate({
        messages,
        replyIndex: session.reply_index ?? 0,
        nextId: computeNextIdFromMessages(messages),
      });
      setStorageReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    isLoading,
    hydrate,
    setCloudSessionId,
    setStorageReady,
  ]);
}
