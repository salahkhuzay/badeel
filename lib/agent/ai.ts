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

export type AiProvider = "gemini" | "groq" | "openrouter" | "mistral";

/* المزودات المتوافقة مع واجهة OpenAI — نقطة واحدة و3 خدمات */
const OPENAI_LIKE: Record<
  Exclude<AiProvider, "gemini">,
  { base: string; modelEnv: string; defModel: string }
> = {
  groq: {
    base: "https://api.groq.com/openai/v1",
    modelEnv: "GROQ_MODEL",
    defModel: "llama-3.3-70b-versatile",
  },
  openrouter: {
    base: "https://openrouter.ai/api/v1",
    modelEnv: "OPENROUTER_MODEL",
    /* سلسلة مجانية مؤكدة 2026 — gemma ثم nemotron ثم minimax ثم auto */
    defModel: "google/gemma-4-26b-a4b-it:free",
  },
  mistral: {
    base: "https://api.mistral.ai/v1",
    modelEnv: "MISTRAL_MODEL",
    defModel: "mistral-small-latest",
  },
};

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
    /* المزودات المتوافقة مع OpenAI: Groq / OpenRouter / Mistral */
    const like = OPENAI_LIKE[provider as Exclude<AiProvider, "gemini">];
    /* سلسلة النماذج: المطلوب ثم بدائل مجانية مؤكدة (openrouter) */
    const chain =
      provider === "openrouter"
        ? [
            process.env[like.modelEnv] || like.defModel,
            "google/gemma-4-31b-it:free",
            "nvidia/nemotron-3.5-lightning:free",
            "minimax/minimax-m3.1-flash:free",
            "openrouter/auto",
          ].filter((m, i, arr) => arr.indexOf(m) === i)
        : [process.env[like.modelEnv] || like.defModel];
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${s0.key}`,
    };
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = "https://badeel-online.vercel.app";
      headers["X-Title"] = "Badeel Online Agent";
    }
    for (const model of chain) {
      const r = await fetch(`${like.base}/chat/completions`, {
        method: "POST",
        headers,
        signal: ctl.signal,
        cache: "no-store",
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
        lastAiError = `${provider} ${model}: HTTP ${r.status} — ${raw.slice(0, 240)}`;
        /* 402 بلا رصيد / 404 نموذج متقاعد / 429 ضغط مؤقت ⇒ جرّب التالي في السلسلة */
        if (r.status === 402 || r.status === 404 || r.status === 429 || r.status === 503) continue;
        return null;
      }
      const j = (await r.json().catch(() => ({}))) as Record<string, any>;
      let contentStr = "";
      const rawContent = j.choices?.[0]?.message?.content;
      if (typeof rawContent === "string") {
        contentStr = rawContent;
      } else if (Array.isArray(rawContent)) {
        contentStr = rawContent.map((p: any) => (typeof p === "string" ? p : p?.text || "")).join("");
      }
      if (!contentStr && j.choices?.[0]?.text) {
        contentStr = String(j.choices[0].text);
      }
      if (!contentStr && j.choices?.[0]?.message?.reasoning) {
        contentStr = String(j.choices[0].message.reasoning);
      }
      const out = contentStr.trim() || null;
      if (out) {
        lastAiError = null;
        return out;
      }
      lastAiError = `${provider} ${model}: رد فارغ (${JSON.stringify(j).slice(0, 160)})`;
      continue;
    }
    return null;
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
