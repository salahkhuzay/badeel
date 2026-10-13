/* ==========================================================================
   qa/credentials-change-e2e.mjs — تغيير اسم المستخدم وكلمة المرور من اللوحة
   --------------------------------------------------------------------------
   يثبت السلاسة الكاملة: دخول افتراضي ← تغيير اسم المستخدم ← تغيير كلمة
   المرور (حالية+جديدة+تأكيد مع مقياس قوة) ← خروج ← القديمة تُرفض ←
   الجديدة باسم المستخدم الجديد تُدخل.
   ملاحظة معمارية: التغيير يُحفظ في متصفح المسؤول (بلا خادم)، لذا الخروج
   والدخول الجديد يجريان في السياق نفسه.
   التشغيل: node qa/credentials-change-e2e.mjs
   ========================================================================== */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const NEW_USER = "salah";
const NEW_PASS = "Manbij@2026x";
let pass = 0;
let fail = 0;
const ok = (label, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const setVal = (page, sel, v) =>
  page.evaluate(
    (s, val) => {
      const el = document.querySelector(s);
      if (!el) return false;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    },
    sel,
    v
  );
const toasts = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="status"]')).map((t) => t.textContent.trim())
  );

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});

/* ① دخول افتراضي */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2", timeout: 60000 });
await wait(1500);
await setVal(page, 'input[placeholder="اسم المستخدم"]', "admin");
await setVal(page, 'input[type="password"]', "Badeel@2026");
await wait(300);
await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(3000);
ok("الدخول الافتراضي نجح", await page.evaluate(() => /الإعدادات والأمان/.test(document.body.innerText)));

/* ② تبويب الإعدادات والأمان */
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("الإعدادات والأمان"))
    ?.click();
});
await wait(1500);

/* ③ تغيير اسم المستخدم */
const userSet = await page.evaluate((nu) => {
  const label = Array.from(document.querySelectorAll("label")).find((x) =>
    x.textContent.includes("اسم المستخدم للأدمن")
  );
  const input = label?.parentElement?.querySelector("input");
  if (!input) return false;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, nu);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}, NEW_USER);
ok("حقل اسم المستخدم موجود وقابل للكتابة", userSet);
await wait(300);
await page.evaluate(() => {
  const form = Array.from(document.querySelectorAll("form")).find((f) =>
    f.textContent.includes("اسم المستخدم للأدمن")
  );
  form?.querySelector('button[type="submit"]')?.click();
});
await wait(1200);
ok(
  "إشعار «تم حفظ سياسة الأمان» ظهر",
  (await toasts(page)).some((t) => /تم حفظ سياسة الأمان/.test(t))
);

/* ④ تغيير كلمة المرور */
const pwForms = await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll("label")).map((l) => l.textContent.trim());
  return {
    current: labels.some((t) => t.startsWith("كلمة المرور الحالية")),
    next: labels.some((t) => t.startsWith("كلمة المرور الجديدة")),
    confirm: labels.some((t) => t.startsWith("تأكيد كلمة المرور الجديدة")),
  };
});
ok("حقول كلمة المرور الثلاثة موجودة (حالية/جديدة/تأكيد)", pwForms.current && pwForms.next && pwForms.confirm);

const fillPw = (which, v) =>
  page.evaluate(
    (w, val) => {
      const label = Array.from(document.querySelectorAll("label")).find((x) =>
        x.textContent.trim().startsWith(w)
      );
      const input = label?.closest("div")?.querySelector('input[type="password"], input[type="text"]')
        ?? label?.parentElement?.querySelector("input");
      if (!input) return false;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, val);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    },
    which,
    v
  );
await fillPw("كلمة المرور الحالية", "Badeel@2026");
await fillPw("كلمة المرور الجديدة", NEW_PASS);
await fillPw("تأكيد كلمة المرور الجديدة", NEW_PASS);
await wait(500);
const meter = await page.evaluate(() => /القوة:/.test(document.body.innerText));
ok("مقياس قوة كلمة المرور يعمل", meter);
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent.includes("حفظ كلمة المرور الجديدة"))
    ?.click();
});
await wait(2500);
ok(
  "إشعار «تم تغيير كلمة المرور» ظهر",
  (await toasts(page)).some((t) => /تم تغيير كلمة المرور/.test(t))
);

/* ⑤ خروج ثم دخول بالجديدين ورفض القديمين */
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll("button")).find(
    (b) => b.textContent.trim() === "خروج" || b.textContent.trim() === "تسجيل الخروج"
  );
  btn?.click();
});
await wait(2000);
const loggedOut = await page.evaluate(() => /دخول المسؤول/.test(document.body.innerText));
ok("الخروج نجح وعادت صفحة الدخول", loggedOut);

await setVal(page, 'input[placeholder="اسم المستخدم"]', "admin");
await setVal(page, 'input[type="password"]', "Badeel@2026");
await wait(300);
await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(2500);
ok(
  "الاسم والكلمة القديمان مرفوضان الآن",
  await page.evaluate(() => /بيانات الدخول غير صحيحة/.test(document.body.innerText))
);

await setVal(page, 'input[placeholder="اسم المستخدم"]', NEW_USER);
await page.evaluate((v) => {
  const els = Array.from(document.querySelectorAll('input[type="password"]'));
  const el = els[els.length - 1];
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}, NEW_PASS);
await wait(300);
await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(3000);
ok(
  "الدخول بالجديدين نجح (salah + الكلمة الجديدة)",
  await page.evaluate(() => /الإعدادات والأمان/.test(document.body.innerText))
);

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
