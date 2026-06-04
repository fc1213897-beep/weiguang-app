"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const PAGE_LINKS = [
  { href: "/home", label: "成长空间", icon: "🏠" },
  { href: "/journey", label: "微光旅程", icon: "🗺️" },
  { href: "/today", label: "Today", icon: "📋" },
  { href: "/stats", label: "成长统计", icon: "📊" },
  { href: "/settings", label: "账号与设置", icon: "⚙️" },
];

/** 手机端：侧滑菜单（二级页面入口） */
export default function MobileDrawerMenu() {
  const [open, setOpen] = useState(false);
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

            <p className="mb-2 text-xs text-stone-400">更多页面</p>
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

            <p className="mt-5 text-xs leading-relaxed text-stone-400">
              任务、记账、聊天、我的请使用底部 Tab 切换
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
