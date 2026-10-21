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
export const maxDuration = 60;

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
    let probeUrl = "";
    const probeHeaders: Record<string, string> = {};
    if (s0.provider === "gemini") {
      probeUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(s0.key)}&pageSize=1`;
    } else if (s0.provider === "openrouter") {
      probeUrl = "https://openrouter.ai/api/v1/auth/key";
      probeHeaders.Authorization = `Bearer ${s0.key}`;
      probeHeaders["HTTP-Referer"] = "https://badeel-online.vercel.app";
      probeHeaders["X-Title"] = "Badeel Online Agent";
    } else if (s0.provider === "groq") {
      probeUrl = "https://api.groq.com/openai/v1/models";
      probeHeaders.Authorization = `Bearer ${s0.key}`;
    } else if (s0.provider === "mistral") {
      probeUrl = "https://api.mistral.ai/v1/models";
      probeHeaders.Authorization = `Bearer ${s0.key}`;
    }

    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 9000);
    try {
      const pr = await fetch(probeUrl, {
        signal: ctl.signal,
        cache: "no-store",
        headers: probeHeaders,
      });
      const raw = await pr.text().catch(() => "");
      if (!pr.ok) {
        return NextResponse.json({
          ok: false,
          error: `مفتاح ${s0.provider} مرفوض — HTTP ${pr.status}: ${raw.slice(0, 220)}`,
        });
      }
      /* ② المفتاح صالح — جرّب كل نموذج على حدة وأعد تقريراً كاملاً */
      if (s0.provider !== "gemini") {
        const r = await aiComplete("أجب بكلمة واحدة فقط دون أي مقدمات: جاهز", [{ role: "user", text: "قل كلمة واحدة: جاهز" }], {
          maxTokens: 60,
          timeoutMs: 18000,
        });
        return NextResponse.json(
          r
            ? { ok: true, name: `المفتاح صالح عبر ${s0.provider} وردّ في ${Date.now() - t0}ms — «${r.slice(0, 30)}»` }
            : { ok: false, error: `المفتاح صالح عبر ${s0.provider} لكن التوليد فشل: ${lastAiError ?? "غير معروف"}` }
        );
      }
      const models = [
        process.env.AI_MODEL || "gemini-3.8-flash",
        "gemini-flash-latest",
      ].filter((m, i, arr) => arr.indexOf(m) === i);
      const report: string[] = [];
      for (const model of models) {
        const c2 = new AbortController();
        const t2 = setTimeout(() => c2.abort(), 12000);
        const m0 = Date.now();
        try {
          const gr = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(s0.key)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: c2.signal,
              cache: "no-store",
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: "قل: جاهز" }] }],
                generationConfig: { maxOutputTokens: 10 },
              }),
            }
          );
          const graw = await gr.text().catch(() => "");
          if (gr.ok) {
            report.push(`${model}: ✅ ${Date.now() - m0}ms`);
            return NextResponse.json({
              ok: true,
              name: `يعمل على ${model} (${Date.now() - m0}ms) — ${report.join(" | ")}`,
            });
          }
          const msg = /"message":\s*"([^"]{0,140})/.exec(graw)?.[1] ?? graw.slice(0, 120);
          report.push(`${model}: HTTP ${gr.status} ${msg}`);
        } catch {
          report.push(`${model}: انقطع بعد ${Date.now() - m0}ms (تعليق)`);
        } finally {
          clearTimeout(t2);
        }
      }
      return NextResponse.json({
        ok: false,
        error: `المفتاح صالح لكن لا نموذج أجاب — ${report.join(" | ")}`,
      });
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
