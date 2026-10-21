/* ==========================================================================
   app/api/ads/[id]/route.ts — إشراف المدير على إعلان (موجة 25)
   PATCH: تعديل الحالة/التمييز/الحقول (موافقة، رفض، بيع، تأجير، إعادة فتح…)
   DELETE: حذف الإعلان (وصوره من التخزين).
   كلاهما محمي بمفتاح النشر RATE_WRITE_KEY — نفس مفتاح بقية الجسور.
   ========================================================================== */

import { NextResponse } from "next/server";
import type { Ad } from "@/lib/types";
import { sbDeleteAd, sbGetAd, sbUpdateAd, supabaseConfigured } from "@/lib/supabase-server";
import { fbConfigured, fbPublishAd } from "@/lib/agent/facebook";
import { cityNameOf } from "@/lib/agent/context";
import { agentLog } from "@/lib/agent/log";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function checkKey(req: Request): Promise<boolean> {
  const serverKey = process.env.RATE_WRITE_KEY;
  if (!serverKey) return false;
  try {
    const body = (await req.clone().json().catch(() => null)) as { key?: unknown } | null;
    return typeof body?.key === "string" && body.key === serverKey;
  } catch {
    return false;
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "الجسر غير مضبوط" }, { status: 503 });
  if (!(await checkKey(req))) return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { key?: string; patch?: Partial<Ad> } | null;
  const patch = body?.patch;
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "لا يوجد patch" }, { status: 400 });
  }
  /* حقول قابلة للتعديل من اللوحة فقط — لا يُسمح بتغيير id عبر هنا */
  const safe: Partial<Ad> = {};
  for (const k of [
    "status",
    "ref",
    "featured",
    "title",
    "description",
    "price",
    "currency",
    "priceUsd",
    "priceSyp",
    "priceOnRequest",
    "negotiable",
    "category",
    "cityId",
    "sellerName",
    "sellerPhone",
    "sellerWhatsapp",
    "rejectionReason",
    "publishedAt",
    "soldAt",
    "moderatedBy",
  ] as (keyof Ad)[]) {
    if (k in patch) (safe as Record<string, unknown>)[k] = patch[k];
  }
  /* الحالة السابقة: لنعرف أن هذه موافقة «جديدة» تستحق النشر على فيسبوك */
  const prev = await sbGetAd(ctx.params.id);
  const next = await sbUpdateAd(ctx.params.id, safe);
  if (!next) return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });

  /* ---- موجة 26: انتقال إلى active ⇒ نشر تلقائي على صفحة فيسبوك ---- */
  if (prev && prev.status !== "active" && next.status === "active" && (await fbConfigured())) {
    const city = await cityNameOf(next.cityId);
    const fb = await fbPublishAd(next, city ?? undefined);
    await agentLog(
      "facebook",
      fb.ok
        ? `نُشر ${next.ref} «${(next.title ?? "").slice(0, 30)}» على الصفحة`
        : `فشل نشر ${next.ref} على فيسبوك: ${fb.error ?? "خطأ غير معروف"}`
    );
  }
  return NextResponse.json({ ok: true, ad: next });
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "الجسر غير مضبوط" }, { status: 503 });
  if (!(await checkKey(req))) return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  const cur = await sbGetAd(ctx.params.id);
  const okDel = await sbDeleteAd(ctx.params.id);
  if (!okDel) return NextResponse.json({ error: "تعذّر الحذف" }, { status: 502 });
  /* صور الإعلان من تخزين Supabase (روابط عامة فقط تُحذف) */
  if (cur?.images?.length) {
    const { sbDeletePhotos, ADS_BUCKET } = await import("@/lib/supabase-server");
    const marker = `/storage/v1/object/public/${ADS_BUCKET}/`;
    const paths = cur.images
      .filter((p) => p.includes(marker))
      .map((p) => p.split(marker)[1])
      .filter(Boolean);
    await sbDeletePhotos(paths);
  }
  return NextResponse.json({ ok: true });
}
