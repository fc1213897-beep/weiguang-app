"use client";

type Point = { day: string; completed: number };

export default function WeeklyTrend({ points }: { points: Point[] }) {
  const max = Math.max(1, ...points.map((p) => p.completed));
  return (
    <div className="rounded-3xl bg-white/80 p-4">
      <h3 className="text-sm font-semibold text-stone-800">最近 7 天学习趋势</h3>
      <div className="mt-4 flex items-end gap-2">
        {points.map((p) => (
          <div key={p.day} className="flex flex-1 flex-col items-center gap-1">
            <div className="h-28 w-full rounded-xl bg-stone-50 p-1">
              <div className="w-full rounded-lg bg-orange-300" style={{ height: `${Math.max(8, (p.completed / max) * 100)}%`, marginTop: "auto" }} />
            </div>
            <p className="text-[10px] text-stone-500">{p.day}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
