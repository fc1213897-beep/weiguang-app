"use client";

import AuthCard from "@/components/auth/AuthCard";
import CountdownLabPanel from "@/components/countdown/CountdownLabPanel";

/** 桌面端：设置（含账号登录 + 备考倒计时） */
export default function SettingsPlaceholder() {
  return (
    <div className="min-w-0">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">设置</h2>
        <p className="mt-1 text-sm text-stone-500">账号、备考计划与偏好</p>
      </header>

      <div className="mt-6 space-y-6">
        <AuthCard />

        <CountdownLabPanel />

        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center text-sm text-stone-400">
          主题、提醒等功能正在规划中 🌙
        </div>
      </div>
    </div>
  );
}
