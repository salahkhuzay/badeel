/* ============================================================================
   فحص الوكيل الذكي — موجة 26
   يشغّل محاكي Supabase + نسخة Next على :3003 بمفتاح نشر و WA_VERIFY_TOKEN
   وذاكرة تطويرية للسجل، «بلا» مفاتيح AI/FB/WA — الهدف: التدهور الآمن الكامل
   (graceful degradation) + نقاط الوكيل + الودجت المحلي.
   التشغيل: node qa/wave26-agent.mjs
   ========================================================================== */
import { spawn } from "node:child_process";
import puppeteer from "puppeteer";

const KEY = "qa-key-123";
const BASE = "http://localhost:3003";
const STUB = 9878;
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`✅ ${name}`); }
  else { fail++; console.log(`❌ ${name} — ${extra}`); }
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const stub = spawn("node", ["qa/supabase-stub.mjs", String(STUB)], { stdio: "ignore" });
const srv = spawn("./node_modules/.bin/next", ["start", "-H", "0.0.0.0", "-p", "3003"], {
  env: {
    ...process.env,
    SUPABASE_URL: `http://localhost:${STUB}`,
    SUPABASE_SERVICE_ROLE_KEY: "stub-key",
    RATE_WRITE_KEY: KEY,
    RATE_DEV_MEMORY: "1",
    WA_VERIFY_TOKEN: "vtoken-qa",
  },
  stdio: "ignore",
});
const cleanup = () => { stub.kill(); srv.kill(); };
process.on("exit", cleanup);

let up = false;
for (let i = 0; i < 60 && !up; i++) {
  await wait(1000);
  up = await fetch(BASE, { cache: "no-store" }).then((r) => r.ok).catch(() => false);
}
if (!up) { console.log("❌ الخادم :3003 لم يستجب"); cleanup(); process.exit(1); }

/* ① حالة الوكيل محمية بالمفتاح */
const s401 = await fetch(`${BASE}/api/integrations/status?key=wrong`, { cache: "no-store" });
ok("حالة الوكيل: مفتاح خاطئ ⇒ 401", s401.status === 401, `HTTP ${s401.status}`);

/* ② الحالة الصحيحة: كل القنوات غير مضبوطة + سجل فارغ */
const st = await fetch(`${BASE}/api/integrations/status?key=${KEY}`, { cache: "no-store" }).then((r) => r.json());
ok(
  "الحالة: ai/facebook/whatsapp=false والسجل مصفوفة",
  st.ai === false && st.facebook === false && st.whatsapp === false && Array.isArray(st.log) && st.autoApprove === false,
  JSON.stringify(st).slice(0, 140)
);

/* ③ محادثة بلا دماغ ⇒ ai:false وتدهور آمن */
const ai = await fetch(`${BASE}/api/ai`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "كيف أنشر إعلاناً؟" }),
}).then((r) => r.json());
ok("محادثة بلا مفتاح ⇒ {ai:false} بلا خطأ", ai.ai === false && ai.reply === null, JSON.stringify(ai));

/* ④ رسالة فارغة ⇒ 400 */
const ai400 = await fetch(`${BASE}/api/ai`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "" }),
});
ok("محادثة فارغة ⇒ 400", ai400.status === 400, `HTTP ${ai400.status}`);

/* ⑤⑥ تحقق webhook واتساب */
const waOk = await fetch(
  `${BASE}/api/integrations/whatsapp?hub.mode=subscribe&hub.verify_token=vtoken-qa&hub.challenge=4242`,
  { cache: "no-store" }
);
const waTxt = await waOk.text();
ok("webhook واتساب: رمز صحيح ⇒ يتحدى 4242", waOk.status === 200 && waTxt === "4242", `${waOk.status}:${waTxt}`);
const waBad = await fetch(
  `${BASE}/api/integrations/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=1`,
  { cache: "no-store" }
);
ok("webhook واتساب: رمز خاطئ ⇒ 403", waBad.status === 403, `HTTP ${waBad.status}`);

/* ⑦ نشر إعلان جديد: التنقيح بلا دماغ لا يغيّر الدورة (pending) */
const tiny = "data:image/jpeg;base64," + "A".repeat(4000);
const ad = {
  id: "ad-agent-1",
  ref: "BD-9601",
  title: "شقة فحص الوكيل الذكي",
  description: "إعلان اختبار لموجة الوكيل.",
  category: "real-estate",
  status: "active",
  price: 500, currency: "USD", priceUsd: 500, priceSyp: 6500000, negotiable: false,
  cityId: "manbij",
  images: [tiny],
  sellerName: "فاحص", sellerPhone: "0933177597", sellerWhatsapp: "0933177597",
  featured: false, views: 0, createdAt: new Date().toISOString(),
};
const post = await fetch(`${BASE}/api/ads`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ad }),
}).then((r) => r.json());
ok("نشر زائر مع الوكيل ⇒ يبقى pending (بلا دماغ)", post.ok === true && post.ad.status === "pending", JSON.stringify(post).slice(0, 140));

/* ⑧ الموافقة بلا فيسبوك مضبوط ⇒ تعمل دون أخطاء */
const pat = await fetch(`${BASE}/api/ads/ad-agent-1`, {
  method: "PATCH", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: KEY, patch: { status: "active", publishedAt: new Date().toISOString(), moderatedBy: "admin" } }),
}).then((r) => r.json());
ok("موافقة بلا FB مضبوط ⇒ ok وتفعيل", pat.ok === true && pat.ad.status === "active", JSON.stringify(pat).slice(0, 140));

/* ⑨تلقيم RSS: الإعلان المفعّل يظهر فوراً بصورته ورابطه */
const feed = await fetch(`${BASE}/feed.xml`, { cache: "no-store" }).then((r) => r.text());
ok(
  "تلقيم RSS: صالح وفيه الإعلان المفعّل ورابطه",
  feed.includes("<rss") && feed.includes("BD-8001") && feed.includes("/ad/BD-8001") && feed.includes("media:content"),
  feed.slice(0, 120)
);

/* ⑩ اختبار قناة بلا إعداد ⇒ رسالة عربية واضحة لا انهيار */
const tst = await fetch(`${BASE}/api/integrations/test`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: KEY, channel: "ai" }),
}).then((r) => r.json());
ok("زر اختبار AI بلا مفتاح ⇒ ok:false مع سبب", tst.ok === false && String(tst.error || "").includes("مفتاح"), JSON.stringify(tst));

/* ⑪ حفظ الربط محمي بالمفتاح */
const c401 = await fetch(`${BASE}/api/integrations/config`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "wrong", patch: { fbPageId: "1" } }),
});
ok("حفظ الربط: مفتاح خاطئ ⇒ 401", c401.status === 401, `HTTP ${c401.status}`);

/* ⑫ ربط فيسبوك من اللوحة ⇒ مفعّل فوراً مع تمويه السر */
const cfb = await fetch(`${BASE}/api/integrations/config`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: KEY, patch: { fbPageId: "12345", fbPageToken: "fbtok-abcd" } }),
}).then((r) => r.json());
const st2 = await fetch(`${BASE}/api/integrations/status?key=${KEY}`, { cache: "no-store" }).then((r) => r.json());
ok(
  "ربط فيسبوك من اللوحة ⇒ facebook:true ومصدر panel وتمويه ••••abcd",
  cfb.ok === true && st2.facebook === true && st2.fbSource === "panel" && st2.fbPageId === "12345" && st2.fbTokenMasked === "••••abcd",
  JSON.stringify(st2).slice(0, 160)
);

/* ⑬ ربط الدماغ من اللوحة ⇒ ai:true ولا يظهر المفتاح كاملاً */
await fetch(`${BASE}/api/integrations/config`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: KEY, patch: { aiKey: "AIZA-testkey123" } }),
}).then((r) => r.json());
const st3 = await fetch(`${BASE}/api/integrations/status?key=${KEY}`, { cache: "no-store" }).then((r) => r.json());
ok(
  "ربط الدماغ من اللوحة ⇒ ai:true ومموه",
  st3.ai === true && st3.aiSource === "panel" && st3.aiKeyMasked === "••••y123",
  JSON.stringify({ ai: st3.ai, m: st3.aiKeyMasked })
);

/* ⑭ ربط واتساب من اللوحة ⇒ رمز تحقق اللوحة يُقبل في الـwebhook */
await fetch(`${BASE}/api/integrations/config`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: KEY, patch: { waToken: "watok", waPhoneId: "105", waVerifyToken: "ptok", waNotifyTo: "963933177597" } }),
}).then((r) => r.json());
const wa2 = await fetch(
  `${BASE}/api/integrations/whatsapp?hub.mode=subscribe&hub.verify_token=ptok&hub.challenge=777`,
  { cache: "no-store" }
);
const st4 = await fetch(`${BASE}/api/integrations/status?key=${KEY}`, { cache: "no-store" }).then((r) => r.json());
ok(
  "ربط واتساب من اللوحة ⇒ webhook يقبل رمز اللوحة والحالة مفعّلة",
  wa2.status === 200 && (await wa2.text()) === "777" && st4.whatsapp === true && st4.waNotifyTo === "963933177597",
  `HTTP ${wa2.status}`
);

/* ⑯ تبديل الدماغ: مسح Gemini وربط OpenRouter من اللوحة */
await fetch(`${BASE}/api/integrations/config`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: KEY, patch: { aiKey: "", openrouterKey: "or-key-1234" } }),
}).then((r) => r.json());
const st5 = await fetch(`${BASE}/api/integrations/status?key=${KEY}`, { cache: "no-store" }).then((r) => r.json());
ok(
  "تبديل المزوّد: Gemini يُمسح وOpenRouter يحل محله",
  st5.ai === true && st5.aiProvider === "openrouter" && st5.aiSource === "panel",
  JSON.stringify({ ai: st5.ai, p: st5.aiProvider })
);

/* ⑰ الودجت في المتصفح: يفتح ويرد محلياً بالقواعد */
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector('[data-qa="agent-chat-btn"]', { timeout: 15000 });
  await page.click('[data-qa="agent-chat-btn"]');
  await page.waitForSelector('[data-qa="agent-chat-panel"]', { timeout: 8000 });
  ok("الودجت: الزر يفتح نافذة المحادثة", true);
  await page.type('[data-qa="agent-chat-input"]', "كيف أنشر إعلاناً؟");
  await page.click('[data-qa="agent-chat-send"]');
  await page.waitForFunction(
    () => document.querySelectorAll('[data-qa="agent-msg-bot"]').length >= 2,
    { timeout: 20000 }
  );
  const botTxt = await page.$$eval('[data-qa="agent-msg-bot"]', (ns) => ns[ns.length - 1].textContent ?? "");
  ok(
    "الودجت: رد احتياطي محلي يشرح النشر",
    botTxt.includes("أضف إعلانك") || botTxt.includes("مجاني"),
    botTxt.slice(0, 80)
  );
} finally {
  await browser.close();
}

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
cleanup();
process.exit(fail ? 1 : 0);
