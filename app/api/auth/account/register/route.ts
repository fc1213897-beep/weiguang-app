import { NextResponse } from "next/server";
import {
  normalizeUsername,
  usernameToAuthEmail,
  validateUsername,
} from "@/lib/account-auth";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/auth/account/register
 * 服务端注册：直接创建已确认用户，无需发邮件
 * Body: { "username": "fc7", "password": "******" }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const username = body.username ?? "";
    const password = body.password ?? "";

    const nameError = validateUsername(username);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    }

    const normalized = normalizeUsername(username);
    const email = usernameToAuthEmail(normalized);
    const admin = getSupabaseAdminClient();

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: normalized,
        provider: "account",
      },
    });

    if (error) {
      return NextResponse.json(
        { error: mapAuthErrorMessage(error.message) },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "注册失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
