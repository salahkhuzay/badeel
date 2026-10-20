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
import { aiComplete, aiConfigured, lastAiError } from "@/lib/agent/ai";
import { aiSettings } from "@/lib/agent/config";
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
    const s0 = await aiSettings();
    if (!s0.provider) {
      return NextResponse.json({ ok: false, error: "لا يوجد مفتاح دماغ — الصقه في بطاقة الدماغ" });
    }
    /* ① مسبار خفيف: هل المفتاح صالح وهل المزوّد قابل للوصول أصلاً؟ */
    const t0 = Date.now();
    const probeUrl =
      s0.provider === "gemini"
        ? `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(s0.key)}&pageSize=1`
        : "https://api.groq.com/openai/v1/models";
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 9000);
    try {
      const pr = await fetch(probeUrl, {
        signal: ctl.signal,
        cache: "no-store",
        headers: s0.provider === "groq" ? { Authorization: `Bearer ${s0.key}` } : {},
      });
      const raw = await pr.text().catch(() => "");
      if (!pr.ok) {
        return NextResponse.json({
          ok: false,
          error: `المفتاح مرفوض — HTTP ${pr.status}: ${raw.slice(0, 220)}`,
        });
      }
      /* ③ المفتاح صالح — جرّب توليداً قصيراً */
      const r = await aiComplete("أجب بكلمة واحدة فقط.", [{ role: "user", text: "قل: جاهز" }], {
        maxTokens: 10,
        timeoutMs: 12000,
      });
      return NextResponse.json(
        r
          ? { ok: true, name: `المفتاح صالح وردّ في ${Date.now() - t0}ms — ${r.slice(0, 20)}` }
          : { ok: false, error: `المفتاح صالح لكن التوليد فشل: ${lastAiError ?? "غير معروف"}` }
      );
    } catch (e) {
      return NextResponse.json({
        ok: false,
        error: `تعذّر الوصول إلى ${s0.provider === "gemini" ? "Google" : "Groq"} خلال 9 ثوانٍ (${String(e).slice(0, 100)}) — تحقق أن المفتاح من aistudio.google.com وليس من خدمة أخرى`,
      });
    } finally {
      clearTimeout(tm);
    }
  }

  if (channel === "facebook") {
    const r = await fbTest();
    if (r.ok) await agentLog("facebook", `اختبار ناجح — الصفحة: ${r.name}`);
    return NextResponse.json(r);
  }

  if (channel === "whatsapp") {
    if (!(await waConfigured())) {
      return NextResponse.json({ ok: false, error: "اربط واتساب من بطاقته (توكن + معرّف الخط)" });
    }
    const { waSettings } = await import("@/lib/agent/config");
    const to = (await waSettings()).notifyTo;
    if (!to) {
      return NextResponse.json({ ok: false, error: "رقم الإشعارات غير مضبوط — عبّئه في بطاقة واتساب" });
    }
    const sent = await waSendText(to, "✅ اختبار وكيل بديل أونلاين — قناة واتساب تعمل.");
    return sent
      ? NextResponse.json({ ok: true, name: to })
      : NextResponse.json({ ok: false, error: "تعذّر الإرسال — تحقق من التوكن ورقم الخط" });
  }

  return NextResponse.json({ error: "قناة غير معروفة" }, { status: 400 });
}
