"use client";

export default function StudyHeatmap({ values }: { values: number[] }) {
  return (
    <div className="rounded-3xl bg-white/80 p-4">
      <h3 className="text-sm font-semibold text-stone-800">学习热力图</h3>
      <p className="mt-1 text-xs text-stone-500">当前为本地计算占位，后续可接云端历史</p>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {values.map((v, i) => (
          <div
            key={i}
            className="h-7 rounded-md"
            style={{ background: v === 0 ? "#f5f5f4" : v === 1 ? "#fed7aa" : v === 2 ? "#fdba74" : "#fb923c" }}
            title={`强度 ${v}`}
          />
        ))}
      </div>
    </div>
  );
}
