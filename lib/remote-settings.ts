/* ==========================================================================
   lib/remote-settings.ts — جلب/نشر الإعدادات العامة (موجة 24)
   --------------------------------------------------------------------------
   الزوار يقرؤون الشريحة المنشورة (أرقام التواصل/واتساب/الشعار/فيسبوك +
   المدن) من /api/settings، والمسؤول ينشرها عند كل حفظ من اللوحة بنفس
   مفتاح النشر المستخدم للسعر والحملات. بلا KV يبقى كل متصفح على إعداداته
   المحلية (توافق رجعي كامل، كما في جسري السعر والحملات).
   ========================================================================== */

import type { City, Settings } from "./types";

/** الشريحة العامة فقط — بلا سعر الصرف (له جسر مستقل) وبلا حقول الأمان */
export type PublicSettings = Pick<
  Settings,
  | "contactPhone"
  | "contactPhone2"
  | "contactPhoneSource"
  | "whatsappCountryCode"
  | "siteSlogan"
  | "facebookUrl"
>;

export interface SettingsPayload {
  settings: PublicSettings;
  cities: City[];
  publishedAt: string;
}

/** استخراج الشريحة القابلة للنشر من إعدادات كاملة */
export function publicSettingsOf(s: Settings): PublicSettings {
  return {
    contactPhone: s.contactPhone,
    contactPhone2: s.contactPhone2,
    contactPhoneSource: s.contactPhoneSource,
    whatsappCountryCode: s.whatsappCountryCode,
    siteSlogan: s.siteSlogan,
    facebookUrl: s.facebookUrl,
  };
}

export interface RemoteSettings {
  payload: SettingsPayload | null;
  kvConfigured: boolean;
}

export async function fetchRemoteSettings(timeoutMs = 5000): Promise<RemoteSettings | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const r = await fetch("/api/settings", { signal: ctl.signal, cache: "no-store" });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = (await r.json().catch(() => null)) as RemoteSettings | null;
    if (!j || typeof j.kvConfigured !== "boolean") return null;
    return { payload: j.payload ?? null, kvConfigured: j.kvConfigured };
  } catch {
    return null;
  }
}

export type PublishSettingsResult = { ok: true; updatedAt: string } | { ok: false; error: string };

export async function publishSettings(
  payload: SettingsPayload,
  key: string
): Promise<PublishSettingsResult> {
  try {
    const r = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, key }),
    });
    const j = (await r.json().catch(() => null)) as
      | { ok?: boolean; updatedAt?: string; error?: string }
      | null;
    if (r.ok && j?.ok) return { ok: true, updatedAt: j.updatedAt ?? payload.publishedAt };
    return { ok: false, error: j?.error ?? `خطأ ${r.status}` };
  } catch {
    return { ok: false, error: "تعذّر الوصول إلى الخادم" };
  }
}
