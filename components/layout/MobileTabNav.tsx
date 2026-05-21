"use client";

import { useUIStore } from "@/store/uiStore";

const TABS = [
  { id: "tasks" as const, label: "今日任务", icon: "📋" },
  { id: "companion" as const, label: "小光陪伴", icon: "🌙" },
];

export default function MobileTabNav() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setMobileTab = useUIStore((s) => s.setMobileTab);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-100/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_-8px_rgba(251,146,60,0.15)] backdrop-blur-md lg:hidden"
      aria-label="模块切换"
    >
      <div className="mx-auto flex max-w-6xl">
        {TABS.map((tab) => {
          const isActive = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              className={[
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors",
                isActive
                  ? "font-semibold text-orange-500"
                  : "text-gray-400 hover:text-gray-500",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-lg" aria-hidden>
                {tab.icon}
              </span>
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
