/* ==========================================================================
   app/api/integrations/config/route.ts — حفظ ربط القنوات من اللوحة (26.1)
   --------------------------------------------------------------------------
   POST {key, patch:{fbPageId?, fbPageToken?, waToken?, waPhoneId?,
   waVerifyToken?, waNotifyTo?, aiKey?, groqKey?, openrouterKey?, mistralKey?, autoApprove?}}
   ⇒ يُخزَّن في KV (site:agentconfig) ويُسجَّل حدث في سجل الوكيل.
   سلسلة فارغة تمسح الحقل. الأسرار لا تُعاد في أي استجابة.
   محمي بمفتاح النشر كبقية نقاط الإدارة.
   ========================================================================== */

import { NextResponse } from "next/server";
import { agentConfigWrite } from "@/lib/agent/config";
import { agentLog } from "@/lib/agent/log";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED = new Set([
  "fbPageId",
  "fbPageToken",
  "waToken",
  "waPhoneId",
  "waVerifyToken",
  "waNotifyTo",
  "aiKey",
  "groqKey",
  "openrouterKey",
  "mistralKey",
  "autoApprove",
]);

export async function POST(req: Request) {
  let body: { key?: unknown; patch?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }
  const serverKey = process.env.RATE_WRITE_KEY;
  if (!serverKey || body.key !== serverKey) {
    return NextResponse.json({ error: "مفتاح النشر غير صحيح" }, { status: 401 });
  }
  const raw = body.patch;
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "لا يوجد patch" }, { status: 400 });
  }
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED.has(k)) continue;
    if (typeof v === "string" || typeof v === "boolean") patch[k] = v;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "لا حقول صالحة في الطلب" }, { status: 400 });
  }
  const saved = await agentConfigWrite(patch);
  if (!saved) {
    return NextResponse.json(
      { error: "تعذّر الحفظ — مخزن KV غير مرتبط أو غير قابل للكتابة" },
      { status: 502 }
    );
  }
  const names = Object.keys(patch)
    .map((k) =>
      k === "autoApprove" ? `الموافقة التلقائية=${patch[k] ? "on" : "off"}` : k
    )
    .join("، ");
  await agentLog("system", `حفظ ربط من اللوحة: ${names}`);
  return NextResponse.json({ ok: true });
}
