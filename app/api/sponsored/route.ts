/* ==========================================================================
   app/api/sponsored/route.ts — نشر المساحة المأجورة لكل الزوار (موجة 20)
   --------------------------------------------------------------------------
   GET  : يقرأ حملات المساحة من KV (مفتاح site:sponsored) — بلا KV يرجع
          kvConfigured:false فيبقى كل زائر على قائمته المحلية (توافق رجعي).
   POST : ينشر قائمة الحملات لكل الزوار. محمي بنفس مفتاح النشر RATE_WRITE_KEY
          المستخدم لجسر السعر (مفتاح منصة واحد يضبطه صاحبها في Vercel).
   ========================================================================== */

import { NextResponse } from "next/server";
import type { SponsoredAd } from "@/lib/sponsored";

/* القراءة دائماً حية من KV — بلا ذلك تخزّن CDN لدى Vercel استجابة GET القديمة
   (درس مستقى من جسر السعر الذي يعلن هذين السطرين منذ البداية) */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const KV_KEY = "site:sponsored";

function kvEnv(readOnly: boolean): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL ?? process.env.KV_URL ?? "";
  const token = readOnly
    ? (process.env.KV_REST_API_READ_ONLY_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "")
    : (process.env.KV_REST_API_TOKEN ?? "");
  return { url, token };
}

const asList = (v: unknown): SponsoredAd[] =>
  Array.isArray(v) ? (v as SponsoredAd[]).filter((a) => a && typeof a === "object" && "id" in a) : [];

export async function GET() {
  const { url, token } = kvEnv(true);
  if (!url || !token) {
    return NextResponse.json({ list: [], kvConfigured: false });
  }
  try {
    const r = await fetch(`${url}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ list: [], kvConfigured: true });
    const j = (await r.json().catch(() => null)) as { result?: unknown } | null;
    let parsed: unknown = j?.result;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = [];
      }
    }
    return NextResponse.json({ list: asList(parsed), kvConfigured: true });
  } catch {
    return NextResponse.json({ list: [], kvConfigured: true });
  }
}

export async function POST(req: Request) {
  let body: { list?: unknown; key?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
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

  const list = asList(body.list);
  const { url, token } = kvEnv(false);
  if (!url || !token) {
    return NextResponse.json({ error: "مخزن KV غير مرتبط بالمنصة" }, { status: 503 });
  }
  try {
    /* صيغة Upstash REST المعتمدة في المنصة (كما في جسر السعر): القيمة في
       المسار /set/{key}/{value} — الكتابة بجسم الطلب تُهمَل بصمت */
    const w = await fetch(`${url}/set/${KV_KEY}/${encodeURIComponent(JSON.stringify(list))}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!w.ok) return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
    const wj = (await w.json().catch(() => null)) as { result?: unknown } | null;
    if (wj?.result !== "OK") {
      return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, count: list.length, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
  }
}
