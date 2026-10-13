/* ==========================================================================
   qa/rate-server-e2e.mjs — دورة سعر الصرف العام عبر /api/rate
   --------------------------------------------------------------------------
   يفحص مسار الخادم نفسه (Upstash KV في الإنتاج، ذاكرة تطويرية محلياً):
     · GET قبل أي نشر  ← سعر الكود احتياطياً
     · POST بمفتاح خاطئ / بلا مفتاح ← 401
     · POST بسعر غير منطقي ← 422
     · POST صحيح ← ok ثم GET يعكسه
     · زائر جديد (سياق متصفح منفصل) يرى التحويل بالسعر المنشور
     · نشر من اللوحة بواجهة المفتاح يصل إلى GET
   التشغيل: RATE_WRITE_KEY=qa-key-123 BASE_URL=http://localhost:3001 \
            node qa/rate-server-e2e.mjs
   ========================================================================== */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const BASE = process.env.BASE_URL || "http://localhost:3001";
const KEY = process.env.RATE_WRITE_KEY || "qa-key-123";
let pass = 0;
let fail = 0;
const ok = (label, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const getRate = async () => {
  const r = await fetch(`${BASE}/api/rate`, { cache: "no-store" });
  return { status: r.status, body: await r.json() };
};
const postRate = async (rate, key) => {
  const r = await fetch(`${BASE}/api/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(key === undefined ? { rate } : { rate, key }),
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};

/* تصفير ذاكرة التطوير كي تبدأ الجولة من سعر الكود (بدون إعادة تشغيل الخادم) */
await fetch(`${BASE}/api/rate`, { method: "DELETE" }).catch(() => {});

/* ─────────── ① مستوى الـ API ─────────── */
console.log("① مسار /api/rate على مستوى الخادم…");
const first = await getRate();
ok("GET قبل أي نشر يرجع سعر الكود احتياطياً", first.status === 200 && first.body.usdToSyp === 13000, JSON.stringify(first.body));

const badKey = await postRate(14500, "wrong-key");
ok("مفتاح خاطئ ← 401 ولا كتابة", badKey.status === 401);
const noKey = await postRate(14500);
ok("بلا مفتاح ← 401", noKey.status === 401);
const absurd = await postRate(50, KEY);
ok("سعر 50 ← 422 (رفض منطقي)", absurd.status === 422);
const huge = await postRate(99_000_000, KEY);
ok("سعر 99 مليون ← 422", huge.status === 422);
const afterBad = await getRate();
ok("المحاولات المرفوضة لم تغيّر السعر", afterBad.body.usdToSyp === 13000);

const good = await postRate(14500, KEY);
ok("نشر صحيح ← ok + طابع زمني", good.status === 200 && good.body.ok === true && !!good.body.updatedAt);
const reflected = await getRate();
ok("GET يعكس السعر المنشور فوراً", reflected.body.usdToSyp === 14500 && reflected.body.source !== "default", JSON.stringify(reflected.body));

/* ─────────── ② زائر جديد يرى السعر المنشور ─────────── */
console.log("\n② زائر بسياق متصفح منفصل…");
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const visitor = await browser.createBrowserContext();
const vpage = await visitor.newPage();
await vpage.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2", timeout: 60000 });
await wait(2200);
await vpage.evaluate(() => {
  const byLabel = (txt) => {
    const labels = Array.from(document.querySelectorAll("label")).filter((x) =>
      x.textContent.trim().startsWith(txt)
    );
    for (const l of labels) {
      const box = l.closest("[data-error]") ?? l.parentElement;
      const el = box?.querySelector(
        'input:not([type="checkbox"]):not([type="radio"]):not([type="file"])'
      );
      if (el) return el;
    }
    return null;
  };
  const el = byLabel("السعر");
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, "100");
  el.dispatchEvent(new Event("input", { bubbles: true }));
});
await wait(700);
const vText = await vpage.evaluate(() => {
  const p = Array.from(document.querySelectorAll("p")).find((x) =>
    x.textContent.includes("سيُعرض السعر بالعملتين")
  );
  return (p?.textContent ?? "").replace(/\s+/g, " ");
});
ok("تحويل الزائر يستخدم السعر المنشور (1,450,000 ل.س)", vText.includes("1,450,000"), vText.slice(0, 70));

/* ─────────── ③ النشر من واجهة اللوحة ─────────── */
console.log("\n③ النشر من لوحة التحكم بواجهة المفتاح…");
const adminCtx = await browser.createBrowserContext();
const apage = await adminCtx.newPage();
await apage.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
await wait(1500);
await apage.evaluate(() => {
  const setVal = (el, v) => {
    if (!el) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setVal(document.querySelector('input[placeholder="اسم المستخدم"]'), "admin");
  setVal(document.querySelector('input[type="password"]'), "Badeel@2026");
});
await wait(300);
await apage.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(2800);
await apage.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("الإعدادات والأمان"))
    ?.click();
});
await wait(1500);

/* كتابة المفتاح في حقله داخل اللوحة (لا زرع مباشر هنا — نختبر الواجهة) */
const keyTyped = await apage.evaluate((k) => {
  const label = Array.from(document.querySelectorAll("label")).find((x) =>
    x.textContent.includes("مفتاح النشر")
  );
  const input = label?.parentElement?.querySelector('input[type="password"]');
  if (!input) return false;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, k);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}, KEY);
ok("حقل مفتاح النشر موجود وقابل للكتابة", keyTyped);
await wait(600); /* ننتظر تحديث حالة React قبل blur حتى يُخزَّن المفتاح */
await apage.evaluate(() => {
  const label = Array.from(document.querySelectorAll("label")).find((x) =>
    x.textContent.includes("مفتاح النشر")
  );
  const keyInput = label?.parentElement?.querySelector('input[type="password"]');
  keyInput?.focus(); /* blur لا يُطلق حدثاً إلا على عنصر مُركَّز فعلياً */
  keyInput?.blur();
});
await wait(500);
const storedKey = await apage.evaluate(() => localStorage.getItem("badeel.rateWriteKey.v1"));
console.log(`   [تشخيص] المفتاح المخزَّن في المتصفح: ${storedKey ?? "null"}`);

/* ضبط السعر 14700 ثم حفظ */
await apage.evaluate(() => {
  const input = Array.from(document.querySelectorAll('input[type="number"][dir="ltr"]')).find((i) =>
    i.closest("div")?.parentElement?.textContent.includes("سعر صرف الدولار")
  );
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "14700");
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
await wait(400);
await apage.evaluate(() => {
  const form = Array.from(document.querySelectorAll("form")).find((f) =>
    f.textContent.includes("سعر صرف الدولار")
  );
  form?.querySelector('button[type="submit"]')?.click();
});
await wait(2000);
const panelToast = await apage.evaluate(() =>
  Array.from(document.querySelectorAll('[role="status"]')).map((t) => t.textContent.trim())
);
ok(
  "اللوحة أعلنت النشر العام",
  panelToast.some((t) => /تم الحفظ والنشر لكل الزوار/.test(t)),
  panelToast[0]?.slice(0, 50) ?? ""
);
const afterPanel = await getRate();
ok("GET يؤكد سعر اللوحة المنشور 14700", afterPanel.body.usdToSyp === 14700, JSON.stringify(afterPanel.body));

/* زائر ثالث بعد النشر من اللوحة */
const visitor2 = await browser.createBrowserContext();
const v2 = await visitor2.newPage();
await v2.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2" });
await wait(2200);
await v2.evaluate(() => {
  const byLabel = (txt) => {
    const labels = Array.from(document.querySelectorAll("label")).filter((x) =>
      x.textContent.trim().startsWith(txt)
    );
    for (const l of labels) {
      const box = l.closest("[data-error]") ?? l.parentElement;
      const el = box?.querySelector(
        'input:not([type="checkbox"]):not([type="radio"]):not([type="file"])'
      );
      if (el) return el;
    }
    return null;
  };
  const el = byLabel("السعر");
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, "100");
  el.dispatchEvent(new Event("input", { bubbles: true }));
});
await wait(700);
const v2Text = await v2.evaluate(() => {
  const p = Array.from(document.querySelectorAll("p")).find((x) =>
    x.textContent.includes("سيُعرض السعر بالعملتين")
  );
  return (p?.textContent ?? "").replace(/\s+/g, " ");
});
ok("زائر جديد بعد نشر اللوحة يرى 1,470,000 ل.س", v2Text.includes("1,470,000"), v2Text.slice(0, 70));

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
