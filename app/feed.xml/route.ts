/* ==========================================================================
   app/feed.xml/route.ts — تلقيم RSS لأحدث الإعلانات (موجة 27)
   --------------------------------------------------------------------------
   لماذا؟ منصة Meta للمطورين محظورة جغرافياً في سوريا فلا يستطيع صاحب المنصة
   إنشاء تطبيق يجلب توكن الصفحة. البديل المشروع: هذا التلقيم العام يربطه
   بخدمة نشر تلقائي معتمدة لدى Meta (IFTTT/dlvr.it…) بتسجيل دخول فيسبوك
   العادي — كل إعلان توافق عليه يظهر في التلقيم فتنشره الخدمة على الصفحة.
   المحتوى: آخر 30 إعلاناً نشطاً (عنوان/رابط/سعر/مدينة/تاريخ/صورة أولى).
   بلا جسر إعلانات ⇒ تلقيم فارغ صالح (لا ينكسر القارئ).
   ========================================================================== */

import type { Ad } from "@/lib/types";
import { sbListAds, supabaseConfigured } from "@/lib/supabase-server";
import { agentContext } from "@/lib/agent/context";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const esc = (s: string): string =>
  s.replace(
    /[<>&'"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c
  );

function priceLine(a: Ad): string {
  if (a.priceOnRequest) return "السعر عند الطلب";
  const usd = a.currency === "USD" ? a.price : a.priceUsd || 0;
  if (usd > 0) return `${usd.toLocaleString("en-US")} $`;
  if (a.price > 0) return `${a.price.toLocaleString("en-US")} ل.س`;
  return "";
}

export async function GET() {
  const all = supabaseConfigured() ? ((await sbListAds(false)) ?? []) : [];
  const ctx = await agentContext();
  const cityOf = (id: string) => ctx?.cities.find((c) => c.id === id)?.name ?? "";
  const ads = all.filter((a) => a.status === "active").slice(0, 30);

  const items = ads
    .map((a) => {
      const desc = [priceLine(a), cityOf(a.cityId), (a.description ?? "").trim().slice(0, 140)]
        .filter(Boolean)
        .join(" — ");
      const img = (a.images ?? [])[0] ?? "";
      const when = new Date(a.publishedAt || a.createdAt || Date.now()).toUTCString();
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE_URL}/ad/${esc(a.ref)}</link>
      <guid isPermaLink="false">${esc(a.id)}</guid>
      <pubDate>${when}</pubDate>
      <description>${esc(desc)}</description>
${img ? `      <enclosure url="${esc(img)}" type="image/jpeg" length="0" />
      <media:content url="${esc(img)}" medium="image" />
` : ""}    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>بديل أونلاين — أحدث الإعلانات</title>
    <link>${SITE_URL}</link>
    <description>عقارات وسيارات ومركبات وأثاث وأجهزة وهواتف وملابس ووظائف — كل إعلان وافقت عليه إدارة بديل أونلاين يظهر هنا فوراً</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
