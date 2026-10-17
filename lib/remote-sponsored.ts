/* ==========================================================================
   lib/remote-sponsored.ts — جلب/نشر حملات المساحة المأجورة (موجة 20)
   --------------------------------------------------------------------------
   نفس نمط lib/remote-rate: الزوار يقرؤون القائمة المنشورة في KV عبر
   /api/sponsored، والمسؤول ينشر قائمته بالمفتاح نفسه المستخدم للسعر.
   ========================================================================== */

import type { SponsoredAd } from "./sponsored";

export interface RemoteSponsored {
  list: SponsoredAd[];
  kvConfigured: boolean;
}

export async function fetchRemoteSponsored(timeoutMs = 5000): Promise<RemoteSponsored | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const r = await fetch("/api/sponsored", { signal: ctl.signal, cache: "no-store" });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = (await r.json().catch(() => null)) as RemoteSponsored | null;
    if (!j || !Array.isArray(j.list)) return null;
    return { list: j.list, kvConfigured: Boolean(j.kvConfigured) };
  } catch {
    return null;
  }
}

export type PublishSponsoredResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

export async function publishSponsored(
  list: SponsoredAd[],
  key: string
): Promise<PublishSponsoredResult> {
  try {
    const r = await fetch("/api/sponsored", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ list, key }),
    });
    const j = (await r.json().catch(() => null)) as
      | { ok?: boolean; count?: number; error?: string }
      | null;
    if (r.ok && j?.ok) return { ok: true, count: j.count ?? list.length };
    return { ok: false, error: j?.error ?? `خطأ ${r.status}` };
  } catch {
    return { ok: false, error: "تعذّر الوصول إلى الخادم" };
  }
}
