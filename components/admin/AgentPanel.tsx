"use client";

/* ==========================================================================
   AgentPanel.tsx — لوحة «الوكيل الذكي» (موجة 26 / 26.1: ربط ذاتي)
   --------------------------------------------------------------------------
   لم يعد الربط يحتاج Vercel إطلاقاً: تلصق معرّف الصفحة وتوكن فيسبوك (ومفاتيح
   واتساب والدماغ) في بطاقات هذه اللوحة ← «حفظ الربط» ← تُخزَّن في KV وتعمل
   فوراً. متغيرات البيئة تبقى مدعومة وأولويتها أعلى. الأسرار تظهر مموهة
   (آخر 4 أحرف). زر «اختبار» حي لكل قناة + سجل نشاط الوكيل.
   ========================================================================== */

import React, { useCallback, useEffect, useState } from "react";
import { getRateKey } from "@/lib/remote-rate";

interface AgentStatus {
  ai: boolean;
  aiProvider: "gemini" | "groq" | null;
  aiSource: "env" | "panel" | null;
  aiKeyMasked: string | null;
  facebook: boolean;
  fbSource: "env" | "panel" | null;
  fbPageId: string | null;
  fbTokenMasked: string | null;
  whatsapp: boolean;
  waSource: "env" | "panel" | null;
  waPhoneId: string | null;
  waTokenMasked: string | null;
  waVerifySet: boolean;
  waNotifyTo: string | null;
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

const SOURCE_LABEL: Record<string, string> = {
  env: "متغيرات Vercel",
  panel: "محفوظ من هذه اللوحة",
};

interface FieldDef {
  key: string;
  label: string;
  secret?: boolean;
  placeholder?: string;
  current?: string | null; /* معرّفات علنية أو قيمة مموهة */
  dir?: "ltr" | "rtl";
}

function ChannelCard(props: {
  title: string;
  icon: string;
  on: boolean;
  source?: "env" | "panel" | null;
  offLabel: string;
  steps: string[];
  fields: FieldDef[];
  extra?: React.ReactNode;
  onSave?: (patch: Record<string, unknown>) => Promise<boolean>;
  onTest?: () => void;
  testing?: boolean;
  testResult?: string | null;
  qa?: string;
}) {
  const [openGuide, setOpenGuide] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSavedMsg(null);
    const patch: Record<string, unknown> = {};
    for (const f of props.fields) {
      const v = (values[f.key] ?? "").trim();
      if (v) patch[f.key] = v;
    }
    if (Object.keys(patch).length === 0) {
      setSavedMsg("لا شيء للحفظ — املأ حقلاً واحداً على الأقل");
      setSaving(false);
      return;
    }
    const ok = await props.onSave?.(patch);
    setSavedMsg(ok ? "✅ حُفظ الربط ويعمل فوراً" : "⛔ تعذّر الحفظ");
    setValues({});
    setSaving(false);
  }

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
              {props.on ? `مفعّل — ${SOURCE_LABEL[props.source ?? "panel"]}` : props.offLabel}
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

      {/* حقول اللصق */}
      <div className="mt-4 space-y-2.5">
        {props.fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {f.label}
              {f.current && (
                <span className="mr-2 font-mono text-emerald-600 dark:text-emerald-400" dir="ltr">
                  {f.current}
                </span>
              )}
            </label>
            <input
              type={f.secret ? "password" : "text"}
              dir={f.dir ?? "ltr"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.secret ? (f.current ? "محفوظ — الصق جديداً للاستبدال" : f.placeholder ?? "") : (f.placeholder ?? "")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-600 dark:bg-navy-800 dark:text-slate-100"
            />
          </div>
        ))}
        {props.extra}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="btn-navy btn-sm disabled:opacity-50"
            data-qa={`agent-save-${props.qa?.replace("agent-card-", "") ?? "x"}`}
          >
            {saving ? "…يحفظ" : "حفظ الربط"}
          </button>
          {props.onTest && (
            <button
              onClick={props.onTest}
              disabled={props.testing || !props.on}
              className="btn-ghost btn-sm disabled:opacity-50"
            >
              {props.testing ? "…يختبر" : "اختبار القناة"}
            </button>
          )}
          <button onClick={() => setOpenGuide((v) => !v)} className="btn-ghost btn-sm">
            {openGuide ? "إخفاء الدليل" : "من أين أجلب القيم؟"}
          </button>
        </div>
        {savedMsg && <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{savedMsg}</p>}
        {props.testResult && (
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{props.testResult}</p>
        )}
      </div>

      {openGuide && (
        <ol className="mt-4 list-decimal space-y-1.5 rounded-xl bg-slate-50 p-4 pr-9 text-[13px] leading-6 text-slate-700 dark:bg-navy-800 dark:text-slate-200">
          {props.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
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

  /** حفظ ربط من بطاقة — يعيد النجاح ويُحدّث الحالة */
  async function saveConfig(patch: Record<string, unknown>): Promise<boolean> {
    const key = getRateKey().trim();
    try {
      const r = await fetch("/api/integrations/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, patch }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setErr(j.error ?? "تعذّر حفظ الربط");
        return false;
      }
      setErr(null);
      await load();
      return true;
    } catch {
      setErr("تعذّر الاتصال بالخادم");
      return false;
    }
  }

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
          الربط كله من هذه الصفحة: الصق القيم في البطاقة ← «حفظ الربط» ← «اختبار
          القناة». لا حاجة لفتح Vercel أو إعادة نشر. الوكيل يرد على الزوار، يفحص كل
          إعلان جديد، ينشر على صفحتك كل إعلان توافق عليه، ويرد على زبائن واتساب
          ويُشعرك بكل جديد. وبلا أي ربط يبقى الموقع يعمل كالمعتاد تماماً.
        </p>
      </div>

      {err && (
        <p className="rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          {err}
        </p>
      )}

      {/* القنوات الثلاث */}
      <div className="grid gap-5 xl:grid-cols-3">
        <ChannelCard
          qa="agent-card-ai"
          title="الدماغ (محادثة + تنقيح)"
          icon="🧠"
          on={Boolean(status?.ai)}
          source={status?.aiSource}
          offLabel="غير مربوط — الودجت يرد بقواعد محلية"
          fields={[
            {
              key: "aiKey",
              label: "مفتاح Gemini (aistudio.google.com)",
              secret: true,
              current: status?.aiProvider === "gemini" ? status?.aiKeyMasked : null,
            },
            {
              key: "groqKey",
              label: "أو مفتاح Groq بديل (console.groq.com — سريع ومجرب من الخوادم)",
              secret: true,
              current: status?.aiProvider === "groq" ? status?.aiKeyMasked : null,
            },
          ]}
          extra={
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                defaultChecked={Boolean(status?.autoApprove)}
                onChange={(e) => {
                  void saveConfig({ autoApprove: e.target.checked });
                }}
              />
              الموافقة التلقائية (الإعلانات الموثوقة تُنشر فوراً بلا انتظار موافقتك)
            </label>
          }
          steps={[
            "الخيار الأول Gemini: افتح aistudio.google.com ← Get API key ← Create API key والصقه في حقل Gemini.",
            "الخيار البديل Groq (إن علّق Gemini): افتح console.groq.com ← Keys ← Create API Key والصقه في حقل Groq — يعمل فوراً من الخوادم مجاناً.",
            "احفظ واحداً منهما فقط (Groq يُستخدم إذا لم يوجد Gemini… والأولوية لـGemini إن كان صالحاً).",
            "اضغط «اختبار القناة» — الأخضر يعني أن الدماغ يرد فعلاً.",
          ]}
          onTest={() => test("ai")}
          testing={testing === "ai"}
          testResult={testResults.ai || null}
          onSave={saveConfig}
        />
        <ChannelCard
          qa="agent-card-fb"
          title="صفحة فيسبوك"
          icon="📘"
          on={Boolean(status?.facebook)}
          source={status?.fbSource}
          offLabel="غير مربوط — الموافقة تعمل بلا نشر تلقائي"
          fields={[
            { key: "fbPageId", label: "معرّف الصفحة Page ID", current: status?.fbPageId },
            { key: "fbPageToken", label: "توكن الصفحة Page Access Token", secret: true, current: status?.fbTokenMasked },
          ]}
          steps={[
            "افتح developers.facebook.com ← My Apps ← Create App ← نوع Business (بحسابك الذي يدير الصفحة).",
            "من القائمة: Tools ← Graph API Explorer ← اختر تطبيقك الجديد.",
            "اضغط Add Permissions وابحث عن: pages_show_list وpages_manage_posts وpages_read_engagement وpages_manage_metadata ← علّمها.",
            "اضغط Generate Access Token ← وافق ← ثم من القائمة المنسدلة بجانب Page اختر «Get Page Access Token» واختر صفحة بديل.",
            "انسخ التوكن الطويل في حقل التوكن هنا.",
            "معرّف الصفحة: في Graph API Explorer نفسه اكتب me/accounts?access_token=التوكن ← Submit ← انسخ قيمة id.",
            "الصق القيمتين هنا ← «حفظ الربط» ← «اختبار القناة» يجب أن يعيد اسم صفحتك.",
          ]}
          onTest={() => test("facebook")}
          testing={testing === "facebook"}
          testResult={testResults.facebook || null}
          onSave={saveConfig}
        />
        <ChannelCard
          qa="agent-card-wa"
          title="واتساب للأعمال"
          icon="💚"
          on={Boolean(status?.whatsapp)}
          source={status?.waSource}
          offLabel="غير مربوط — روابط واتساب العادية تعمل"
          fields={[
            { key: "waToken", label: "توكن واتساب (WA_TOKEN)", secret: true, current: status?.waTokenMasked },
            { key: "waPhoneId", label: "معرّف الخط Phone number ID", current: status?.waPhoneId },
            { key: "waNotifyTo", label: "رقمك للإشعارات (دولي أرقام فقط مثل 9639XXXXXXXX)", current: status?.waNotifyTo },
            { key: "waVerifyToken", label: "رمز تحقق الـwebhook (كلمة تختارها)", secret: true },
          ]}
          steps={[
            "في تطبيقك على developers.facebook.com أضف منتج WhatsApp ← Get started — يعطيك Meta رقم اختبار مجاني.",
            "من WhatsApp ← API Setup: انسخ Temporary access token وPhone number ID والصقهما هنا مع رقمك في «رقم الإشعارات».",
            "اختر كلمة سرية كـ«رمز تحقق» والصقها هنا أيضاً.",
            "في WhatsApp ← Configuration: Callback URL = https://badeel-online.vercel.app/api/integrations/whatsapp والرمز نفسه ← Verify ← اشترك بحقل messages.",
            "«حفظ الربط» ثم «اختبار القناة» — يجب أن تصلك رسالة واتساب على رقمك.",
            "ملاحظة: الرقم الشخصي لا ينتقل آلياً إلى Cloud API — نبدأ برقم Meta المجاني، ونقل رقم عملك خطوة لاحقة اختيارية.",
          ]}
          onTest={() => test("whatsapp")}
          testing={testing === "whatsapp"}
          testResult={testResults.whatsapp || null}
          onSave={saveConfig}
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
              لا نشاط بعد — سيظهر هنا كل رد وتنقيح ونشر تلقائي وحفظ ربط يقوم به الوكيل.
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
