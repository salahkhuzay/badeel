/* ==========================================================================
   lib/remote-rate.ts — جسر سعر الصرف العام بين اللوحة والمخزن السحابي
   --------------------------------------------------------------------------
   المنصة بلا خادم لإدارة المحتوى، لكن سعر الصرف صار قيمة **عامة** تُخزَّن في
   Upstash KV (مرتبط بمشروع Vercel) ويقرأها كل الزوار عبر مسار /api/rate:
     GET  /api/rate  ← السعر الرسمي الحالي (kv) أو سعر الكود احتياطاً (default)
     POST /api/rate  ← نشر سعر جديد، محمي بمفتاح RATE_WRITE_KEY الموجود في
                       متغيّرات Vercel فقط (لا يظهر في المتصفح ولا في المستودع)
   ========================================================================== */

export interface RemoteRate {
  usdToSyp: number;
  updatedAt: string | null;
  source: "kv" | "default" | "dev-memory";
}

/* مفتاح النشر يُحفظ في متصفح المسؤول فقط بعد إدخاله مرة واحدة */
const KEY_STORAGE = "badeel.rateWriteKey.v1";

export function getRateKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setRateKey(v: string): void {
  try {
    if (v) localStorage.setItem(KEY_STORAGE, v);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* تجاهل: وضع خاص أو تخزين معطّل */
  }
}

/** قراءة السعر الرسمي من الخادم (بمهلة قصيرة حتى لا نعلّق الواجهة) */
export async function fetchRemoteRate(timeoutMs = 5000): Promise<RemoteRate | null> {
  if (typeof window === "undefined") return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch("/api/rate", { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) return null;
    const j = (await res.json()) as Partial<RemoteRate>;
    if (!Number.isFinite(j?.usdToSyp ?? NaN) || (j!.usdToSyp as number) < 100) return null;
    return {
      usdToSyp: j!.usdToSyp as number,
      updatedAt: j?.updatedAt ?? null,
      source: (j?.source as RemoteRate["source"]) ?? "default",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export type PublishResult =
  | { ok: true; updatedAt: string }
  | { ok: false; status: number; error: string };

/** نشر سعر جديد لكل الزوار — يفشل بأمان إن غاب المفتاح أو تعذّر الاتصال */
export async function publishRemoteRate(rate: number, key: string): Promise<PublishResult> {
  try {
    const res = await fetch("/api/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate, key }),
    });
    const j = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      updatedAt?: string;
    };
    if (res.ok && j?.ok) return { ok: true, updatedAt: j.updatedAt ?? new Date().toISOString() };
    return { ok: false, status: res.status, error: j?.error ?? `فشل النشر (رمز ${res.status})` };
  } catch {
    return { ok: false, status: 0, error: "تعذّر الاتصال بالخادم" };
  }
}
