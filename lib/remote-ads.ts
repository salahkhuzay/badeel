/* ==========================================================================
   lib/remote-ads.ts — جسر الإعلانات من المتصفح إلى /api/ads (موجة 25)
   --------------------------------------------------------------------------
   الزوار: قائمة النشطة/المباعة/المؤجلة… (المعتمة: المعلّقة لا تُعرض).
   اللوحة: نطاق admin بالمفتاح ليرى المعلّقة ويشرف عليها.
   بلا جسر مضبوط ⇒ bridgeConfigured:false ويبقى كل شيء محلياً.
   ========================================================================== */

import type { Ad, ModerationAction } from "./types";

export interface RemoteAds {
  ads: Ad[];
  bridgeConfigured: boolean;
}

export async function fetchRemoteAds(opts?: { admin?: boolean; key?: string }): Promise<RemoteAds | null> {
  try {
    const q = opts?.admin && opts.key ? `?scope=admin&key=${encodeURIComponent(opts.key)}` : "";
    const r = await fetch(`/api/ads${q}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json().catch(() => null)) as RemoteAds | null;
    if (!j || !Array.isArray(j.ads)) return null;
    return j;
  } catch {
    return null;
  }
}

export type CreateRemoteAdResult = { ok: true; ad: Ad } | { ok: false; error: string };

export async function createRemoteAd(ad: Ad): Promise<CreateRemoteAdResult> {
  try {
    const r = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad }),
    });
    const j = (await r.json().catch(() => null)) as { ok?: boolean; ad?: Ad; error?: string } | null;
    if (r.ok && j?.ok && j.ad) return { ok: true, ad: j.ad };
    return { ok: false, error: j?.error ?? `خطأ ${r.status}` };
  } catch {
    return { ok: false, error: "تعذّر الوصول إلى الخادم" };
  }
}

/** ترجمة فعل إشراف إلى patch بسيط يُرسل للجسر (التمييز يحتاج الإعلان الحالي) */
export function patchForAction(
  action: ModerationAction,
  actor: string,
  current?: Ad
): Partial<Ad> | "DELETE" | null {
  const nowIso = new Date().toISOString();
  switch (action.type) {
    case "APPROVE":
      return { status: "active", publishedAt: nowIso, moderatedBy: actor, rejectionReason: null };
    case "REJECT":
      return { status: "rejected", rejectionReason: action.reason, moderatedBy: actor };
    case "MARK_SOLD":
      return { status: "sold", soldAt: nowIso, moderatedBy: actor };
    case "MARK_RENTED":
      return { status: "rented", soldAt: nowIso, moderatedBy: actor };
    case "REOPEN":
      return { status: "active", soldAt: null, moderatedBy: actor };
    case "TOGGLE_FEATURED":
      return { featured: !current?.featured };
    case "DELETE_AD":
      return "DELETE";
    default:
      return null;
  }
}

export async function moderateRemoteAd(
  id: string,
  patch: Partial<Ad>,
  key: string
): Promise<{ ok: boolean; error?: string; ad?: Ad }> {
  try {
    const r = await fetch(`/api/ads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patch, key }),
    });
    const j = (await r.json().catch(() => null)) as { ok?: boolean; ad?: Ad; error?: string } | null;
    if (r.ok && j?.ok) return { ok: true, ad: j.ad };
    return { ok: false, error: j?.error ?? `خطأ ${r.status}` };
  } catch {
    return { ok: false, error: "تعذّر الوصول إلى الخادم" };
  }
}

export async function deleteRemoteAd(id: string, key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(`/api/ads/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (r.ok && j?.ok) return { ok: true };
    return { ok: false, error: j?.error ?? `خطأ ${r.status}` };
  } catch {
    return { ok: false, error: "تعذّر الوصول إلى الخادم" };
  }
}
