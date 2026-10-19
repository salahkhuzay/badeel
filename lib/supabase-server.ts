/* ==========================================================================
   lib/supabase-server.ts — خادم فقط: كلام REST مباشر مع Supabase (موجة 25)
   --------------------------------------------------------------------------
   بلا SDK: PostgREST + Storage REST بنفس نمط جسور KV الموجودة.
   متغيّرات البيئة على Vercel: SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY.
   بلاتهما: الجسر «غير مضبوط» فتبقى المنصة على وضعها المحلي (توافق رجعي).
   ========================================================================== */

import type { Ad } from "./types";

export const ADS_BUCKET = "ads";

/* آخر خطأ خام من عمليات الجسر — يقرؤه /api/ads/debug للتشخيص */
export let lastAdsError: string | null = null;
function noteErr(msg: string) {
  lastAdsError = msg;
}

export function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function headers(json = true): HeadersInit {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

const base = () => (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");

/** الإعلانات المنشورة/المApproved + المعلّقة (نطاق المدير) أو العامة فقط */
export async function sbListAds(adminScope: boolean): Promise<Ad[] | null> {
  if (!supabaseConfigured()) return null;
  try {
    const filter = adminScope
      ? "order=created_at.desc"
      : "status=in.(active,sold,rented)&order=created_at.desc";
    const r = await fetch(`${base()}/rest/v1/ads?select=data&${filter}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const rows = (await r.json().catch(() => null)) as { data?: Ad }[] | null;
    if (!Array.isArray(rows)) return null;
    return rows.map((x) => x.data).filter((a): a is Ad => Boolean(a && typeof a === "object" && "id" in a));
  } catch {
    return null;
  }
}

/** الرقم المرجعي التالي من الخادم نفسه — يمنع تصادم الأرقام بين الأجهزة
   (القائمة المحلية لا ترى المعلّقة فكان رقمَا إعلانين يتكرران) */
export async function sbNextRef(): Promise<string> {
  const list = (await sbListAds(true)) ?? [];
  let max = 8000;
  for (const a of list) {
    const m = /BD-(\d+)/.exec(a.ref ?? "");
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `BD-${max + 1}`;
}

export async function sbInsertAd(ad: Ad): Promise<Ad | null> {
  if (!supabaseConfigured()) return null;
  try {
    const r = await fetch(`${base()}/rest/v1/ads`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=representation" },
      body: JSON.stringify({ id: ad.id, ref: ad.ref, status: ad.status, created_at: ad.createdAt, data: ad }),
    });
    if (!r.ok) {
      noteErr(`insert ${r.status}: ${(await r.text().catch(() => "")).slice(0, 300)}`);
      return null;
    }
    const rows = (await r.json().catch(() => null)) as { data?: Ad }[] | null;
    return rows?.[0]?.data ?? ad;
  } catch (e) {
    noteErr(`insert exception: ${String(e).slice(0, 200)}`);
    return null;
  }
}

export async function sbUpdateAd(id: string, patch: Partial<Ad>): Promise<Ad | null> {
  if (!supabaseConfigured()) return null;
  try {
    /* نقرأ الصف ثم ندمج ثم نكتب (data jsonb كامل) — أبسط وأأمن من دمج jsonb جزئي */
    const cur = await sbGetAd(id);
    if (!cur) return null;
    const next = { ...cur, ...patch };
    const r = await fetch(`${base()}/rest/v1/ads?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...headers(), Prefer: "return=representation" },
      body: JSON.stringify({ status: next.status, data: next }),
    });
    if (!r.ok) return null;
    return next;
  } catch {
    return null;
  }
}

export async function sbGetAd(id: string): Promise<Ad | null> {
  if (!supabaseConfigured()) return null;
  try {
    const r = await fetch(`${base()}/rest/v1/ads?id=eq.${encodeURIComponent(id)}&select=data`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const rows = (await r.json().catch(() => null)) as { data?: Ad }[] | null;
    return rows?.[0]?.data ?? null;
  } catch {
    return null;
  }
}

export async function sbDeleteAd(id: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  try {
    const r = await fetch(`${base()}/rest/v1/ads?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** رفع صورة (base64 dataUrl) إلى تخزين Supabase وإرجاع رابطها العام */
let bucketEnsured = false;
async function ensureBucket() {
  if (bucketEnsured || !supabaseConfigured()) return;
  try {
    /* إنشاء السلة إن غابت (إن وُجدت يعيد 409 ويُتجاهل) — ذاتي الإصلاح إذا
       لم يُنفَّذ سطر السلة في script SQL عند صاحب المنصة */
    await fetch(`${base()}/storage/v1/bucket`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ id: ADS_BUCKET, name: ADS_BUCKET, public: true }),
    });
  } catch {
    /* تجاهل */
  }
  bucketEnsured = true;
}

export async function sbUploadPhoto(dataUrl: string, path: string): Promise<string | null> {
  if (!supabaseConfigured()) return null;
  await ensureBucket();
  try {
    const [meta, b64] = dataUrl.split(",");
    const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/jpeg";
    const buf = Buffer.from(b64, "base64");
    const r = await fetch(`${base()}/storage/v1/object/${ADS_BUCKET}/${path}`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
        "Content-Type": mime,
        "x-upsert": "true",
      },
      body: buf,
    });
    if (!r.ok) {
      noteErr(`upload ${r.status}: ${(await r.text().catch(() => "")).slice(0, 300)}`);
      return null;
    }
    return `${base()}/storage/v1/object/public/${ADS_BUCKET}/${path}`;
  } catch (e) {
    noteErr(`upload exception: ${String(e).slice(0, 200)}`);
    return null;
  }
}

export async function sbDeletePhotos(paths: string[]): Promise<void> {
  if (!supabaseConfigured() || !paths.length) return;
  try {
    await fetch(`${base()}/storage/v1/object/${ADS_BUCKET}`, {
      method: "DELETE",
      headers: headers(),
      body: JSON.stringify({ prefixes: paths }),
    });
  } catch {
    /* تجاهل: حذف الصورة غير حرج */
  }
}
