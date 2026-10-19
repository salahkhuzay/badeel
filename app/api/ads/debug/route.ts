/* ==========================================================================
   app/api/ads/debug/route.ts — تشخيص جسر الإعلانات (موجة 25)
   GET ?key=مفتاح_النشر ⇒ يفحص الاتصال بـ Supabase ويعيد أخطاءه الخام:
   الجدول (select)، وسلال التخزين (list buckets). محمي بالمفتاح نفسه.
   ========================================================================== */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serverKey = process.env.RATE_WRITE_KEY;
  if (!serverKey || url.searchParams.get("key") !== serverKey) {
    return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  }
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
  const token = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!base || !token) {
    return NextResponse.json({ configured: false, hint: "متغيرات البيئة ناقصة" });
  }
  const headers = {
    apikey: token,
    Authorization: `Bearer ${token}`,
  };
  let table: { ok: boolean; status: number; body: string } | null = null;
  let buckets: { ok: boolean; status: number; body: string } | null = null;
  try {
    const r = await fetch(`${base}/rest/v1/ads?select=id&limit=1`, { headers, cache: "no-store" });
    table = { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300) };
  } catch (e) {
    table = { ok: false, status: 0, body: String(e) };
  }
  try {
    const r = await fetch(`${base}/storage/v1/bucket`, { headers, cache: "no-store" });
    buckets = { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300) };
  } catch (e) {
    buckets = { ok: false, status: 0, body: String(e) };
  }
  return NextResponse.json({ configured: true, table, buckets });
}
