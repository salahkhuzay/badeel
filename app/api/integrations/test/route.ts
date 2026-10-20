/* ==========================================================================
   app/api/integrations/test/route.ts — أزرار «اختبار» في لوحة الوكيل
   --------------------------------------------------------------------------
   POST {key, channel:"ai"|"facebook"|"whatsapp"} ⇒ فحص حيّ للقناة:
     ai       → نداء قصير للدماغ والتأكد أنه يرد.
     facebook → قراءة اسم الصفحة (صلاحية التوكن).
     whatsapp → رسالة «اختبار» إلى رقم المسؤول (WA_NOTIFY_TO).
   محمي بمفتاح النشر كبقية نقاط الإدارة.
   ========================================================================== */

import { NextResponse } from "next/server";
import { aiComplete, aiConfigured } from "@/lib/agent/ai";
import { fbTest } from "@/lib/agent/facebook";
import { waConfigured, waSendText } from "@/lib/agent/whatsapp";
import { agentLog } from "@/lib/agent/log";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  let body: { key?: unknown; channel?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }
  const serverKey = process.env.RATE_WRITE_KEY;
  if (!serverKey || body.key !== serverKey) {
    return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  }
  const channel = String(body.channel ?? "");

  if (channel === "ai") {
    if (!aiConfigured()) {
      return NextResponse.json({ ok: false, error: "لا يوجد مفتاح دماغ (AI_KEY أو GROQ_KEY)" });
    }
    const r = await aiComplete(
      "أجب بكلمة واحدة فقط.",
      [{ role: "user", text: "قل: جاهز" }],
      { maxTokens: 10 }
    );
    return NextResponse.json(
      r ? { ok: true, name: r.slice(0, 40) } : { ok: false, error: "الدماغ لم يستجب" }
    );
  }

  if (channel === "facebook") {
    const r = await fbTest();
    if (r.ok) await agentLog("facebook", `اختبار ناجح — الصفحة: ${r.name}`);
    return NextResponse.json(r);
  }

  if (channel === "whatsapp") {
    if (!waConfigured()) {
      return NextResponse.json({ ok: false, error: "WA_TOKEN/WA_PHONE_NUMBER_ID غير مضبوطة" });
    }
    const to = (process.env.WA_NOTIFY_TO ?? "").replace(/\D/g, "");
    if (!to) {
      return NextResponse.json({ ok: false, error: "رقم الإشعارات WA_NOTIFY_TO غير مضبوط" });
    }
    const sent = await waSendText(to, "✅ اختبار وكيل بديل أونلاين — قناة واتساب تعمل.");
    return sent
      ? NextResponse.json({ ok: true, name: to })
      : NextResponse.json({ ok: false, error: "تعذّر الإرسال — تحقق من التوكن ورقم الخط" });
  }

  return NextResponse.json({ error: "قناة غير معروفة" }, { status: 400 });
}
