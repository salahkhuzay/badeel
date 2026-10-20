/* ==========================================================================
   app/api/integrations/whatsapp/route.ts — webhook واتساب للأعمال (موجة 26)
   --------------------------------------------------------------------------
   GET  : تحقق Meta من الرابط (hub.mode=subscribe + WA_VERIFY_TOKEN).
   POST : رسائل الزبائن الواردة ⇒ الوكيل يرد آلياً (نافذة 24 ساعة).
   رابط الاشتراك في لوحة Meta:
     https://<نطاقك>/api/integrations/whatsapp
   دائماً نعيد 200 لـMeta حتى لا تعيد المحاولات بلا نهاية.
   ========================================================================== */

import { NextResponse } from "next/server";
import { waConfigured, waHandleIncoming, waParseIncoming, waVerifyWebhook } from "@/lib/agent/whatsapp";

export const dynamic = "force-dynamic";
export const revalidate = 0;
/* لا تنتظر الوظيفة أكثر من اللازم — الرد على العميل يتم داخل المهلة */
export const maxDuration = 30;

export async function GET(req: Request) {
  const u = new URL(req.url);
  const challenge = await waVerifyWebhook(
    u.searchParams.get("hub.mode"),
    u.searchParams.get("hub.verify_token"),
    u.searchParams.get("hub.challenge")
  );
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ error: "تحقق غير صالح" }, { status: 403 });
}

export async function POST(req: Request) {
  if (!(await waConfigured())) {
    return NextResponse.json({ ok: true }); /* غير مفعّل — نبتلع الحدث بأدب */
  }
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const msgs = waParseIncoming(body);
  if (msgs.length) {
    try {
      await waHandleIncoming(msgs);
    } catch {
      /* خطأ الرد لا يعاد إلى Meta — سُجِّل ومحاولتها التالية تتجاهل */
    }
  }
  return NextResponse.json({ ok: true });
}
