"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { WxExchangeResponse, WxLoginSessionRow } from "@/types/wx-login";

const POLL_MS = 2000;
const MAX_POLLS = 150;

type Phase = "idle" | "loading" | "polling" | "exchanging" | "done" | "error";

type QrPayload = {
  scene: string;
  qrcode: string;
  approveUrl: string;
  expiresAt: string;
};

type Props = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

/** 网页跨设备登录：电脑出码 → 手机浏览器打开确认页 */
export default function WebScanLogin({ onSuccess, onError }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scene, setScene] = useState("");
  const [qrcode, setQrcode] = useState("");
  const [approveUrl, setApproveUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
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
        if (!res.ok) throw new Error(data.error ?? "登录失败");

        const { error } = await getSupabaseClient().auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        if (error) throw new Error(error.message);

        stopPoll();
        setPhase("done");
        setMessage("登录成功");
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
        fail("等待超时，请刷新二维码重试");
        return;
      }

      const { data, error } = await getSupabaseClient()
        .from("wx_login_sessions")
        .select("openid, status, expires_at")
        .eq("scene", s)
        .maybeSingle();

      if (error) return fail(error.message);

      const row = data as Pick<WxLoginSessionRow, "openid" | "status" | "expires_at"> | null;
      if (!row) return fail("会话不存在");
      if (new Date(row.expires_at).getTime() < Date.now()) return fail("已过期，请刷新");
      if (row.status === "consumed") return fail("已使用，请刷新");
      if (row.status === "completed" && row.openid) return exchange(s);

      setMessage("请用手机扫二维码，在浏览器中点「确认登录」");
    },
    [exchange, fail]
  );

  const start = useCallback(async () => {
    stopPoll();
    exchanging.current = false;
    setPhase("loading");
    setMessage("正在生成二维码…");

    try {
      const res = await fetch("/api/auth/web/qrcode", { method: "POST" });
      const data = (await res.json()) as QrPayload & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "生成失败");

      setScene(data.scene);
      setQrcode(data.qrcode);
      setApproveUrl(data.approveUrl);
      setExpiresAt(data.expiresAt);
      setPhase("polling");
      setMessage("请用手机扫描二维码");

      void poll(data.scene);
      pollRef.current = setInterval(() => void poll(data.scene), POLL_MS);
    } catch (e) {
      fail(e instanceof Error ? e.message : "生成失败");
    }
  }, [fail, poll, stopPoll]);

  useEffect(() => () => stopPoll(), [stopPoll]);

  const busy = phase === "loading" || phase === "polling" || phase === "exchanging";
  const showQr = qrcode && (phase === "polling" || phase === "exchanging");

  return (
    <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/60 to-white p-4">
      <p className="text-sm font-semibold text-stone-800">网页扫码登录（推荐）</p>
      <p className="mt-1 text-xs text-stone-500">
        电脑出码，手机用浏览器打开确认，无需小程序
      </p>

      {showQr && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrcode} alt="登录二维码" width={220} height={220} className="rounded-xl border bg-white p-2" />
          {expiresAt && (
            <p className="text-xs text-stone-400">
              有效期至 {new Date(expiresAt).toLocaleTimeString("zh-CN")}
            </p>
          )}
          {approveUrl && (
            <p className="w-full break-all text-center text-[10px] text-stone-400">
              手机访问：{approveUrl}
            </p>
          )}
        </div>
      )}

      {message && (
        <p className={`mt-3 text-sm ${phase === "error" ? "text-red-600" : "text-stone-600"}`}>
          {message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {phase === "idle" || phase === "error" || phase === "done" ? (
          <Button variant="soft" disabled={busy} onClick={() => void start()}>
            {phase === "done" ? "重新扫码" : "生成登录二维码"}
          </Button>
        ) : (
          <Button variant="soft" onClick={() => { stopPoll(); setPhase("idle"); setMessage(""); }}>
            取消
          </Button>
        )}
        {showQr && (
          <Button variant="soft" disabled={busy} onClick={() => void start()}>
            刷新
          </Button>
        )}
      </div>
    </div>
  );
}
