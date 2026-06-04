"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Toast from "@/components/ui/Toast";
import { Z_MOBILE_TAB } from "@/lib/layout";
import { useUIStore } from "@/store/uiStore";
import type { MobileTabId } from "@/types/ui";

const TABS: { id: MobileTabId; label: string; icon: string }[] = [
  { id: "tasks", label: "任务", icon: "📋" },
  { id: "ledger", label: "记账", icon: "💰" },
  { id: "chat", label: "聊天", icon: "💬" },
  { id: "me", label: "我的", icon: "👤" },
];

/** 手机端底部固定 Tab（Portal 到 body） */
export default function MobileTabNav() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setMobileTab = useUIStore((s) => s.setMobileTab);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleTabChange(tab: MobileTabId) {
    setMobileTab(tab);
    setToast(TABS.find((t) => t.id === tab)?.label ?? "已切换");
    window.setTimeout(() => setToast(""), 1200);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const nav = (
    <>
      {toast ? <Toast message={`已切换到${toast}`} /> : null}
      <nav
        className="fixed bottom-0 left-0 right-0 w-full border-t border-orange-100/80 bg-white/92 shadow-[0_-8px_28px_-14px_rgba(251,146,60,0.25)] backdrop-blur-md lg:hidden"
        style={{
          zIndex: Z_MOBILE_TAB,
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
        aria-label="模块切换"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-stretch">
          {TABS.map((tab) => {
            const isActive = mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={[
                  "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                  "touch-manipulation",
                  isActive
                    ? "font-semibold text-orange-500"
                    : "text-stone-400 active:text-stone-500",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-lg" aria-hidden>
                  {tab.icon}
                </span>
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
