"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import WechatScanLogin from "@/components/auth/WechatScanLogin";
import CountdownLabPanel from "@/components/countdown/CountdownLabPanel";
import { formatAppVersion } from "@/lib/app-version";

/** 我的：账号、备考计划、偏好 */
export default function MeView() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("section") === "exam") {
      document.getElementById("exam")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams]);
  return (
    <div className="min-w-0">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">我的</h2>
        <p className="mt-1 text-sm text-stone-500">账号、备考计划与偏好</p>
      </header>

      <div className="mt-6 space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-stone-700">账号</h3>
          <div className="space-y-4">
            <AuthCard />
            <WechatScanLogin />
          </div>
        </section>

        <section id="exam">
          <CountdownLabPanel />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-stone-700">偏好</h3>
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center text-sm text-stone-400">
            主题、提醒等功能正在规划中
          </div>
        </section>

        <p className="text-center text-xs text-stone-400">{formatAppVersion()}</p>
      </div>
    </div>
  );
}
