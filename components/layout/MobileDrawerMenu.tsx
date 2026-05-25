"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import type { MobileTabId } from "@/types/ui";
import { useUIStore } from "@/store/uiStore";

const MENU_ITEMS: { id: MobileTabId; label: string }[] = [
  { id: "tasks", label: "任务" },
  { id: "companion", label: "陪伴" },
  { id: "chat", label: "聊天" },
];

const PAGE_LINKS = [
  { href: "/home", label: "成长空间", icon: "🏠" },
  { href: "/journey", label: "微光旅程", icon: "🗺️" },
  { href: "/today", label: "Today", icon: "📋" },
  { href: "/stats", label: "成长统计", icon: "📊" },
];

export default function MobileDrawerMenu() {
  const [open, setOpen] = useState(false);
  const setMobileTab = useUIStore((s) => s.setMobileTab);
  const pathname = usePathname();

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
        <div
          className="fixed inset-0 z-[90] bg-stone-900/25"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">微光菜单</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-stone-400"
              >
                ✕
              </button>
            </div>

            <p className="mb-2 text-xs text-stone-400">页面</p>
            <div className="space-y-2">
              {PAGE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                    pathname === item.href
                      ? "border-orange-200 bg-orange-50 text-orange-800"
                      : "border-stone-200 text-stone-700",
                  ].join(" ")}
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            <p className="mb-2 mt-4 text-xs text-stone-400">模块</p>
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
