"use client";

import JourneyView from "@/components/journey/JourneyView";
import DesktopStatsView from "@/components/todo/views/DesktopStatsView";
import HomeDashboardView from "@/components/todo/views/HomeDashboardView";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type GrowthTab = "overview" | "journey" | "stats";

const TABS: { id: GrowthTab; label: string }[] = [
  { id: "overview", label: "概览" },
  { id: "journey", label: "旅程" },
  { id: "stats", label: "统计" },
];

function normalizeTab(raw: string | null): GrowthTab {
  if (raw === "journey" || raw === "stats") return raw;
  return "overview";
}

/** 成长聚合页：概览 / 旅程 / 统计 */
export default function GrowthHubView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = normalizeTab(searchParams.get("tab"));

  const setTab = useCallback(
    (next: GrowthTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "overview") params.delete("tab");
      else params.set("tab", next);
      const q = params.toString();
      router.replace(q ? `/growth?${q}` : "/growth");
    },
    [router, searchParams]
  );

  return (
    <div className="min-w-0">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">成长</h2>
        <p className="mt-1 text-sm text-stone-500">看看自己慢慢亮起来的路</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                "rounded-full px-4 py-1.5 text-sm transition",
                tab === t.id
                  ? "bg-indigo-100 font-medium text-indigo-800"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200/80",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-5">
        {tab === "overview" && <HomeDashboardView />}
        {tab === "journey" && <JourneyView />}
        {tab === "stats" && <DesktopStatsView />}
      </div>
    </div>
  );
}
