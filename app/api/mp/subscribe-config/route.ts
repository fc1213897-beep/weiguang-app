import { NextResponse } from "next/server";
import {
  getWxSubscribeTemplateDaily,
  getWxSubscribeTemplateTaskAdded,
} from "@/lib/wx-subscribe-config";

/** GET /api/mp/subscribe-config — 返回订阅模板 ID（供小程序 requestSubscribeMessage） */
export async function GET() {
  return NextResponse.json({
    daily: getWxSubscribeTemplateDaily(),
    task_added: getWxSubscribeTemplateTaskAdded(),
  });
}
