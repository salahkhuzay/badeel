/* ==========================================================================
   app/api/integrations/status/route.ts — حالة الوكيل (موجة 26)
   --------------------------------------------------------------------------
   GET ?key=RATE_WRITE_KEY ⇒ أي القنوات مضبوطة + سجل نشاط الوكيل.
   تستهلكه لوحة «الوكيل الذكي» في صفحة الإدارة فقط.
   ========================================================================== */

import { NextResponse } from "next/server";
import { aiConfigured, aiProvider } from "@/lib/agent/ai";
import { fbConfigured } from "@/lib/agent/facebook";
import { waConfigured } from "@/lib/agent/whatsapp";
import { agentLogRead } from "@/lib/agent/log";
import { autoApproveEnabled } from "@/lib/agent/moderate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const serverKey = process.env.RATE_WRITE_KEY;
  const key = new URL(req.url).searchParams.get("key");
  if (!serverKey || key !== serverKey) {
    return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  }
  const log = await agentLogRead();
  return NextResponse.json({
    ai: aiConfigured(),
    aiProvider: aiProvider(),
    facebook: fbConfigured(),
    whatsapp: waConfigured(),
    whatsappNotify: Boolean((process.env.WA_NOTIFY_TO ?? "").replace(/\D/g, "")),
    autoApprove: autoApproveEnabled(),
    log,
  });
}
