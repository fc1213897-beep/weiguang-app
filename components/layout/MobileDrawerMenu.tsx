"use client";

import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import type { MobileTabId } from "@/types/ui";
import { useUIStore } from "@/store/uiStore";

const MENU_ITEMS: { id: MobileTabId; label: string }[] = [
  { id: "tasks", label: "任务" },
  { id: "companion", label: "陪伴" },
  { id: "chat", label: "聊天" },
];

export default function MobileDrawerMenu() {
  const [open, setOpen] = useState(false);
  const setMobileTab = useUIStore((s) => s.setMobileTab);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-orange-100 bg-white px-3 py-2 text-xs font-medium text-stone-600"
      >
        菜单
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] bg-stone-900/25" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">微光菜单</h3>
              <button onClick={() => setOpen(false)} className="text-stone-400">✕</button>
            </div>

            <div className="space-y-2">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMobileTab(item.id);
                    setOpen(false);
                  }}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-left text-sm text-stone-700"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-stone-100 pt-4">
              <AuthCard />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
