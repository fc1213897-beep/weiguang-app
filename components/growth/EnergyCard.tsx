"use client";

export default function EnergyCard({ energy, level, stars }: { energy: number; level: number; stars: number }) {
  return (
    <div className="rounded-3xl bg-white/80 p-4">
      <h3 className="text-sm font-semibold text-stone-800">成长能量</h3>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div><p className="text-xs text-stone-500">陪伴等级</p><p className="mt-1 font-semibold text-orange-600">Lv.{level}</p></div>
        <div><p className="text-xs text-stone-500">今日能量</p><p className="mt-1 font-semibold text-emerald-600">{energy}</p></div>
        <div><p className="text-xs text-stone-500">学习星星</p><p className="mt-1 font-semibold text-amber-600">⭐ {stars}</p></div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-orange-400" style={{ width: `${Math.min(100, energy)}%` }} /></div>
    </div>
  );
}
