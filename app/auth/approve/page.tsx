"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";

function ApproveContent() {
  const params = useSearchParams();
  const scene = params.get("scene")?.trim() ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!scene) {
      setError("链接无效，请回到电脑重新扫码");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/web/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "确认失败");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "确认失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-800">确认登录到电脑</h1>
        <p className="mt-2 text-sm text-stone-500">
          你正在授权电脑版微光完成登录，请确认是你本人操作。
        </p>

        {!scene && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
            缺少登录凭证，请在电脑上重新获取二维码后再扫。
          </p>
        )}

        {done ? (
          <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
            已确认，请回到电脑浏览器查看登录状态。
          </p>
        ) : (
          <Button
            className="mt-6"
            fullWidth
            disabled={!scene || loading}
            onClick={() => void handleConfirm()}
          >
            {loading ? "确认中…" : "确认登录"}
          </Button>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default function ApprovePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-stone-500">
          加载中…
        </main>
      }
    >
      <ApproveContent />
    </Suspense>
  );
}
