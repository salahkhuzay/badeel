/* ==========================================================================
   app/api/rate/route.ts — سعر الصرف العام (Upstash KV)
   --------------------------------------------------------------------------
   GET  : يقرأ site:rate من KV بتوكن القراءة فقط، ويرجع سعر الكود احتياطياً
          إن غاب المخزن أو تعذّر الاتصال — فلا يرى الزائر خطأً أبداً.
   POST : ينشر سعر جديد. محمي بـ RATE_WRITE_KEY (متغيّر Vercel، لا يظهر
          في المتصفح ولا في المستودع العام).
   ملاحظة: في التطوير المحلي فقط (NODE_ENV !== production) وعند غياب متغيّرات
   KV تُستخدم ذاكرة داخل العملية كي تبقى الاختبارات قادرة على محاكاة الدورة
   كاملة؛ في الإنتاج لا كتابة ولا قراءة إلا عبر KV.
   ========================================================================== */

import { NextResponse } from "next/server";
import { DEFAULT_SETTINGS } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RATE_KEY = "site:rate";
const UPDATED_KEY = "site:rateUpdatedAt";
/* ذاكرة التطوير تُفعَّل بمفتاح صريح (اختبارات محلية فقط) لأن next start
   يعمل بوضع الإنتاج؛ في Vercel لا يُضبط هذا المتغيّر إطلاقاً فيصير KV إلزامياً */
const USE_DEV_MEMORY = process.env.RATE_DEV_MEMORY === "1";
const MIN_RATE = 100;
const MAX_RATE = 5_000_000;

/* ذاكرة تطويرية محلية (لا تُستخدم في الإنتاج إطلاقاً) */
const devMemory: { rate: number | null; updatedAt: string | null } = {
  rate: null,
  updatedAt: null,
};

function kvEnv(readOnly: boolean): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL ?? process.env.KV_URL ?? "";
  const token = readOnly
    ? (process.env.KV_REST_API_READ_ONLY_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "")
    : (process.env.KV_REST_API_TOKEN ?? "");
  return { url, token };
}

async function readRate(): Promise<{ rate: number | null; updatedAt: string | null; via: "kv" | "dev" | "none" }> {
  const { url, token } = kvEnv(true);
  if (!url || !token) {
    if (!USE_DEV_MEMORY) return { rate: null, updatedAt: null, via: "none" };
    return { rate: devMemory.rate, updatedAt: devMemory.updatedAt, via: "dev" };
  }
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [r, u] = await Promise.all([
      fetch(`${url}/get/${RATE_KEY}`, { headers, cache: "no-store" }),
      fetch(`${url}/get/${UPDATED_KEY}`, { headers, cache: "no-store" }),
    ]);
    if (!r.ok) return { rate: null, updatedAt: null, via: "none" };
    const rj = (await r.json().catch(() => null)) as { result?: unknown } | null;
    const uj = (await u.json().catch(() => null)) as { result?: unknown } | null;
    const rate = Number(rj?.result);
    return {
      rate: Number.isFinite(rate) && rate >= MIN_RATE ? Math.round(rate) : null,
      updatedAt: typeof uj?.result === "string" ? uj.result : null,
      via: "kv",
    };
  } catch {
    return { rate: null, updatedAt: null, via: "none" };
  }
}

async function writeRate(rate: number, updatedAt: string): Promise<boolean> {
  const { url, token } = kvEnv(false);
  if (!url || !token) {
    if (!USE_DEV_MEMORY) return false;
    devMemory.rate = rate;
    devMemory.updatedAt = updatedAt;
    return true;
  }
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [a, b] = await Promise.all([
      fetch(`${url}/set/${RATE_KEY}/${rate}`, { headers, cache: "no-store" }),
      fetch(`${url}/set/${UPDATED_KEY}/${encodeURIComponent(updatedAt)}`, { headers, cache: "no-store" }),
    ]);
    return a.ok && b.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const { rate, updatedAt, via } = await readRate();
  if (rate !== null) {
    return NextResponse.json(
      { usdToSyp: rate, updatedAt, source: via === "dev" ? "dev-memory" : "kv" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(
    { usdToSyp: DEFAULT_SETTINGS.usdToSyp, updatedAt: null, source: "default" },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** تصفير ذاكرة التطوير فقط — يختصر إعادة تشغيل الخادم بين جولات الاختبار */
export async function DELETE() {
  if (!USE_DEV_MEMORY) {
    return NextResponse.json({ error: "متاح في التطوير فقط" }, { status: 405 });
  }
  devMemory.rate = null;
  devMemory.updatedAt = null;
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  let body: { rate?: unknown; key?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const rate = Math.round(Number(body.rate));
  if (!Number.isFinite(rate) || rate < MIN_RATE || rate > MAX_RATE) {
    return NextResponse.json(
      { error: `سعر غير منطقي — المقبول بين ${MIN_RATE} و${MAX_RATE.toLocaleString("en-US")}` },
      { status: 422 }
    );
  }

  const serverKey = process.env.RATE_WRITE_KEY;
  if (!serverKey) {
    return NextResponse.json(
      { error: "مفتاح النشر RATE_WRITE_KEY غير مضبوط في متغيّرات Vercel" },
      { status: 503 }
    );
  }
  if (typeof body.key !== "string" || body.key.length === 0 || body.key !== serverKey) {
    return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  }

  const updatedAt = new Date().toISOString();
  const done = await writeRate(rate, updatedAt);
  if (!done) {
    return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, usdToSyp: rate, updatedAt });
}
