"use client";

import AuthStatusBadge from "@/components/auth/AuthStatusBadge";
import type { DesktopNavId } from "@/types/ui";
import { useUIStore } from "@/store/uiStore";

const NAV_ITEMS: {
  id: DesktopNavId;
  label: string;
  icon: string;
}[] = [
  { id: "today", label: "今日计划", icon: "📋" },
  { id: "tasks", label: "任务管理", icon: "🗂️" },
  { id: "companion", label: "小光陪伴", icon: "🌙" },
  { id: "stats", label: "学习统计", icon: "📊" },
  { id: "settings", label: "设置", icon: "⚙️" },
];

/** 桌面端左侧导航 */
export default function DesktopSidebar() {
  const desktopNav = useUIStore((s) => s.desktopNav);
  const setDesktopNav = useUIStore((s) => s.setDesktopNav);

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-orange-100/60 pr-4">
      <h1 className="px-2 text-xl font-bold text-orange-500">微光 ✨</h1>
      <p className="mt-1 px-2 text-xs text-stone-400">学习工作台</p>

      <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="主菜单">
        {NAV_ITEMS.map((item) => {
          const active = desktopNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setDesktopNav(item.id)}
              className={[
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition",
                active
                  ? "bg-orange-500 font-medium text-white shadow-sm"
                  : "text-stone-600 hover:bg-orange-50/80",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-orange-100/60 px-1 pt-3">
        <AuthStatusBadge
          onOpenLogin={() => setDesktopNav("settings")}
        />
        <p className="mt-2 px-2 pb-2 text-center text-xs text-stone-400">
          陪你熬过备考的每一天
        </p>
      </div>
    </aside>
  );
}
