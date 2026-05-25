"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { WxExchangeResponse, WxLoginSessionRow, WxQrcodeResponse } from "@/types/wx-login";

const POLL_MS = 2000;
const MAX_POLLS = 150;

type Phase = "idle" | "loading" | "polling" | "exchanging" | "done" | "error";

type Props = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export default function WechatScanLogin({ onSuccess, onError }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scene, setScene] = useState("");
  const [qrcode, setQrcode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [devMeta, setDevMeta] = useState<WxQrcodeResponse["debug"] | null>(null);
  const [message, setMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);
  const exchanging = useRef(false);

  const stopPoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    pollCount.current = 0;
  }, []);

  const fail = useCallback(
    (msg: string) => {
      setPhase("error");
      setMessage(msg);
      onError?.(msg);
      stopPoll();
    },
    [onError, stopPoll]
  );

  const exchange = useCallback(
    async (s: string) => {
      if (exchanging.current) return;
      exchanging.current = true;
      setPhase("exchanging");
      setMessage("正在完成登录…");
      try {
        const res = await fetch("/api/auth/wx/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scene: s }),
        });
        const data = (await res.json()) as WxExchangeResponse & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "登录兑换失败");

        const { error } = await getSupabaseClient().auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        if (error) throw new Error(error.message);

        stopPoll();
        setPhase("done");
        setMessage("微信登录成功");
        onSuccess?.();
      } catch (e) {
        exchanging.current = false;
        fail(e instanceof Error ? e.message : "登录失败");
      }
    },
    [fail, onSuccess, stopPoll]
  );

  const poll = useCallback(
    async (s: string) => {
      if (++pollCount.current > MAX_POLLS) {
        fail("扫码超时，请重新获取二维码");
        return;
      }

      const { data, error } = await getSupabaseClient()
        .from("wx_login_sessions")
        .select("openid, status, expires_at")
        .eq("scene", s)
        .maybeSingle();

      if (error) return fail(error.message);

      const row = data as Pick<WxLoginSessionRow, "openid" | "status" | "expires_at"> | null;
      if (!row) return fail("登录会话不存在");
      if (new Date(row.expires_at).getTime() < Date.now()) return fail("二维码已过期，请刷新");
      if (row.status === "consumed") return fail("该二维码已使用，请重新获取");
      if (row.status === "completed" && row.openid) return exchange(s);

      setMessage("请用微信扫上方小程序码，并在小程序中点「允许登录」");
    },
    [exchange, fail]
  );

  const start = useCallback(async () => {
    stopPoll();
    exchanging.current = false;
    setPhase("loading");
    setMessage("正在生成小程序码…");
    setScene("");
    setQrcode("");
    setDevMeta(null);

    try {
      const res = await fetch("/api/auth/wx/qrcode", { method: "POST" });
      const data = (await res.json()) as WxQrcodeResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "生成二维码失败");

      setScene(data.scene);
      setQrcode(data.qrcode);
      setExpiresAt(data.expiresAt);
      setDevMeta(data.debug ?? null);
      setPhase("polling");
      setMessage("请用微信扫上方小程序码");

      void poll(data.scene);
      pollRef.current = setInterval(() => void poll(data.scene), POLL_MS);
    } catch (e) {
      fail(e instanceof Error ? e.message : "生成二维码失败");
    }
  }, [fail, poll, stopPoll]);

  const reset = useCallback(() => {
    stopPoll();
    exchanging.current = false;
    setPhase("idle");
    setScene("");
    setQrcode("");
    setExpiresAt("");
    setDevMeta(null);
    setMessage("");
  }, [stopPoll]);

  useEffect(() => () => stopPoll(), [stopPoll]);

  const busy = phase === "loading" || phase === "polling" || phase === "exchanging";
  const showQr = qrcode && (phase === "polling" || phase === "exchanging");

  return (
    <div className="rounded-2xl border border-emerald-100/90 bg-gradient-to-b from-emerald-50/50 to-white p-4">
      <p className="text-sm font-semibold text-stone-800">微信扫码登录</p>
      <p className="mt-1 text-xs text-stone-500">手机扫码并在小程序确认后，电脑自动登录</p>

      {showQr && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrcode} alt="小程序码" width={220} height={220} className="rounded-2xl border border-stone-200 bg-white p-2" />
          {expiresAt && (
            <p className="text-xs text-stone-400">
              有效期至 {new Date(expiresAt).toLocaleTimeString("zh-CN")}
            </p>
          )}
          {devMeta && scene && (
            <div className="w-full rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              <p className="break-all font-mono">{scene}</p>
              <p className="mt-1 text-amber-800/80">
                开发版扫码 · {devMeta.loginPage} ·{" "}
                <button type="button" className="underline" onClick={() => void navigator.clipboard?.writeText(scene)}>
                  复制 scene
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {message && (
        <p className={`mt-3 text-sm ${phase === "error" ? "text-red-600" : "text-stone-600"}`} role="status">
          {message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {phase === "idle" || phase === "error" || phase === "done" ? (
          <Button variant="soft" disabled={busy} onClick={() => void start()}>
            {phase === "done" ? "重新扫码" : "微信扫码登录"}
          </Button>
        ) : (
          <Button variant="soft" disabled={phase === "exchanging"} onClick={reset}>
            取消
          </Button>
        )}
        {showQr && (
          <Button variant="soft" disabled={busy} onClick={() => void start()}>
            刷新二维码
          </Button>
        )}
      </div>
    </div>
  );
}
