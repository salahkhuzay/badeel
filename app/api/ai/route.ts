/* ==========================================================================
   app/api/ai/route.ts — محادثة الزوار مع وكيل المنصة (موجة 26)
   --------------------------------------------------------------------------
   POST {message, history} ⇒ {reply, ai}
   - مفتوح للزوار مع خنق 30 رسالة/ساعة لكل IP (ذاكرة الوظيفة).
   - السياق يُحقن حياً من إعدادات KV المنشورة (أرقام التواصل/فيسبوك/المدن).
   - بلا مفتاح دماغ ⇒ {ai:false} والودجت يرد محلياً بقواعد احتياطية.
   ========================================================================== */

import { NextResponse } from "next/server";
import { aiComplete, aiConfigured, type AiMessage } from "@/lib/agent/ai";
import { agentContext } from "@/lib/agent/context";
import { agentLog } from "@/lib/agent/log";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60; /* الحصة المجانية قد تصفّ الطلبات — نعطيها مهلة */

/* خنق بسيط: 30 رسالة لكل IP في الساعة */
const chatLog = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (chatLog.get(ip) ?? []).filter((t) => now - t < 3600_000);
  if (arr.length >= 30) {
    chatLog.set(ip, arr);
    return true;
  }
  arr.push(now);
  chatLog.set(ip, arr);
  return false;
}

function systemPrompt(ctx: Awaited<ReturnType<typeof agentContext>>): string {
  const phone = ctx?.contactPhone ? `${ctx.contactPhone}` : "(تظهر في شريط التواصل أسفل الموقع)";
  const cities = (ctx?.cities ?? [])
    .filter((c) => c.active)
    .map((c) => c.name)
    .slice(0, 20)
    .join("، ");
  return `أنت «وكيل بديل» — مساعد منصة «بديل أونلاين» السورية للإعلانات المبوبة (عقارات وسيارات ومركبات، أثاث، أجهزة كهربائية، هواتف، ملابس، وظائف).
تحدث بالعربية الواضحة الودودة، وردودك قصيرة (1-4 جمل) وعملية.
معلوماتك الدقيقة:
- الموقع: ${SITE_URL} — النشر مجاني من زر «أضف إعلانك»، والإعلان يظهر للزوار بعد موافقة الإدارة.
- الأقسام: عقارات (بيع/إيجار)، مركبات بأنواعها، أثاث، أجهزة، هواتف، ملابس، وظائف (عرض/طلب).
- التواصل مع الإدارة: ${phone}${ctx?.contactPhone2 ? ` أو ${ctx.contactPhone2}` : ""} (واتساب متاح من شريط التواصل).
- صفحة فيسبوك: ${ctx?.facebookUrl || "(قيد الربط)"}
- المدن المدعومة حالياً: ${cities || "منبج ومحيطها"}
- سعر الصرف المعروض في الموقع يدوي تحدّثه الإدارة، ولا تقدم توقعات مالية.
حدودك: لا تخترع إعلانات أو أسعاراً، لا تقدم استشارات قانونية/طبية/مالية، لا تطلب بيانات حساسة. إن سُئلت عما لا تعرفه، وجّه الزائر للتواصل مع الإدارة.

توجيه إلزامي حاسم:
- أجب فوراً باللغة العربية المباشرة فقط دون أي مقدمات.
- ممنوع منعاً باتاً كتابة أي خطوات تفكير أو تخطيط باللغة الإنجليزية (NO thinking process, NO English preamble).`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(ip)) {
    return NextResponse.json(
      { error: "تجاوزت حد المحادثات في هذه الساعة — حاول لاحقاً" },
      { status: 429 }
    );
  }
  let body: { message?: unknown; history?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";
  if (!message) return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });

  if (!(await aiConfigured())) {
    /* بلا دماغ — الودجت سيتكفل بردود القواعد المحلية */
    return NextResponse.json({ reply: null, ai: false });
  }

  const history: AiMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m): m is { role: "user" | "assistant"; text: string } =>
            !!m &&
            typeof m === "object" &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.text === "string"
        )
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text.slice(0, 600) }))
    : [];

  const ctx = await agentContext();
  const reply = await aiComplete(systemPrompt(ctx), [...history, { role: "user", text: message }], {
    maxTokens: 500,
    timeoutMs: 45000,
  });
  if (!reply) {
    return NextResponse.json({ reply: null, ai: false });
  }
  /* تسجيل مقتضب — أول رسالة من كل جلسة فقط كي لا يمتلئ السجل */
  if (history.length === 0) {
    await agentLog("chat", `محادثة زائر: «${message.slice(0, 50)}»`);
  }
  return NextResponse.json({ reply, ai: true });
}
