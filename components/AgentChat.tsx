"use client";

/* ==========================================================================
   AgentChat.tsx — ودجت «وكيل بديل» لمحادثة الزوار (موجة 26)
   --------------------------------------------------------------------------
   زر عائم يفتح نافذة محادثة مع وكيل المنصة:
   - إن كان «الدماغ» مضبوطاً (AI_KEY/GROQ_KEY) يرد عبر /api/ai.
   - وإلا يرد محلياً بقواعد احتياطية ذكية (نشر/أقسام/تواصل/واتساب…)
     فلا ينكسر الوِدجت أبداً مهما كانت الإعدادات.
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { displayPhone, supportWhatsapp } from "@/lib/currency";

interface Msg {
  me: boolean;
  text: string;
}

const CHIPS = ["كيف أنشر إعلاناً؟", "ما أقسام الموقع؟", "كيف أتواصل مع الإدارة؟"];

/** ردود القواعد المحلية — تعمل بلا أي مفتاح خارجي */
function ruleReply(q: string, phone: string, waUrl: string, fb: string): string {
  const t = q.toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => t.includes(w));
  const phoneLine = phone ? `\n📞 ${phone}` : "";
  if (has("سلام", "مرحب", "هلا", "هاي", "أهلا", "اهلا", "صباح", "مساء"))
    return `أهلاً بك في بديل أونلاين 🌟\nأنا وكيل المنصة — اسألني عن النشر أو الأقسام أو التواصل.`;
  if (has("نشر", "أعلن", "اعلن", "بيع", "كيف أضيف", "كيف اضيف", "انشر"))
    return `النشر مجاني وبثلاث خطوات:\n① اضغط «أضف إعلانك» أعلى الموقع.\n② اختر القسم واملأ التفاصيل والصور من معرض جهازك.\n③ أرسل — ويظهر إعلانك لكل الزوار بعد موافقة الإدارة.`;
  if (has("قسم", "أقسام", "اقسام", "تصنيف", "فئات"))
    return `أقسام الموقع:\n🏠 عقارات (بيع وإيجار) · 🚗 مركبات بكل أنواعها · 🛋️ أثاث · 📺 أجهزة كهربائية · 📱 هواتف · 👕 ملابس · 💼 وظائف (عرض وطلب).`;
  if (has("تواصل", "اتصال", "هاتف", "رقم", "واتس", "دعم", "مساعدة"))
    return `الإدارة جاهزة لخدمتك:${phoneLine}\n💬 واتساب: ${waUrl}${fb ? `\n📘 فيسبوك: ${fb}` : ""}`;
  if (has("سعر الصرف", "الدولار", "دولار", "صرف", "ليرة"))
    return `سعر الصرف المعروض في الموقع تحدّثه الإدارة يدوياً أولاً بأول، وكل إعلان يظهر بالليرة والدولار معاً. لا نقدم توقعات مالية.`;
  if (has("مجاني", "رسوم", "عمولة", "تكلفة", "اشتراك"))
    return `النشر والتصفح مجانيان بالكامل 🎉 بلا عمولة وبلا اشتراك.`;
  if (has("فيسبوك", "صفحة"))
    return fb ? `صفحتنا الرسمية: ${fb}` : `صفحتنا على فيسبوك قيد الربط — تابعنا من رابط التواصل في أسفل الموقع.`;
  if (has("موافقة", "مراجعة", "تأخر", "ما ظهر", "لم يظهر"))
    return `كل إعلان جديد يمر بمراجعة الإدارة قبل الظهور (حماية للجميع)، وغالباً خلال وقت قصير. إن تأخر، راسل الإدارة على واتساب.`;
  return `سؤال مهم! للإجابة الدقيقة يمكنك التواصل مع الإدارة مباشرة:${phoneLine}\n💬 واتساب: ${waUrl}\nأو اسألني عن: طريقة النشر، الأقسام، سعر الصرف، أو الموافقة على الإعلانات.`;
}

export default function AgentChat() {
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      me: false,
      text: "أهلاً! أنا «وكيل بديل» 🤖\nاسألني عن النشر، الأقسام، أو التواصل مع الإدارة.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const phone = displayPhone(settings.contactPhone, settings.whatsappCountryCode);
  const waUrl = supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode);
  const fb = String(settings.facebookUrl ?? "").trim();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setDraft("");
    const history = msgs.slice(-8).map((m) => ({
      role: m.me ? ("user" as const) : ("assistant" as const),
      text: m.text,
    }));
    setMsgs((p) => [...p, { me: true, text: q }]);
    setBusy(true);
    let reply: string | null = null;
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history }),
      });
      if (r.ok) {
        const j = (await r.json()) as { reply?: string | null; ai?: boolean };
        if (j.ai && j.reply) reply = j.reply;
      }
    } catch {
      /*网络 خطأ — القواعد المحلية تكفي */
    }
    if (!reply) reply = ruleReply(q, phone, waUrl, fb);
    setMsgs((p) => [...p, { me: false, text: reply! }]);
    setBusy(false);
  }

  return (
    <>
      {/* الزر العائم — يمين الشاشة، فوق شريط التواصل على الجوال */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-pop transition hover:bg-emerald-500 sm:bottom-4 no-print"
        aria-label={open ? "إغلاق محادثة الوكيل" : "محادثة وكيل بديل"}
        data-qa="agent-chat-btn"
      >
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div
          className="fixed bottom-36 right-4 z-40 flex h-[min(480px,70vh)] w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop sm:bottom-20 dark:border-slate-700 dark:bg-navy-900 no-print"
          data-qa="agent-chat-panel"
        >
          {/* الرأس */}
          <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-extrabold">وكيل بديل 🤖</p>
              <p className="text-[11px] opacity-85">يجيبك فوراً — 24/7</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-lg leading-none" aria-label="إغلاق">
              ✕
            </button>
          </div>

          {/* الرسائل */}
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[13px] leading-6 ${
                  m.me
                    ? "mr-auto bg-emerald-600 text-white"
                    : "ml-auto bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                }`}
                data-qa={m.me ? "agent-msg-user" : "agent-msg-bot"}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="ml-auto rounded-2xl bg-slate-100 px-3 py-2 text-[13px] text-slate-500 dark:bg-slate-800">
                …يكتب
              </div>
            )}
            {/* اقتراحات سريعة عند البداية */}
            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CHIPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="rounded-full border border-emerald-600/40 px-3 py-1 text-[11px] text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:text-emerald-300"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* الإدخال */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
            className="flex items-center gap-2 border-t border-slate-200 p-2 dark:border-slate-700"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="اكتب سؤالك…"
              maxLength={600}
              className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-600 dark:bg-navy-800 dark:text-slate-100"
              data-qa="agent-chat-input"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="rounded-full bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              data-qa="agent-chat-send"
            >
              إرسال
            </button>
          </form>
        </div>
      )}
    </>
  );
}
