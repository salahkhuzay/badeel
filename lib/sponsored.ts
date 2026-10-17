/* ==========================================================================
   lib/sponsored.ts — مساحة الإعلانات المأجورة (موجة 20)
   --------------------------------------------------------------------------
   الشريط الأعلى في هيرو الرئيسية مساحة إعلانية مأجورة يبيعها صاحب المنصة:
   الحملة = معلن + نص + رابط/هاتف + صورة اختيارية + فترة سريان + تفعيل.
   تُحفظ الحملات في مخزن المنصة (localStorage) وتُدار من لوحة التحكم.
   ========================================================================== */

export interface SponsoredAd {
  id: string;
  advertiser: string; /* اسم المعلن (يظهر صغيراً كجهة الرعاية) */
  title: string; /* النص الرئيسي للبانر */
  subtitle?: string;
  linkUrl?: string; /* وجهة النقر: موقع/صفحة */
  phone?: string; /* أو تواصل هاتفي بدل الرابط */
  imageUrl?: string; /* صورة خلفية اختيارية للرابط خارجي */
  startsAt: string; /* YYYY-MM-DD */
  endsAt: string; /* YYYY-MM-DD */
  enabled: boolean;
}

export const todayStr = () => new Date().toISOString().slice(0, 10);

/* الحملة «حية» اليوم إذا كانت مفعّلة وضمن فترة سريانها (شاملة الطرفين) */
export const isSponsoredLive = (a: SponsoredAd, today = todayStr()) =>
  Boolean(a.enabled && a.startsAt && a.endsAt && a.startsAt <= today && today <= a.endsAt);

/* أول حملة حية بحسب ترتيب الإدخال — من يرد الظهور دائماً يرتّب حملته أولاً */
export const pickLiveSponsored = (list: SponsoredAd[] | undefined, today = todayStr()) =>
  (list ?? []).find((a) => isSponsoredLive(a, today)) ?? null;

/* وصف حالة الحملة للوحة: حية / موقوفة / منتهية / قبل البداية */
export const sponsoredStatus = (a: SponsoredAd, today = todayStr()) => {
  if (!a.enabled) return "موقوفة";
  if (today < a.startsAt) return "قبل البداية";
  if (today > a.endsAt) return "منتهية";
  return "حية";
};
