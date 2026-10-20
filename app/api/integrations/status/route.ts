/* ==========================================================================
   app/api/integrations/status/route.ts — حالة الوكيل (موجة 26 / 26.1)
   --------------------------------------------------------------------------
   GET ?key=RATE_WRITE_KEY ⇒ أي القنوات مربوطة ومن أين (متغيرات بيئة أو لوحة)
   + قيم مموهة (آخر 4 أحرف فقط — الأسرار لا تغادر الخادم كاملة أبداً)
   + سجل نشاط الوكيل. تستهلكه لوحة «الوكيل الذكي» فقط.
   ========================================================================== */

import { NextResponse } from "next/server";
import { aiSettings, fbSettings, maskSecret, waSettings, autoApproveOn } from "@/lib/agent/config";
import { agentLogRead } from "@/lib/agent/log";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const serverKey = process.env.RATE_WRITE_KEY;
  const key = new URL(req.url).searchParams.get("key");
  if (!serverKey || key !== serverKey) {
    return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  }
  const [ai, fb, wa, log, autoApprove] = await Promise.all([
    aiSettings(),
    fbSettings(),
    waSettings(),
    agentLogRead(),
    autoApproveOn(),
  ]);
  return NextResponse.json({
    /* الدماغ */
    ai: ai.provider !== null,
    aiProvider: ai.provider,
    aiSource: ai.source,
    aiKeyMasked: maskSecret(ai.key),
    /* فيسبوك */
    facebook: fb.source !== null,
    fbSource: fb.source,
    fbPageId: fb.pageId || null,
    fbTokenMasked: maskSecret(fb.token),
    /* واتساب */
    whatsapp: Boolean(wa.token && wa.phoneId),
    waSource: wa.source,
    waPhoneId: wa.phoneId || null,
    waTokenMasked: maskSecret(wa.token),
    waVerifySet: Boolean(wa.verifyToken),
    waNotifyTo: wa.notifyTo || null,
    /* سلوك */
    autoApprove,
    log,
  });
}
