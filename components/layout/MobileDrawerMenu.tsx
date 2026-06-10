"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** 侧滑菜单：仅保留成长、记账（其余在「我的」Tab） */
const PAGE_LINKS = [
  { href: "/growth", label: "成长", icon: "🌱" },
  { href: "/ledger", label: "记账本", icon: "💰" },
];

/** 手机端：侧滑菜单（二级页面） */
export default function MobileDrawerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-600"
      >
        菜单
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] bg-stone-900/25"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 h-full w-[78%] max-w-xs bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">菜单</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-stone-400">
                ✕
              </button>
            </div>

            <div className="space-y-1">
              {PAGE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                    pathname === item.href || pathname.startsWith(item.href + "?")
                      ? "bg-orange-50 font-medium text-orange-800"
                      : "text-stone-700 active:bg-stone-50",
                  ].join(" ")}
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
