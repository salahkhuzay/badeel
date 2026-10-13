/* ==========================================================================
   qa/admin-recovery-e2e.mjs — استرجاع الدخول بلا خادم (2026-10-13)
   --------------------------------------------------------------------------
   يحاكي الحالة التي وقعت فعلياً: متصفح يحمل بصمة كلمة مرور مخصّصة/قديمة
   (passwordChanged=true) فتُرفض الكلمة الافتراضية الصحيحة.
   التحقق: زر «نسيت كلمة المرور؟ صفّر دخول هذا المتصفح» يعيد الافتراضية
   ويصفّي العدّاد، فينجح الدخول بعدها — بلا أي أثر على بقية الحالة.
   التشغيل: node qa/admin-recovery-e2e.mjs
   ========================================================================== */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const BASE = process.env.BASE_URL || "http://localhost:3000";
let pass = 0;
let fail = 0;
const ok = (label, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
page.on("dialog", (d) => d.accept()); /* الموافقة على نافذة التأكيد */
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});

/* ① زراعة الحالة المكسورة: بصمة خاطئة + passwordChanged + عدّاد محاولات */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2", timeout: 60000 });
await wait(1500);
await page.evaluate(() => {
  const KEY = "badeel.state.v1";
  const raw = localStorage.getItem(KEY);
  const st = raw ? JSON.parse(raw) : {};
  st.settings = st.settings ?? {};
  st.settings.adminHash = "deadbeef".repeat(16);
  st.settings.adminSalt = "saltsalt";
  st.settings.passwordChanged = true;
  st.auth = { ...(st.auth ?? {}), failedAttempts: 3, lockedUntil: null };
  localStorage.setItem(KEY, JSON.stringify(st));
});
await page.reload({ waitUntil: "networkidle2" });
await wait(1500);

await page.evaluate(() => {
  const setVal = (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setVal(document.querySelector('input[placeholder="اسم المستخدم"]'), "admin");
  setVal(document.querySelector('input[type="password"]'), "Badeel@2026");
});
await wait(300);
await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(2500);
const rejected = await page.evaluate(() => /بيانات الدخول غير صحيحة/.test(document.body.innerText));
ok("الحالة المكسورة ترفض الكلمة الافتراضية فعلاً (محاكاة واقع المستخدم)", rejected);

/* ② زر الاسترجاع موجود */
const hasReset = await page.evaluate(() =>
  Array.from(document.querySelectorAll("button")).some((b) =>
    b.textContent.includes("نسيت كلمة المرور؟ صفّر دخول هذا المتصفح")
  )
);
ok("زر «نسيت كلمة المرور؟ صفّر دخول هذا المتصفح» ظاهر في صفحة الدخول", hasReset);

/* ③ الضغط عليه يعيد الافتراضية */
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent.includes("نسيت كلمة المرور؟ صفّر دخول هذا المتصفح"))
    ?.click();
});
await wait(1200);
const restored = await page.evaluate(() => {
  const st = JSON.parse(localStorage.getItem("badeel.state.v1") ?? "{}");
  return {
    changed: st.settings?.passwordChanged === false,
    attempts: st.auth?.failedAttempts ?? 0,
    hashNotDead: st.settings?.adminHash !== "deadbeef".repeat(16),
  };
});
ok("التصفير أعاد passwordChanged=false والبصمة الافتراضية", restored.changed && restored.hashNotDead);
ok("عدّاد المحاولات صُفّر", restored.attempts === 0, String(restored.attempts));

/* ④ الدخول الافتراضي ينجح بعده */
await page.evaluate(() => {
  const setVal = (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setVal(document.querySelector('input[placeholder="اسم المستخدم"]'), "admin");
  setVal(document.querySelector('input[type="password"]'), "Badeel@2026");
});
await wait(300);
await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(3000);
const inside = await page.evaluate(() => /الإعدادات والأمان/.test(document.body.innerText));
ok("الدخول بالكلمة الافتراضية نجح بعد التصفير", inside);

/* ⑤ بقية الحالة لا تُمس: رقم التواصل ما زال الصحيح */
const intact = await page.evaluate(() => {
  const st = JSON.parse(localStorage.getItem("badeel.state.v1") ?? "{}");
  return st.settings?.contactPhone === "0933177597";
});
ok("الإعدادات الأخرى لم تُمس (رقم التواصل سليم)", intact);

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
