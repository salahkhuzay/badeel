/* ==========================================================================
   lib/agent/config.ts — ربط القنوات من اللوحة نفسها (موجة 26.1)
   --------------------------------------------------------------------------
   شكاية الإنتاج: «لم ينجح الأمر مع فيسبوك» لأن متغيرات Vercel إما لم تُضف أو
   أُضيفت بلا إعادة نشر. الحل: يخزن المسؤول مفاتيح الربط (فيسبوك/واتساب/
   الدماغ) في KV بمفتاح site:agentconfig عبر اللوحة مباشرة — بلا Vercel وبلا
   إعادة نشر. متغيرات البيئة تبقى مدعومة وأولويتها أعلى (للمنشآت الأكبر).
   الأسرار لا تُعرض أبداً: اللوحة ترى آخر 4 أحرف فقط.
   ========================================================================== */

export interface AgentConfig {
  /* فيسبوك */
  fbPageId?: string;
  fbPageToken?: string;
  /* واتساب Cloud API */
  waToken?: string;
  waPhoneId?: string;
  waVerifyToken?: string;
  waNotifyTo?: string;
  /* الدماغ */
  aiKey?: string; // Gemini
  groqKey?: string; // Groq (بديل)
  openrouterKey?: string; // OpenRouter (مجمّع نماذج — بديل عند الحظر الجغرافي)
  mistralKey?: string; // Mistral (بديل أوروبي)
  /* سلوك */
  autoApprove?: boolean;
}

const KV_KEY = "site:agentconfig";
const USE_DEV_MEMORY = process.env.RATE_DEV_MEMORY === "1";
let devConfig: AgentConfig = {};

const FIELDS: (keyof AgentConfig)[] = [
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
];

function kvEnv(readOnly: boolean): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL ?? process.env.KV_URL ?? "";
  const token = readOnly
    ? (process.env.KV_REST_API_READ_ONLY_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "")
    : (process.env.KV_REST_API_TOKEN ?? "");
  return { url, token };
}

/** قراءة إعداد الربط المحفوظ من اللوحة */
export async function agentConfigRead(): Promise<AgentConfig> {
  if (USE_DEV_MEMORY) return devConfig;
  const { url, token } = kvEnv(true);
  if (!url || !token) return {};
  try {
    const r = await fetch(`${url}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return {};
    const j = (await r.json().catch(() => null)) as { result?: unknown } | null;
    let parsed: unknown = j?.result;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = null;
      }
    }
    if (!parsed || typeof parsed !== "object") return {};
    const out: AgentConfig = {};
    const src = parsed as Record<string, unknown>;
    for (const f of FIELDS) {
      if (f === "autoApprove") {
        if (typeof src[f] === "boolean") out.autoApprove = src[f] as boolean;
      } else if (typeof src[f] === "string" && (src[f] as string).trim()) {
        (out as Record<string, string>)[f] = (src[f] as string).trim();
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** حفظ/تحديث حقول الربط (سلسلة فارغة ⇒ مسح الحقل) */
export async function agentConfigWrite(patch: Record<string, unknown>): Promise<boolean> {
  const cur = await agentConfigRead();
  const next: AgentConfig = { ...cur };
  for (const f of FIELDS) {
    if (!(f in patch)) continue;
    if (f === "autoApprove") {
      next.autoApprove = Boolean(patch[f]);
      continue;
    }
    const v = patch[f];
    if (typeof v !== "string") continue;
    if (v.trim()) (next as Record<string, string>)[f] = v.trim();
    else delete (next as Record<string, unknown>)[f];
  }
  if (USE_DEV_MEMORY) {
    devConfig = next;
    return true;
  }
  const { url, token } = kvEnv(false);
  if (!url || !token) return false;
  try {
    const w = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["SET", KV_KEY, JSON.stringify(next)]),
      cache: "no-store",
    });
    if (!w.ok) return false;
    const wj = (await w.json().catch(() => null)) as { result?: unknown } | null;
    return wj?.result === "OK";
  } catch {
    return false;
  }
}

/* ------------------- القيم الفعّالة (البيئة أولاً ثم اللوحة) ------------------- */

export interface FbSettings {
  pageId: string;
  token: string;
  source: "env" | "panel" | null;
}
export async function fbSettings(): Promise<FbSettings> {
  const envId = process.env.FB_PAGE_ID ?? "";
  const envTok = process.env.FB_PAGE_TOKEN ?? "";
  if (envId && envTok) return { pageId: envId, token: envTok, source: "env" };
  const cfg = await agentConfigRead();
  if (cfg.fbPageId && cfg.fbPageToken)
    return { pageId: cfg.fbPageId, token: cfg.fbPageToken, source: "panel" };
  return { pageId: "", token: "", source: null };
}

export interface WaSettings {
  token: string;
  phoneId: string;
  verifyToken: string;
  notifyTo: string;
  source: "env" | "panel" | null;
}
export async function waSettings(): Promise<WaSettings> {
  const envTok = process.env.WA_TOKEN ?? "";
  const envPhone = process.env.WA_PHONE_NUMBER_ID ?? "";
  if (envTok && envPhone) {
    return {
      token: envTok,
      phoneId: envPhone,
      verifyToken: process.env.WA_VERIFY_TOKEN ?? "",
      notifyTo: (process.env.WA_NOTIFY_TO ?? "").replace(/\D/g, ""),
      source: "env",
    };
  }
  const cfg = await agentConfigRead();
  if (cfg.waToken && cfg.waPhoneId) {
    return {
      token: cfg.waToken,
      phoneId: cfg.waPhoneId,
      verifyToken: cfg.waVerifyToken ?? process.env.WA_VERIFY_TOKEN ?? "",
      notifyTo: (cfg.waNotifyTo ?? "").replace(/\D/g, ""),
      source: "panel",
    };
  }
  /* ربط جزئي من اللوحة (مثل رقم الإشعار فقط) — لا يفعّل الإرسال */
  return { token: "", phoneId: "", verifyToken: cfg.waVerifyToken ?? "", notifyTo: (cfg.waNotifyTo ?? "").replace(/\D/g, ""), source: null };
}

export type AiProviderName = "gemini" | "groq" | "openrouter" | "mistral";

export interface AiSettings {
  provider: AiProviderName | null;
  key: string;
  source: "env" | "panel" | null;
}
export async function aiSettings(): Promise<AiSettings> {
  const envAi = (process.env.AI_KEY ?? "").trim();
  const envGroq = (process.env.GROQ_KEY ?? "").trim();
  const envOr = (process.env.OPENROUTER_KEY ?? "").trim();
  const envMi = (process.env.MISTRAL_KEY ?? "").trim();
  if (envAi) return { provider: "gemini", key: envAi, source: "env" };
  if (envGroq) return { provider: "groq", key: envGroq, source: "env" };
  if (envOr) return { provider: "openrouter", key: envOr, source: "env" };
  if (envMi) return { provider: "mistral", key: envMi, source: "env" };
  const cfg = await agentConfigRead();
  if (cfg.aiKey) return { provider: "gemini", key: cfg.aiKey, source: "panel" };
  if (cfg.groqKey) return { provider: "groq", key: cfg.groqKey, source: "panel" };
  if (cfg.openrouterKey) return { provider: "openrouter", key: cfg.openrouterKey, source: "panel" };
  if (cfg.mistralKey) return { provider: "mistral", key: cfg.mistralKey, source: "panel" };
  return { provider: null, key: "", source: null };
}

export async function autoApproveOn(): Promise<boolean> {
  if (process.env.AUTO_APPROVE === "1") return true;
  const cfg = await agentConfigRead();
  return cfg.autoApprove === true;
}

/** تمويه سرّ للعرض في اللوحة — آخر 4 أحرف فقط */
export function maskSecret(s: string | undefined): string | null {
  if (!s) return null;
  return `••••${s.slice(-4)}`;
}
