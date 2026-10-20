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
      const model = process.env.AI_MODEL || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${s0.key}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctl.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.text }],
          })),
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
          /* أمان أعلى: نخفض حساسية الفلاتر للمحتوى التجاري المشروع */
        }),
      });
      if (!r.ok) return null;
      const j = (await r.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      return text.trim() || null;
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
    if (!r.ok) return null;
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    return j.choices?.[0]?.message?.content?.trim() || null;
  } catch {
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
