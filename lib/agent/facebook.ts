/* ==========================================================================
   lib/agent/facebook.ts — النشر التلقائي على صفحة فيسبوك (موجة 26)
   --------------------------------------------------------------------------
   عند موافقة المسؤول على إعلان ⇒ يُنشر على الصفحة: صورة + تعليق فيه
   العنوان والسعر والمدينة ورابط الإعلان على الموقع.
   المتغيرات: FB_PAGE_ID + FB_PAGE_TOKEN (توكن الصفحة من Graph API Explorer).
   بلا متغيرات ⇒ fbConfigured()=false والموافقة تعمل كما كانت تماماً.
   ========================================================================== */

import type { Ad } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

const GRAPH = "https://graph.facebook.com/v19.0";

export function fbConfigured(): boolean {
  return Boolean(process.env.FB_PAGE_ID && process.env.FB_PAGE_TOKEN);
}

/** رابط الإعلان العام على الموقع */
export function adUrl(ad: Ad): string {
  return `${SITE_URL}/ad/${ad.ref}`;
}

/** تعليق المنشور — قالب عربي واضح مع السعر والمدينة ورابط التفاصيل */
export function fbCaption(ad: Ad, cityName?: string): string {
  const lines: string[] = [];
  const catIcon: Record<string, string> = {
    vehicles: "🚗",
    "real-estate": "🏠",
    furniture: "🛋️",
    appliances: "📺",
    phones: "📱",
    clothing: "👕",
    jobs: "💼",
  };
  lines.push(`${catIcon[ad.category] ?? "📦"} ${ad.title}`);
  if (ad.priceOnRequest) lines.push("💰 السعر عند الطلب");
  else if (ad.price > 0) {
    const usd = ad.currency === "USD" ? ad.price : ad.priceUsd || 0;
    lines.push(
      usd > 0
        ? `💰 ${usd.toLocaleString("en-US")} $`
        : `💰 ${ad.price.toLocaleString("en-US")} ل.س`
    );
  }
  if (cityName) lines.push(`📍 ${cityName}`);
  const desc = (ad.description ?? "").trim();
  if (desc) lines.push(desc.length > 160 ? `${desc.slice(0, 160)}…` : desc);
  lines.push("", `🔗 ${adUrl(ad)}`, "", "#بديل_أونلاين #سوريا");
  return lines.join("\n");
}

export interface FbResult {
  ok: boolean;
  postId?: string;
  error?: string;
}

/** نشر إعلان على الصفحة: مع صورة ⇒ /photos، بلا صور ⇒ /feed */
export async function fbPublishAd(ad: Ad, cityName?: string): Promise<FbResult> {
  if (!fbConfigured()) return { ok: false, error: "غير مضبوط" };
  const pageId = process.env.FB_PAGE_ID!;
  const token = process.env.FB_PAGE_TOKEN!;
  const caption = fbCaption(ad, cityName);
  const image = (ad.images ?? [])[0];
  try {
    const params = new URLSearchParams({ access_token: token });
    let endpoint = `${GRAPH}/${pageId}/photos`;
    if (image) {
      params.set("url", image);
      params.set("caption", caption);
    } else {
      endpoint = `${GRAPH}/${pageId}/feed`;
      params.set("message", caption);
      params.set("link", adUrl(ad));
    }
    const r = await fetch(`${endpoint}?${params.toString()}`, {
      method: "POST",
      cache: "no-store",
    });
    const j = (await r.json().catch(() => null)) as
      | { id?: string; post_id?: string; error?: { message?: string } }
      | null;
    if (!r.ok || j?.error) {
      return { ok: false, error: j?.error?.message ?? `HTTP ${r.status}` };
    }
    return { ok: true, postId: j?.post_id ?? j?.id };
  } catch {
    return { ok: false, error: "تعذّر الاتصال بفيسبوك" };
  }
}

/** فحص صلاحية التوكن: يعيد اسم الصفحة أو رسالة الخطأ (زر «اختبار» في اللوحة) */
export async function fbTest(): Promise<{ ok: boolean; name?: string; error?: string }> {
  if (!fbConfigured()) return { ok: false, error: "FB_PAGE_ID/FB_PAGE_TOKEN غير مضبوطة" };
  try {
    const r = await fetch(
      `${GRAPH}/${process.env.FB_PAGE_ID}?fields=name&access_token=${process.env.FB_PAGE_TOKEN}`,
      { cache: "no-store" }
    );
    const j = (await r.json().catch(() => null)) as
      | { name?: string; error?: { message?: string } }
      | null;
    if (!r.ok || !j?.name) return { ok: false, error: j?.error?.message ?? `HTTP ${r.status}` };
    return { ok: true, name: j.name };
  } catch {
    return { ok: false, error: "تعذّر الاتصال" };
  }
}
