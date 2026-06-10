"use client";

import { useEffect } from "react";
import { useCountdownStore } from "@/store/countdownStore";

/** 挂载时恢复倒计时配置，变更时写入 localStorage */
export function useCountdownHydration() {
  const storageReady = useCountdownStore((s) => s.storageReady);
  const hydrate = useCountdownStore((s) => s.hydrate);
  const persist = useCountdownStore((s) => s.persist);
  const settings = useCountdownStore((s) => s.settings);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      hydrate();
    });
    return () => cancelAnimationFrame(frameId);
  }, [hydrate]);

  useEffect(() => {
    if (!storageReady) return;
    persist();
  }, [settings, storageReady, persist]);
}
