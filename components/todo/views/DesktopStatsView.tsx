"use client";

import StatsDashboard from "@/components/stats/StatsDashboard";

/** 桌面端：学习统计 */
export default function DesktopStatsView() {
  return (
    <div className="min-w-0">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">成长统计</h2>
        <p className="mt-1 text-sm text-stone-500">学习进度与本月收支，一起看见积累</p>
      </header>

      <div className="mt-5"><StatsDashboard /></div>
    </div>
  );
}
