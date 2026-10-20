/* ==========================================================================
   lib/agent/moderate.ts — التنقيح التلقائي للإعلانات الجديدة (موجة 26)
   --------------------------------------------------------------------------
   بعد حفظ إعلان جديد يستشيره POST /api/ads:
     بلا دماغ (AI_KEY/GROQ_KEY) ⇒ «review» — يبقى pending كما كان تماماً.
     بالدماغ ⇒ يصنّف الإعلان: approve / review / reject مع سبب عربي قصير.
       reject  ⇒ يُرفَض فوراً مع السبب (يظهر للناشر والإدارة).
       approve ⇒ يبقى pending افتراضياً، إلا إذا ضبط المسؤول AUTO_APPROVE=1
                 فيُفعَّل مباشرة (ثقة كاملة بالوكيل).
   الوكيل استشاري: قراره وسببه يُسجَّلان في log الإعلان وسجل النشاط،
   والقرار النهائي يبقى بيد المسؤول من اللوحة في كل الأحوال.
   ========================================================================== */

import type { Ad } from "@/lib/types";
import { aiComplete, aiConfigured, parseJsonReply } from "./ai";
import { agentLog } from "./log";
import { autoApproveOn } from "./config";

export type ModDecision = "approve" | "review" | "reject";

export interface ModResult {
  decision: ModDecision;
  reason: string;
  byAi: boolean;
}

/** الموافقة التلقائية: متغير البيئة أو مفتاح اللوحة (26.1) */
export async function autoApproveEnabled(): Promise<boolean> {
  return autoApproveOn();
}

const MOD_SYSTEM = `أنت منقّح إعلانات في منصة «بديل أونلاين» السورية للإعلانات المبوبة (عقارات، مركبات، أثاث، أجهزة، هواتف، ملابس، وظائف).
افحص الإعلان وأجب بـJSON فقط دون أي نص آخر:
{"decision":"approve"|"review"|"reject","reason":"سبب عربي قصير جداً"}
القواعد:
- approve: إعلان سلعة/خدمة/عقار/وظيفة حقيقي وواضح (عنوان ووصف وسعر منطقي).
- review: ناقص أو غامض أو سعره غير منطقي أو يحتاج نظراً بشرياً — لا ترفضه.
- reject: سبام أو شتائم أو محتوى مخالف للقانون أو الآداب، أو احتيال واضح (وعود أرباح خيالية، طلب تحويلات مسبقة)، أو إعلان لمنصات/مواقع منافسة.
- كن متسامحاً: عند الشك اختر review وليس reject.`;

/** ملخص الإعلان للدماغ — حقول نصية فقط (بلا صور) */
function adSummary(ad: Ad): string {
  return [
    `العنوان: ${ad.title}`,
    `الوصف: ${(ad.description ?? "").slice(0, 400)}`,
    `القسم: ${ad.category}`,
    `السعر: ${ad.priceOnRequest ? "عند الطلب" : `${ad.price} ${ad.currency}`}`,
    `اسم الناشر: ${ad.sellerName ?? ""}`,
  ].join("\n");
}

export async function moderateAd(ad: Ad): Promise<ModResult> {
  if (!(await aiConfigured())) {
    return { decision: "review", reason: "بلا دماغ — مراجعة بشرية اعتيادية", byAi: false };
  }
  const raw = await aiComplete(
    MOD_SYSTEM,
    [{ role: "user", text: adSummary(ad) }],
    { maxTokens: 200, timeoutMs: 12000 }
  );
  if (!raw) {
    return { decision: "review", reason: "تعذّر استشارة الدماغ — مراجعة بشرية", byAi: false };
  }
  const parsed = parseJsonReply<{ decision?: string; reason?: string }>(raw);
  const decision: ModDecision =
    parsed?.decision === "approve" || parsed?.decision === "reject"
      ? parsed.decision
      : "review";
  const reason = String(parsed?.reason ?? "").slice(0, 140) || "قرار الوكيل";
  await agentLog(
    "moderation",
    `فحص ${ad.ref} «${(ad.title ?? "").slice(0, 30)}» ⇒ ${
      decision === "approve" ? "موافقة" : decision === "reject" ? "رفض" : "مراجعة بشرية"
    }: ${reason}`
  );
  return { decision, reason, byAi: true };
}
