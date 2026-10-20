/* ==========================================================================
   lib/agent/ai.ts — «الدماغ»: استدعاء نماذج اللغة (موجة 26)
   --------------------------------------------------------------------------
   يدعم مزوّدين بمفاتيح مجانية، ويُختار المزوّد تلقائياً من المتغيرات:
     AI_KEY   → Google Gemini (نموذج AI_MODEL، افتراضياً gemini-2.0-flash)
     GROQ_KEY → Groq (نموذج GROQ_MODEL، افتراضياً llama-3.3-70b-versatile)
   بلا أي مفتاح ⇒ aiConfigured()=false وكل ميزات الذكاء تتوقف بأمان
   (يبقى الموقع والمحادثات الاحتياطية بالقواعد تعمل تماماً كما قبل).
   ========================================================================== */

import { aiSettings } from "./config";

export type AiProvider = "gemini" | "groq";

/** آخر خطأ خام من المزوّد — تقرأه لوحة الوكيل وزر الاختبار للتشخيص */
export let lastAiError: string | null = null;

/** المزوّد الفعّال: متغيرات البيئة أولاً ثم الربط المحفوظ من اللوحة (26.1) */
export async function aiProvider(): Promise<AiProvider | null> {
  return (await aiSettings()).provider;
}

export async function aiConfigured(): Promise<boolean> {
  return (await aiProvider()) !== null;
}

export interface AiMessage {
  role: "user" | "assistant";
  text: string;
}

/** نداء واحد للنموذج — يعيد النص أو null عند أي فشل (لا يُسقط الموقع أبداً) */
export async function aiComplete(
  system: string,
  messages: AiMessage[],
  opts: { maxTokens?: number; timeoutMs?: number } = {}
): Promise<string | null> {
  const s0 = await aiSettings();
  const provider = s0.provider;
  if (!provider) return null;
  const maxTokens = opts.maxTokens ?? 700;
  const timeoutMs = opts.timeoutMs ?? 15000;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    if (provider === "gemini") {
      /* تتابع النماذج: المطلوب ثم الأحدث ثم المستقر — ينجو من إيقاف نموذج */
      /* 2026: أوقفت جوجل 2.0/2.5 للمفاتيح الجديدة — الافتراضي 3.8-flash */
      const models = [
        process.env.AI_MODEL || "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash",
      ].filter((m, i, arr) => arr.indexOf(m) === i);
      const body = JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        })),
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
      });
      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${s0.key}`;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctl.signal,
          body,
        });
        if (!r.ok) {
          const raw = await r.text().catch(() => "");
          lastAiError = `Gemini ${model}: HTTP ${r.status} — ${raw.slice(0, 280)}`;
          /* خطأ مفتاح/حصة لا يصلحه نموذج آخر — نكتفي */
          if (r.status === 400 || r.status === 401 || r.status === 403 || r.status === 429) return null;
          continue; /* 404 نموذج متقاعد ⇒ جرّب التالي */
        }
        const j = (await r.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
        if (text.trim()) {
          lastAiError = null;
          return text.trim();
        }
        lastAiError = `Gemini ${model}: رد فارغ (ربما فلترة أمان)`;
        return null;
      }
      return null;
    }
    /* Groq — واجهة متوافقة مع OpenAI */
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s0.key}`,
      },
      signal: ctl.signal,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          ...messages.map((m) => ({ role: m.role, content: m.text })),
        ],
      }),
    });
    if (!r.ok) {
      const raw = await r.text().catch(() => "");
      lastAiError = `Groq: HTTP ${r.status} — ${raw.slice(0, 280)}`;
      return null;
    }
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    const out = j.choices?.[0]?.message?.content?.trim() || null;
    lastAiError = out ? null : "Groq: رد فارغ";
    return out;
  } catch (e) {
    lastAiError = `استثناء: ${String(e).slice(0, 200)}`;
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** هل يطلب النموذج جواباً منظماً (JSON) — helper لقراءة JSON من رد نصي */
export function parseJsonReply<T>(text: string): T | null {
  try {
    const m = /\{[\s\S]*\}/.exec(text);
    return m ? (JSON.parse(m[0]) as T) : null;
  } catch {
    return null;
  }
}
