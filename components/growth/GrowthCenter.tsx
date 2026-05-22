"use client";

import BadgeList from "@/components/growth/BadgeList";
import EnergyCard from "@/components/growth/EnergyCard";

export default function GrowthCenter({ energy, level, stars }: { energy: number; level: number; stars: number }) {
  return (
    <div className="space-y-4">
      <EnergyCard energy={energy} level={level} stars={stars} />
      <BadgeList />
      <div className="rounded-3xl bg-white/80 p-4">
        <h3 className="text-sm font-semibold text-stone-800">本周学习总结</h3>
        <p className="mt-2 text-sm text-stone-600">你正在建立稳定节奏：先做小任务，再进入专注。这个状态非常棒。</p>
      </div>
    </div>
  );
}
