/* ==========================================================================
   app/api/settings/route.ts — نشر الإعدادات العامة لكل الزوار (موجة 24)
   --------------------------------------------------------------------------
   شكوى صاحب المنصة: «غيّرت رقم الهاتف من اللوحة فتغيّر عندي فقط». السبب:
   الإعدادات كانت تُحفظ في متصفح المسؤول وحده، بينما لجسر السعر والحملات
   مخزن سحابي. هذا الجسر ينشر الشريحة العامة من الإعدادات (أرقام التواصل،
   واتساب، الشعار، فيسبوك) + المدن المفعّلة إلى KV بمفتاح site:settings،
   بنفس نمط /api/sponsored: GET حيّ للجميع، POST محمي بـ RATE_WRITE_KEY.
   ========================================================================== */

import { NextResponse } from "next/server";
import type { SettingsPayload } from "@/lib/remote-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const KV_KEY = "site:settings";

/* ذاكرة تطويرية محلية (اختبارات محلية فقط — تُفعَّل بـ RATE_DEV_MEMORY=1؛
   في Vercel لا يُضبط هذا المتغيّر إطلاقاً فيصير KV إلزامياً، كما في جسر السعر) */
const USE_DEV_MEMORY = process.env.RATE_DEV_MEMORY === "1";
let devPayload: SettingsPayload | null = null;

function kvEnv(readOnly: boolean): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL ?? process.env.KV_URL ?? "";
  const token = readOnly
    ? (process.env.KV_REST_API_READ_ONLY_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "")
    : (process.env.KV_REST_API_TOKEN ?? "");
  return { url, token };
}

const asPayload = (v: unknown): SettingsPayload | null => {
  if (!v || typeof v !== "object") return null;
  const p = v as Partial<SettingsPayload>;
  if (!p.settings || typeof p.settings !== "object") return null;
  if (!Array.isArray(p.cities)) return null;
  return {
    settings: p.settings as SettingsPayload["settings"],
    cities: p.cities as SettingsPayload["cities"],
    publishedAt: String(p.publishedAt ?? ""),
  };
};

export async function GET() {
  if (USE_DEV_MEMORY) {
    return NextResponse.json({ payload: devPayload, kvConfigured: true });
  }
  const { url, token } = kvEnv(true);
  if (!url || !token) {
    return NextResponse.json({ payload: null, kvConfigured: false });
  }
  try {
    const r = await fetch(`${url}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ payload: null, kvConfigured: true });
    const j = (await r.json().catch(() => null)) as { result?: unknown } | null;
    let parsed: unknown = j?.result;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = null;
      }
    }
    return NextResponse.json({ payload: asPayload(parsed), kvConfigured: true });
  } catch {
    return NextResponse.json({ payload: null, kvConfigured: true });
  }
}

export async function POST(req: Request) {
  let body: { payload?: unknown; key?: unknown } = {};
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

  const payload = asPayload(body.payload);
  if (!payload) {
    return NextResponse.json({ error: "حمولة الإعدادات غير صالحة" }, { status: 400 });
  }

  if (USE_DEV_MEMORY) {
    devPayload = payload;
    return NextResponse.json({ ok: true, updatedAt: payload.publishedAt });
  }

  const { url, token } = kvEnv(false);
  if (!url || !token) {
    return NextResponse.json({ error: "مخزن KV غير مرتبط بالمنصة" }, { status: 503 });
  }
  try {
    const w = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["SET", KV_KEY, JSON.stringify(payload)]),
      cache: "no-store",
    });
    if (!w.ok) return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
    const wj = (await w.json().catch(() => null)) as { result?: unknown } | null;
    if (wj?.result !== "OK") {
      return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, updatedAt: payload.publishedAt });
  } catch {
    return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
  }
}

/* إلغاء النشر (يعود كل زائر لإعداداته المحلية) — لصيانة الفحوص والاسترجاع */
export async function DELETE(req: Request) {
  let body: { key?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }
  const serverKey = process.env.RATE_WRITE_KEY;
  if (!serverKey || typeof body.key !== "string" || body.key !== serverKey) {
    return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  }
  if (USE_DEV_MEMORY) {
    devPayload = null;
    return NextResponse.json({ ok: true });
  }
  const { url, token } = kvEnv(false);
  if (!url || !token) {
    return NextResponse.json({ error: "مخزن KV غير مرتبط بالمنصة" }, { status: 503 });
  }
  try {
    const w = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["DEL", KV_KEY]),
      cache: "no-store",
    });
    if (!w.ok) return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذّرت الكتابة إلى مخزن KV" }, { status: 502 });
  }
}
