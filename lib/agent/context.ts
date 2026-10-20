/* ==========================================================================
   lib/agent/context.ts — سياق المنصة الحيّ للدماغ (موجة 26)
   --------------------------------------------------------------------------
   يقرأ شريحة الإعدادات المنشورة من KV (site:settings) ليحقنها في prompts
   الوكيل: أرقام التواصل الحقيقية، رابط صفحة فيسبوك، المدن المفعّلة.
   بلا KV ⇒ null ويستخدم الوكيل قيماً عامة محايدة.
   ========================================================================== */

import type { City, Settings } from "@/lib/types";

export interface AgentContext {
  contactPhone: string;
  contactPhone2?: string;
  whatsappCountryCode: string;
  facebookUrl: string;
  siteSlogan: string;
  cities: City[];
}

function kvEnv(): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL ?? process.env.KV_URL ?? "";
  const token =
    process.env.KV_REST_API_READ_ONLY_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  return { url, token };
}

export async function agentContext(): Promise<AgentContext | null> {
  const { url, token } = kvEnv();
  if (!url || !token) return null;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 3500);
    const r = await fetch(`${url}/get/site:settings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = (await r.json().catch(() => null)) as { result?: unknown } | null;
    let parsed: unknown = j?.result;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = null;
      }
    }
    const p = parsed as { settings?: Partial<Settings>; cities?: City[] } | null;
    if (!p?.settings) return null;
    return {
      contactPhone: String(p.settings.contactPhone ?? ""),
      contactPhone2: p.settings.contactPhone2 ? String(p.settings.contactPhone2) : undefined,
      whatsappCountryCode: String(p.settings.whatsappCountryCode ?? "963"),
      facebookUrl: String(p.settings.facebookUrl ?? ""),
      siteSlogan: String(p.settings.siteSlogan ?? ""),
      cities: Array.isArray(p.cities) ? p.cities : [],
    };
  } catch {
    return null;
  }
}

/** اسم مدينة من معرفها (لتعليقات فيسبوك) — null إن تعذّر */
export async function cityNameOf(cityId: string): Promise<string | null> {
  if (!cityId) return null;
  const ctx = await agentContext();
  return ctx?.cities.find((c) => c.id === cityId)?.name ?? null;
}
