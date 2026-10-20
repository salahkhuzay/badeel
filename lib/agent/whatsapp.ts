/* ==========================================================================
   lib/agent/whatsapp.ts — واتساب للأعمال عبر Cloud API (موجة 26)
   --------------------------------------------------------------------------
   وظيفتان:
   ① إشعار المسؤول: رسالة نصية عند كل إعلان جديد (WA_NOTIFY_TO).
   ② الرد الآلي على العملاء: webhook يستقبل رسائل الزبائن ويرد عليهم
      بالدماغ (ai.ts) — ضمن نافذة الـ24 ساعة الرسمية للمحادثة.
   المتغيرات: WA_TOKEN + WA_PHONE_NUMBER_ID (+ WA_VERIFY_TOKEN للـwebhook).
   بلا متغيرات ⇒ waConfigured()=false وكل شيء يعمل كما كان.
   ========================================================================== */

import { aiComplete } from "./ai";
import { agentLog } from "./log";
import { waSettings } from "./config";

const GRAPH = "https://graph.facebook.com/v19.0";

/** هل قناة واتساب مربوطة (بيئة أو لوحة) — 26.1 */
export async function waConfigured(): Promise<boolean> {
  const s = await waSettings();
  return Boolean(s.token && s.phoneId);
}

/** إرسال رسالة نصية إلى رقم بصيغة دولية أرقام فقط (مثل 963933177597) */
export async function waSendText(to: string, text: string): Promise<boolean> {
  const cfg = await waSettings();
  if (!cfg.token || !cfg.phoneId || !to) return false;
  try {
    const r = await fetch(`${GRAPH}/${cfg.phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text.slice(0, 1024) },
      }),
      cache: "no-store",
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** إشعار المسؤول بإعلان جديد (يُستدعى من POST /api/ads) */
export async function waNotifyAdmin(message: string): Promise<boolean> {
  const cfg = await waSettings();
  if (!cfg.notifyTo) return false;
  return waSendText(cfg.notifyTo, message);
}

/* --------------------------- webhook العملاء --------------------------- */

/** تحقق Meta من رابط الـwebhook (GET) */
export async function waVerifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): Promise<string | null> {
  const cfg = await waSettings();
  const verify = cfg.verifyToken || process.env.WA_VERIFY_TOKEN;
  if (mode === "subscribe" && verify && token === verify && challenge) return challenge;
  return null;
}

export interface WaIncoming {
  from: string; // رقم المرسل دولي
  name: string; // اسمه المعروض
  text: string; // نص الرسالة
}

/** استخراج الرسائل النصية من حمولة Meta (نتجاهل الصور/الملصقات بلطف) */
export function waParseIncoming(body: unknown): WaIncoming[] {
  const out: WaIncoming[] = [];
  try {
    const entries = (body as { entry?: { changes?: { value?: unknown }[] }[] })?.entry ?? [];
    for (const e of entries) {
      for (const c of e.changes ?? []) {
        const v = c.value as {
          messages?: { from?: string; type?: string; text?: { body?: string } }[];
          contacts?: { profile?: { name?: string }; wa_id?: string }[];
        };
        const nameOf = (from: string) =>
          v.contacts?.find((k) => k.wa_id === from)?.profile?.name ?? "";
        for (const m of v.messages ?? []) {
          if (!m.from) continue;
          if (m.type === "text" || m.type === "button") {
            out.push({
              from: m.from,
              name: nameOf(m.from),
              text: m.text?.body ?? "",
            });
          } else {
            out.push({
              from: m.from,
              name: nameOf(m.from),
              text: "(أرسل الزبون وسائط — سيصلك إشعار للرد يدوياً)",
            });
          }
        }
      }
    }
  } catch {
    /* حمولة غير متوقعة — نتجاهلها */
  }
  return out;
}

const WA_SYSTEM = `أنت موظف خدمة الزبائن في منصة «بديل أونلاين» السورية للإعلانات المبوبة على واتساب.
- رد بالعربية السورية المبسطة، قصير (1-3 جمل)، ودود ومهني.
- تساعد الزبائن في: كيفية نشر إعلان (من الموقع: أضف إعلانك مجاناً)، أقسام الموقع (عقارات، مركبات، أثاث، أجهزة، هواتف، ملابس، وظائف)، أن الإعلانات تظهر بعد موافقة الإدارة، والتواصل مع الإدارة لأية مشكلة.
- لا تخترع أسعاراً أو عروضاً غير موجودة، ولا تقدم استشارات قانونية أو مالية.
- إن طلب الزبون شيئاً خارج اختصاصك، اعتذر بلطف وأخبره أن الإدارة سترد عليه شخصياً.
- لا تطلب كلمات مرور أو بيانات حساسة أبداً.`;

/** رد الوكيل على رسالة زبون + تسجيل الحدث */
export async function waHandleIncoming(msgs: WaIncoming[]): Promise<number> {
  let replied = 0;
  for (const m of msgs.slice(0, 3)) {
    if (!m.text.trim()) continue;
    const reply =
      (await aiComplete(WA_SYSTEM, [{ role: "user", text: m.text }], { maxTokens: 300 })) ??
      "أهلاً بك في بديل أونلاين 🌟 وصلتنا رسالتك وسيرد عليك فريق الإدارة بأقرب وقت. لنشر إعلانك مجاناً زر موقعنا واضغط «أضف إعلانك».";
    if (await waSendText(m.from, reply)) {
      replied++;
      await agentLog("whatsapp", `رد آلي على ${m.name || m.from}: «${m.text.slice(0, 40)}»`);
    }
  }
  return replied;
}
