import type { Settings } from "./types";

/* ==========================================================================
   إدارة أرقام التواصل — مرنة بلا كود
   ==========================================================================
   كيف تغيّر رقم الهاتف؟ أو تضيف رقماً ثانياً؟ — بلا أي تعديل في الكود:

   ①  من لوحة التحكم ← الإعدادات ← «بيانات التواصل والدعم»:
         • «رقم الدعم»      → الرقم الأساسي (اتصال + واتساب)، التغيير فوري.
         • «رقم ثانٍ»       → املأه فيظهر تلقائياً في الموقع (التذييل · الترويسة
                              · صفحة «كيف يعمل بديل؟») واتركه فارغاً فيختفي تماماً.

   ②  أي رقم تضبطه بنفسك من اللوحة يُعلَّم تلقائياً بـ «مخصّص» (custom)
       ولا يمسّه أي ترحيل تلقائي أبداً — لا يُحذف ولا يُستبدل.

   ③  تغيير الافتراضي لكل الزوار الجدد (اختياري): غيّر
       DEFAULT_SETTINGS.contactPhone في lib/currency.ts (سطر واحد)، وأضف الرقم
       القديم إلى SUPERSEDED_CONTACT_PHONES هنا فيُحدَّث تلقائياً لمن كان ما
       زال على الافتراضي القديم فقط — أما الأرقام المخصّصة فتُحترم دائماً.
   ========================================================================== */

/** أرقام كانت «افتراضية» سابقاً — تُحدَّث تلقائياً إلى الافتراضي الحالي.
    تُكتب بصيغة الأرقام المحلية بلا صفر وبلا مفتاح دولة (9 أرقام)،
    فتلتصق بكل صيغ الكتابة (0993… / +963993… / 00963993… / 963993…). */
export const SUPERSEDED_CONTACT_PHONES = [
  "993177597", // 0993177597 — الافتراضي حتى 2026-10-12 (استُبدل بـ 0933177597)
  "993177595", // 0993177595 — صيغة خاطئة شائعة كانت تُصحَّح سابقاً
  "933177595", // 0933177595 — صيغة خاطئة أخرى من عائلة 0933
];

/** تطبيع أي صيغة كتابة إلى أرقام محلية للمقارنة: +963993177597 → 993177597 */
export function contactDigits(raw?: string) {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length > 9 && d.startsWith("00")) d = d.slice(2); // 00963…
  if (d.startsWith("0")) d = d.slice(1); // صفر البداية المحلي
  if (d.length > 9 && d.startsWith("963")) d = d.slice(3); // مفتاح الدولة
  return d;
}

/** هل هذا الرقم من الأرقام الافتراضية القديمة التي يجب تحديثها؟ */
export function isSupersededPhone(raw?: string) {
  const d = contactDigits(raw);
  return d.length > 0 && SUPERSEDED_CONTACT_PHONES.includes(d);
}

/**
 * الترحيل الآمن للرقم الأساسي:
 *   - لا يوجد رقم مخزَّن            → يأخذ الافتراضي الحالي.
 *   - الرقم ضبطه المسؤول بنفسه     → يبقى كما هو (لا يُمسّ أبداً).
 *   - رقم كان افتراضياً قديماً      → يُحدَّث إلى الافتراضي الحالي.
 *   - أي رقم آخر                    → يبقى كما هو.
 */
export function migrateContactPhone(
  stored: string | undefined,
  source: "default" | "custom" | undefined,
  currentDefault: string
) {
  if (!stored || !stored.trim()) return currentDefault;
  if (source === "custom") return stored;
  if (isSupersededPhone(stored)) return currentDefault;
  return stored;
}

/** الأرقام الفعلية للعرض: الأساسي + الثانوي إن وُجد — بلا تكرار وبلا فراغات.
    إضافة رقم ثالث مستقبلاً = سطر واحد هنا. */
export function contactNumbers(settings: Pick<Settings, "contactPhone" | "contactPhone2">) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [settings.contactPhone, settings.contactPhone2]) {
    const value = String(raw ?? "").trim();
    if (!value) continue;
    const key = contactDigits(value);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push(value);
  }
  return out;
}
