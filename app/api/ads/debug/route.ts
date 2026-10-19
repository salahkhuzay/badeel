/* ==========================================================================
   app/api/ads/debug/route.ts — تشخيص جسر الإعلانات (موجة 25)
   GET ?key=مفتاح_النشر ⇒ يفحص الاتصال بـ Supabase ويعيد أخطاءه الخام:
   الجدول (select)، وسلال التخزين (list buckets). محمي بالمفتاح نفسه.
   ========================================================================== */

import { NextResponse } from "next/server";
import { lastAdsError } from "@/lib/supabase-server";

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
  let insert: { ok: boolean; status: number; body: string } | null = null;
  let columns: string[] | string | null = null;
  try {
    const r = await fetch(`${base}/rest/v1/ads?select=id&limit=1`, { headers, cache: "no-store" });
    table = { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300) };
  } catch (e) {
    table = { ok: false, status: 0, body: String(e) };
  }
  /* أعمدة الجدول الفعلية من مواصفة OpenAPI لـ PostgREST */
  try {
    const r = await fetch(`${base}/rest/v1/`, { headers, cache: "no-store" });
    const spec = (await r.json().catch(() => null)) as
      | { definitions?: Record<string, { properties?: Record<string, unknown> }> }
      | null;
    const props = spec?.definitions?.ads?.properties;
    columns = props ? Object.keys(props) : "تعذر قراءة المواصفة";
  } catch (e) {
    columns = String(e).slice(0, 120);
  }
  /* مسبار إدخال: صف فحص صغير ثم حذفه — يعيد خطأ Postgres الخام إن وُجد */
  try {
    const now = new Date().toISOString();
    const r = await fetch(`${base}/rest/v1/ads`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        id: "debug-probe-row",
        ref: "DBG-0000",
        status: "pending",
        created_at: now,
        data: { id: "debug-probe-row", ref: "DBG-0000", title: "مسبار", status: "pending" },
      }),
    });
    const body = (await r.text()).slice(0, 400);
    insert = { ok: r.ok, status: r.status, body };
    if (r.ok) {
      await fetch(`${base}/rest/v1/ads?id=eq.debug-probe-row`, {
        method: "DELETE",
        headers,
      }).catch(() => {});
    }
  } catch (e) {
    insert = { ok: false, status: 0, body: String(e) };
  }
  try {
    const r = await fetch(`${base}/storage/v1/bucket`, { headers, cache: "no-store" });
    buckets = { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300) };
  } catch (e) {
    buckets = { ok: false, status: 0, body: String(e) };
  }
  return NextResponse.json({ configured: true, table, columns, insert, buckets, lastAdsError });
}
