/* ==========================================================================
   lib/agent/log.ts — سجل نشاط الوكيل (موجة 26)
   --------------------------------------------------------------------------
   يخزن آخر 40 حدثاً (محادثة/تنقيح/نشر فيسبوك/واتساب) في KV بمفتاح
   site:agentlog بنفس نمط جسر الإعدادات. بلا KV ⇒ سجل في ذاكرة الوظيفة
   (يظهر في اللوحة ما دامت الوظيفة حية) ولا ينكسر شيء.
   ========================================================================== */

export type AgentKind = "chat" | "moderation" | "facebook" | "whatsapp" | "system";

export interface AgentEntry {
  at: string; // ISO
  kind: AgentKind;
  text: string; // سطر عربي قصير يقرأه المسؤول في اللوحة
}

const KV_KEY = "site:agentlog";
const CAP = 40;
const USE_DEV_MEMORY = process.env.RATE_DEV_MEMORY === "1";
let devLog: AgentEntry[] = [];

function kvEnv(readOnly: boolean): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL ?? process.env.KV_URL ?? "";
  const token = readOnly
    ? (process.env.KV_REST_API_READ_ONLY_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "")
    : (process.env.KV_REST_API_TOKEN ?? "");
  return { url, token };
}

/** قراءة السجل (الأحدث أولاً) */
export async function agentLogRead(): Promise<AgentEntry[]> {
  if (USE_DEV_MEMORY) return devLog;
  const { url, token } = kvEnv(true);
  if (!url || !token) return [];
  try {
    const r = await fetch(`${url}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return [];
    const j = (await r.json().catch(() => null)) as { result?: unknown } | null;
    let parsed: unknown = j?.result;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = null;
      }
    }
    return Array.isArray(parsed) ? (parsed as AgentEntry[]).slice(0, CAP) : [];
  } catch {
    return [];
  }
}

/** إضافة حدث — لا ترمي استثناءات أبداً (الوكيل يراقب ولا يعطّل السوق) */
export async function agentLog(kind: AgentKind, text: string): Promise<void> {
  const entry: AgentEntry = { at: new Date().toISOString(), kind, text };
  if (USE_DEV_MEMORY) {
    devLog = [entry, ...devLog].slice(0, CAP);
    return;
  }
  const { url, token } = kvEnv(false);
  if (!url || !token) return;
  try {
    const cur = await agentLogRead();
    const next = [entry, ...cur].slice(0, CAP);
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", KV_KEY, JSON.stringify(next)]),
      cache: "no-store",
    });
  } catch {
    /* السجل ترف — لا يُفشل أي عملية */
  }
}
