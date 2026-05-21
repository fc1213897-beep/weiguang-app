"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import type { AIChatStorage } from "@/types/chat";
import {
  getNextIdFromMessages,
  useChatStore,
} from "@/store/chatStore";

/** 游客模式：挂载时恢复聊天，变更时写入 localStorage */
export function useChatHydration() {
  const { isAuthenticated, isLoading } = useAuth();
  const messages = useChatStore((s) => s.messages);
  const replyIndex = useChatStore((s) => s.replyIndex);
  const nextId = useChatStore((s) => s.nextId);
  const storageReady = useChatStore((s) => s.storageReady);
  const syncEnabled = useChatStore((s) => s.syncEnabled);
  const hydrate = useChatStore((s) => s.hydrate);
  const setStorageReady = useChatStore((s) => s.setStorageReady);

  const useLocal = !isLoading && !isAuthenticated;

  useEffect(() => {
    if (!useLocal) return;

    const frameId = requestAnimationFrame(() => {
      const saved = loadFromStorage<AIChatStorage | null>(
        STORAGE_KEYS.aiChat,
        null
      );
      if (saved?.messages?.length) {
        hydrate({
          messages: saved.messages,
          replyIndex: saved.replyIndex ?? 0,
          nextId: saved.nextId ?? getNextIdFromMessages(saved.messages),
        });
      }
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [useLocal, hydrate, setStorageReady]);

  useEffect(() => {
    if (!useLocal || !storageReady || syncEnabled) return;
    saveToStorage<AIChatStorage>(STORAGE_KEYS.aiChat, {
      messages,
      replyIndex,
      nextId,
    });
  }, [messages, replyIndex, nextId, storageReady, useLocal, syncEnabled]);
}
