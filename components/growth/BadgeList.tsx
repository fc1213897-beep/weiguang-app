"use client";

const BADGES = ["连续起步", "专注新星", "温柔坚持"];

export default function BadgeList() {
  return (
    <div className="rounded-3xl bg-white/80 p-4">
      <h3 className="text-sm font-semibold text-stone-800">最近获得的鼓励徽章</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {BADGES.map((b) => (
          <span key={b} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">🏅 {b}</span>
        ))}
      </div>
    </div>
  );
}
