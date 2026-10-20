"use client";

/* ==========================================================================
   AgentPanel.tsx — لوحة «الوكيل الذكي» في الإدارة (موجة 26)
   --------------------------------------------------------------------------
   ثلاث بطاقات حالة (الدماغ / فيسبوك / واتساب) مع زر «اختبار» لكل قناة،
   سجل نشاط الوكيل الحي، ودليل ربط سريع لكل قناة بأسماء المتغيرات الحرفية.
   تقرأ الحالة من /api/integrations/status?key=… (مفتاح النشر نفسه).
   ========================================================================== */

import React, { useCallback, useEffect, useState } from "react";
import { getRateKey } from "@/lib/remote-rate";

interface AgentStatus {
  ai: boolean;
  aiProvider: "gemini" | "groq" | null;
  facebook: boolean;
  whatsapp: boolean;
  whatsappNotify: boolean;
  autoApprove: boolean;
  log: { at: string; kind: string; text: string }[];
}

const KIND_LABEL: Record<string, string> = {
  chat: "💬 محادثة",
  moderation: "🛡️ تنقيح",
  facebook: "📘 فيسبوك",
  whatsapp: "💚 واتساب",
  system: "⚙️ نظام",
};

function ChannelCard(props: {
  title: string;
  icon: string;
  on: boolean;
  onLabel?: string;
  offLabel: string;
  envs: string;
  steps: string[];
  onTest?: () => void;
  testing?: boolean;
  testResult?: string | null;
  qa?: string;
}) {
  const [openGuide, setOpenGuide] = useState(false);
  return (
    <div className="card p-5" data-qa={props.qa}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{props.icon}</span>
          <div>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{props.title}</p>
            <p
              className={`mt-0.5 text-xs font-bold ${
                props.on ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
              }`}
            >
              {props.on ? (props.onLabel ?? "مفعّل ويعمل") : props.offLabel}
            </p>
          </div>
        </div>
        <span
          className={`h-3 w-3 shrink-0 rounded-full ${
            props.on ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
          }`}
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {props.onTest && (
          <button
            onClick={props.onTest}
            disabled={props.testing || !props.on}
            className="btn-navy btn-sm disabled:opacity-50"
          >
            {props.testing ? "…يختبر" : "اختبار القناة"}
          </button>
        )}
        <button onClick={() => setOpenGuide((v) => !v)} className="btn-ghost btn-sm">
          {openGuide ? "إخفاء دليل الربط" : "دليل الربط"}
        </button>
        {props.testResult && (
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {props.testResult}
          </span>
        )}
      </div>

      {openGuide && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:bg-navy-800 dark:text-slate-200">
          <p className="font-bold">
            المتغيرات المطلوبة في Vercel ← Project ← Settings ← Environment Variables:
          </p>
          <p className="mt-1 font-mono text-xs" dir="ltr">
            {props.envs}
          </p>
          <ol className="mt-2 list-decimal space-y-1 pr-5">
            {props.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-slate-500">
            بعد إضافة المتغيرات: Deployments ← أحدث نشر ← ⋯ ← Redeploy.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AgentPanel() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const key = getRateKey().trim();
    if (!key) {
      setErr("مفتاح النشر غير محفوظ في هذا المتصفح");
      return;
    }
    try {
      const r = await fetch(`/api/integrations/status?key=${encodeURIComponent(key)}`, {
        cache: "no-store",
      });
      if (!r.ok) {
        setErr("تعذّر جلب حالة الوكيل (تحقق من مفتاح النشر)");
        return;
      }
      setStatus((await r.json()) as AgentStatus);
      setErr(null);
    } catch {
      setErr("تعذّر الاتصال بالخادم");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function test(channel: "ai" | "facebook" | "whatsapp") {
    const key = getRateKey().trim();
    setTesting(channel);
    setTestResults((p) => ({ ...p, [channel]: "" }));
    try {
      const r = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, channel }),
      });
      const j = (await r.json()) as { ok?: boolean; name?: string; error?: string };
      setTestResults((p) => ({
        ...p,
        [channel]: j.ok ? `✅ نجح${j.name ? ` — ${j.name}` : ""}` : `⛔ ${j.error ?? "فشل"}`,
      }));
      void load();
    } catch {
      setTestResults((p) => ({ ...p, [channel]: "⛔ تعذّر الاتصال" }));
    }
    setTesting(null);
  }

  return (
    <div className="space-y-5" data-qa="agent-panel">
      {/* مقدمة */}
      <div className="card p-5">
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
          🤖 الوكيل الذكي — يدير الموقع وفيسبوك وواتساب عنك
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          يرد الوكيل على الزوار داخل الموقع، يفحص كل إعلان جديد (يرفض السبام ويحوّل
          المشكوك فيه إليك)، ينشر تلقائياً على صفحة فيسبوك كل إعلان توافق عليه، ويرد
          على زبائن واتساب للأعمال — ويُشعرك على واتساب بكل إعلان جديد. كل قناة تعمل
          فور إضافة متغيراتها، وبلا متغيرات يبقى الموقع يعمل كالمعتاد تماماً.
        </p>
        {status?.autoApprove && (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            ⚡ الموافقة التلقائية مفعّلة (AUTO_APPROVE=1): الإعلانات التي يثق بها الوكيل
            تُنشر فوراً دون انتظار موافقتك.
          </p>
        )}
      </div>

      {err && (
        <p className="rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          {err}
        </p>
      )}

      {/* القنوات الثلاث */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChannelCard
          qa="agent-card-ai"
          title="الدماغ (محادثة + تنقيح)"
          icon="🧠"
          on={Boolean(status?.ai)}
          onLabel={status?.aiProvider === "groq" ? "مفعّل عبر Groq" : "مفعّل عبر Gemini"}
          offLabel="غير مضبوط — الودجت يرد بقواعد محلية"
          envs="AI_KEY (أو GROQ_KEY)"
          steps={[
            "افتح aistudio.google.com بحساب جوجل واضغط Get API key ثم Create API key — مجاني بلا بطاقة.",
            "انسخ المفتاح وضعه في Vercel باسم AI_KEY.",
            "اختياري: AUTO_APPROVE=1 لنشر موثوق تلقائياً.",
          ]}
          onTest={() => test("ai")}
          testing={testing === "ai"}
          testResult={testResults.ai || null}
        />
        <ChannelCard
          qa="agent-card-fb"
          title="صفحة فيسبوك"
          icon="📘"
          on={Boolean(status?.facebook)}
          offLabel="غير مضبوط — الموافقة تعمل بلا نشر تلقائي"
          envs="FB_PAGE_ID + FB_PAGE_TOKEN"
          steps={[
            "افتح developers.facebook.com وأنشئ تطبيقاً (Business) مجاناً.",
            "من Graph API Explorer: اختر تطبيقك، أضف الأذونات pages_show_list وpages_manage_posts وpages_read_engagement.",
            "اضغط Generate Page Access Token واختر صفحة بديل — انسخ التوكن في FB_PAGE_TOKEN.",
            "معرّف الصفحة: افتح صفحتك ← حول ← شفافية الصفحة، أو اطلب /me/accounts بالتوكن وانسخ id في FB_PAGE_ID.",
          ]}
          onTest={() => test("facebook")}
          testing={testing === "facebook"}
          testResult={testResults.facebook || null}
        />
        <ChannelCard
          qa="agent-card-wa"
          title="واتساب للأعمال"
          icon="💚"
          on={Boolean(status?.whatsapp)}
          onLabel={
            status?.whatsappNotify
              ? "مفعّل — الرد الآلي + إشعاراتك"
              : "مفعّل — أضف WA_NOTIFY_TO لتصلك الإشعارات"
          }
          offLabel="غير مضبوط — روابط واتساب العادية تعمل"
          envs="WA_TOKEN + WA_PHONE_NUMBER_ID + WA_VERIFY_TOKEN + WA_NOTIFY_TO"
          steps={[
            "في تطبيقك على developers.facebook.com أضف منتج WhatsApp واضغط Get started — سيعطيك Meta رقم اختبار مجاني.",
            "انسخ Phone number ID والتوكن المؤقت (ولاحقاً أنشئ توكن دائماً من System Users في Business Settings).",
            "ضع في WA_NOTIFY_TO رقمك الشخصي بصيغة دولية أرقام فقط (مثل 9639XXXXXXXX) لتصلك إشعارات الإعلانات الجديدة.",
            "في WhatsApp ← Configuration: ضع رابط الاستجابة https://badeel-online.vercel.app/api/integrations/whatsapp واختر رمز تحقق وضعه في WA_VERIFY_TOKEN ثم اشترك بحقل messages.",
          ]}
          onTest={() => test("whatsapp")}
          testing={testing === "whatsapp"}
          testResult={testResults.whatsapp || null}
        />
      </div>

      {/* سجل النشاط */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100">سجل نشاط الوكيل</h3>
          <button onClick={() => void load()} className="btn-ghost btn-sm">
            تحديث
          </button>
        </div>
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700" data-qa="agent-log">
          {(status?.log ?? []).length === 0 && (
            <li className="py-3 text-sm text-slate-500">
              لا نشاط بعد — سيظهر هنا كل رد وتنقيح ونشر تلقائي يقوم به الوكيل.
            </li>
          )}
          {(status?.log ?? []).slice(0, 20).map((e, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {KIND_LABEL[e.kind] ?? e.kind}
              </span>
              <span className="flex-1 text-slate-700 dark:text-slate-200">{e.text}</span>
              <span className="text-[11px] text-slate-400 tabular-nums" dir="ltr">
                {new Date(e.at).toLocaleString("sv-SE").slice(5, 16)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
