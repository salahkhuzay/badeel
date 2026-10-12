/* ==========================================================================
   رابط الموقع الرسمي — بديل | Badeel
   يحلّ الرابط بترتيب الأولوية التالي (بلا أي عنوان ثابت قد يخصّ موقعاً آخر):
     ① NEXT_PUBLIC_SITE_URL              → نطاقك الخاص (الأنسب للنشر النهائي)
     ② VERCEL_PROJECT_PRODUCTION_URL     → دومين مشروعك على Vercel (تلقائي)
     ③ VERCEL_URL                        → رابط النشر الحالي على Vercel (تلقائي)
     ④ http://localhost:3000             → للتشغيل المحلي فقط
   بهذا لا تحتاج حجز نطاق لتشغيل الموقع: اسم مشروعك على Vercel يكفي.
   ========================================================================== */

/** ينظّف القيمة: يزيل المسافات والشرطة الأخيرة ويضيف https:// إن غابت */
function normalize(value: string): string {
  let v = value.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

function resolveSiteUrl(): { url: string; source: string } {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.trim()) return { url: normalize(explicit), source: "NEXT_PUBLIC_SITE_URL" };

  const prodHost =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodHost && prodHost.trim())
    return { url: normalize(prodHost), source: "VERCEL_PROJECT_PRODUCTION_URL" };

  const deployHost = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (deployHost && deployHost.trim())
    return { url: normalize(deployHost), source: "VERCEL_URL" };

  return { url: "http://localhost:3000", source: "localhost" };
}

const resolved = resolveSiteUrl();

/** الرابط الرسمي للموقع (يُستخدم في sitemap و robots و canonical و OG) */
export const SITE_URL = resolved.url;

/** مصدر الرابط — للتشخيص */
export const SITE_URL_SOURCE = resolved.source;

/** هل ما زلنا على الرابط المحلي؟ (لم يُضبط نطاق ولا مشروع Vercel بعد) */
export const SITE_URL_IS_PLACEHOLDER = resolved.source === "localhost";

/** تنبيه عند البناء إن لم يُضبط الرابط في بيئة إنتاج */
if (SITE_URL_IS_PLACEHOLDER && process.env.NODE_ENV === "production") {
  console.warn(
    "[بديل] تنبيه: لم يُضبط NEXT_PUBLIC_SITE_URL ولا متغيّرات Vercel — " +
      "ستشير sitemap إلى localhost. اضبط النطاق أو انشر على Vercel ليُكتشف الرابط تلقائياً."
  );
}
