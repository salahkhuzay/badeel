/* ==========================================================================
   app/api/ads/route.ts — جسر الإعلانات العام (موجة 25 / Supabase)
   --------------------------------------------------------------------------
   GET  : بلا وسيط → الإعلانات النشطة/المباعة/المؤجرة فقط (ما يراه الزوار).
          ?scope=admin&key=… → كل الحالاتIncluding المعلّقة (لوحة التحكم).
   POST : إنشاء إعلان جديد بحالة «pending» مع رفع صوره إلى تخزين Supabase.
          مفتوح للزوار (هذا سوق إعلانات مبوبة) مع خنق بسيط لكل IP.
   بلا SUPABASE_URL ⇒ bridgeConfigured:false ويبقى كل شيء محلياً (توافق رجعي).
   ========================================================================== */

import { NextResponse } from "next/server";
import type { Ad } from "@/lib/types";
import {
  sbInsertAd,
  sbListAds,
  sbUploadPhoto,
  supabaseConfigured,
} from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* خنق بسيط ضد الإغراق: 6 إعلانات لكل IP في الساعة (ذاكرة الوظيفة) */
const postLog = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (postLog.get(ip) ?? []).filter((t) => now - t < 3600_000);
  if (arr.length >= 6) {
    postLog.set(ip, arr);
    return true;
  }
  arr.push(now);
  postLog.set(ip, arr);
  return false;
}

const asAd = (v: unknown): Ad | null => {
  if (!v || typeof v !== "object") return null;
  const a = v as Ad;
  if (!a.id || !a.ref || !a.title || !a.category || !a.status) return null;
  return a;
};

export async function GET(req: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ ads: [], bridgeConfigured: false });
  }
  const url = new URL(req.url);
  const admin = url.searchParams.get("scope") === "admin";
  if (admin) {
    const serverKey = process.env.RATE_WRITE_KEY;
    const key = url.searchParams.get("key");
    if (!serverKey || key !== serverKey) {
      return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
    }
  }
  const ads = await sbListAds(admin);
  if (!ads) return NextResponse.json({ ads: [], bridgeConfigured: true });
  return NextResponse.json({ ads, bridgeConfigured: true });
}

export async function POST(req: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json(
      { error: "جسر الإعلانات غير مضبوط (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(ip)) {
    return NextResponse.json({ error: "تجاوزت حد الإعلانات في هذه الساعة — حاول لاحقاً" }, { status: 429 });
  }

  let body: { ad?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }
  const ad = asAd(body.ad);
  if (!ad) return NextResponse.json({ error: "حقول الإعلان ناقصة" }, { status: 400 });

  /* لا ثقة بحالة قادمة من المتصفح: كل إعلان جديد يبدأ «pending» */
  ad.status = "pending";
  ad.views = 0;

  /* الصور: dataUrl ⇒ تخزين Supabase ⇒ روابط عامة داخل الإعلان */
  const images: string[] = [];
  for (let i = 0; i < (ad.images ?? []).length; i++) {
    const p = ad.images[i];
    if (typeof p === "string" && p.startsWith("data:image")) {
      const url = await sbUploadPhoto(p, `${ad.id}-${i}.jpg`);
      if (url) images.push(url);
    } else if (typeof p === "string") {
      images.push(p);
    }
  }
  ad.images = images;

  const inserted = await sbInsertAd(ad);
  if (!inserted) {
    return NextResponse.json({ error: "تعذّر حفظ الإعلان في قاعدة البيانات" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, ad: inserted });
}
