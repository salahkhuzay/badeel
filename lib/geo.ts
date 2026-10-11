import type { DistrictKind } from "./types";
import { normalizeArabic } from "./filters";

/* ==========================================================================
   أدوات الجغرافيا الديناميكية
   - لا توجد قوائم أحياء ثابتة في الكود: كل منطقة تُنشأ من إدخال المستخدم،
     ويُولَّد لها معرّف ثابت (deterministic) من اسمها، فالمكان نفسه لا يتكرر
     حتى لو كتبه المستخدمون بصور إملائية مختلفة (أحياء/احياء، الحزوانة/الحزوانه).
   ========================================================================== */

export const DISTRICT_KINDS: { id: DistrictKind; name: string; short: string }[] = [
  { id: "neighborhood", name: "حي داخل المدينة", short: "حي" },
  { id: "village", name: "قرية", short: "قرية" },
  { id: "area", name: "منطقة / ريف", short: "منطقة" },
];

export const districtKindName = (kind?: DistrictKind) =>
  DISTRICT_KINDS.find((k) => k.id === kind)?.name ?? "منطقة / ريف";

export const districtKindShort = (kind?: DistrictKind) =>
  DISTRICT_KINDS.find((k) => k.id === kind)?.short ?? "منطقة";

/** تحويل اسم المنطقة إلى مقطع صالح للمعرّف: "حارة النعيم" → "حاره-النعيم" */
export function districtSlug(name: string) {
  const slug = normalizeArabic(name).replace(/\s+/g, "-").replace(/-+/g, "-");
  return slug.slice(0, 48) || "منطقه";
}

/** معرّف ثابت للمنطقة داخل مدينة معيّنة */
export function districtId(cityId: string, name: string) {
  return `${cityId}-d-${districtSlug(name)}`;
}

/** تخمين نوع المنطقة من اسمها (يُستخدم كقيمة مبدئية فقط، ويمكن تعديله) */
export function guessDistrictKind(name: string): DistrictKind {
  const n = normalizeArabic(name);
  if (n.includes("قريه") || n.startsWith("ال") === false && n.includes("مزرعه")) return "village";
  if (n.includes("ريف") || n.includes("ناحيه") || n.includes("باديه") || n.includes("مخيم")) return "area";
  if (n.includes("حي") || n.includes("حاره") || n.startsWith("طريق") || n.includes("سوق") || n.includes("شارع"))
    return "neighborhood";
  return "area";
}

/** تنظيف اسم المنطقة قبل الحفظ */
export function cleanDistrictName(raw: string) {
  return (raw || "")
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–—.,،؛:]+|[\s\-–—.,،؛:]+$/g, "")
    .trim();
}
