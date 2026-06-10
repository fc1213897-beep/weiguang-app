"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Z_MOBILE_TAB } from "@/lib/layout";
import { useUIStore } from "@/store/uiStore";
import type { MobileTabId } from "@/types/ui";

const TAB_HREF: Record<MobileTabId, string> = {
  tasks: "/today",
  chat: "/chat",
  me: "/me",
};

const PATH_TO_TAB: Record<string, MobileTabId> = {
  "/today": "tasks",
  "/tasks": "tasks",
  "/chat": "chat",
  "/me": "me",
  "/settings": "me",
};

const TABS: { id: MobileTabId; label: string; icon: string }[] = [
  { id: "tasks", label: "今日任务", icon: "📋" },
  { id: "chat", label: "小光", icon: "💬" },
  { id: "me", label: "我的", icon: "👤" },
];

/** 手机端底部固定 Tab（Portal 到 body） */
export default function MobileTabNav() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setMobileTab = useUIStore((s) => s.setMobileTab);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** 地址栏与 Tab 同步，保证打开页面落在正确 Tab */
  useEffect(() => {
    const tab = PATH_TO_TAB[pathname];
    if (tab) setMobileTab(tab);
  }, [pathname, setMobileTab]);

  function handleTabChange(tab: MobileTabId) {
    setMobileTab(tab);
    router.push(TAB_HREF[tab]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const nav = (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 w-full border-t border-orange-100/80 bg-white/95 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)] lg:hidden"
        style={{
          zIndex: Z_MOBILE_TAB,
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
        aria-label="模块切换"
      >
        <div className="mx-auto flex h-12 max-w-6xl items-stretch">
          {TABS.map((tab) => {
            const routeTab = PATH_TO_TAB[pathname];
            const isActive = routeTab ? routeTab === tab.id : mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={[
                  "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                  "touch-manipulation",
                  isActive
                    ? "font-semibold text-orange-600"
                    : "text-stone-400 active:text-stone-500",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-base" aria-hidden>
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
