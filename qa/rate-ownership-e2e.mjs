/* ==========================================================================
   qa/rate-ownership-e2e.mjs — إصلاحان (2026-10-13)
   --------------------------------------------------------------------------
   ① تصحيح إملاء خيار أوراق الملكية الأخير: «عرقاري - سياق» ← «عقاري - سياق»
      (المعرّف الداخلي arqari-siyaq بقي كما هو حتى لا تتعطل الإعلانات المحفوظة)
   ② صلاحية تعديل سعر الصرف يدوياً من اللوحة: كتابة + أزرار تعديل سريع +
      حفظ + تاريخ آخر تعديل + سريان السعر الجديد على التحويل في النموذج
   التشغيل: node qa/rate-ownership-e2e.mjs
   ========================================================================== */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const BUMP = 1234; // فرق واضح عن السعر الحالي لإثبات السريان
let pass = 0;
let fail = 0;
const ok = (label, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ─────────── ① التصحيح الإملائي في HTML الخادم ─────────── */
console.log("① فحص HTML الخادم لنموذج الإعلان…");
const html = await (await fetch(`${BASE}/post-ad`)).text();
ok("الخيار المصحّح «عقاري - سياق» موجود", html.includes("عقاري - سياق"));
ok("الإملاء القديم «عرقاري» اختفى نهائياً", !html.includes("عرقاري"));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(String(e).slice(0, 140)));
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});

/* مساعد تعبئة الحقول — نفس منطق بقية الاختبارات:
   تجاهل checkbox/radio/file لأن «السعر قابل للتفاوض» تسبق حقل «السعر *» */
const fillPrice = (value) =>
  page.evaluate(
    (v) => {
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
      if (!el) return { found: false };
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return { found: true, isNumber: el.type === "number", value: el.value };
    },
    String(value)
  );

/* اختيار الدولار كعملة الإدخال ثم قراءة سطر التحويل */
const readConversion = async () => {
  await page.evaluate(() => {
    Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent.trim() === "$ دولار")
      ?.click();
  });
  await wait(250);
  return page.evaluate(() => {
    const p = Array.from(document.querySelectorAll("p")).find((x) =>
      x.textContent.includes("سيُعرض السعر بالعملتين")
    );
    const t = (p?.textContent ?? "").replace(/\s+/g, " ");
    const m = t.match(/([\d,]+)\s*ل\.س/);
    return { text: t, syp: m ? Number(m[1].replace(/,/g, "")) : null };
  });
};

/* ─────────── ① الخيار المصحّح داخل النموذج ─────────── */
console.log("\n① خيار أوراق الملكية داخل نموذج إعلان عقار…");
await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("text/صور الإعلان");
await wait(1500);
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("عقارات"))
    ?.click();
});
await wait(900);
const own = await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll("button")).map((b) => b.textContent.trim());
  return {
    fixed: labels.some((t) => t.includes("عقاري - سياق")),
    old: labels.some((t) => t.includes("عرقاري")),
    hint: /قيد\/سجل عقاري قديم/.test(document.body.innerText),
  };
});
ok("الخيار الأخير صار «عقاري - سياق»", own.fixed);
ok("لا أثر للإملاء القديم في الخيارات", !own.old);
ok("التلميح واضح: قيد/سجل عقاري قديم", own.hint);

/* ─────────── ② التحويل قبل تعديل السعر ─────────── */
console.log("\n② التحويل في النموذج قبل تعديل السعر…");
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("أثاث"))
    ?.click();
});
await wait(800);
const typed = await fillPrice(100);
ok("حقل السعر موجود ويقبل القيمة", typed.found && typed.isNumber, typed.value ?? "");
await wait(400);
const before = await readConversion();
const oldRate = before.syp ? Math.round(before.syp / 100) : null;
ok("التحويل يظهر بالليرة قبل التعديل", !!oldRate, before.text.slice(0, 70));
const newRate = (oldRate || 13000) + BUMP;

/* ─────────── ② تعديل السعر يدوياً من اللوحة ─────────── */
console.log(`\n② تعديل سعر الصرف يدوياً من ${oldRate} إلى ${newRate} من اللوحة…`);
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
await wait(1500);
await page.evaluate(() => {
  const setVal = (el, v) => {
    if (!el) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setVal(document.querySelector('input[placeholder="اسم المستخدم"]'), "admin");
  setVal(document.querySelector('input[type="password"]'), "Badeel@2026");
});
await wait(300);
await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(2800);
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("الإعدادات والأمان"))
    ?.click();
});
await wait(1500);

const setRate = (v) =>
  page.evaluate((val) => {
    const input = Array.from(document.querySelectorAll('input[type="number"][dir="ltr"]')).find((i) => {
      const box = i.closest("div")?.parentElement;
      return box?.textContent.includes("سعر صرف الدولار");
    });
    if (!input) return false;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, String(val));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }, v);

ok("حقل سعر الصرف موجود وقابل للكتابة", await setRate(newRate));
await wait(400);

/* أزرار التعديل السريع — النقرة تُحدّث حالة React فتُقرأ القيمة بعد إعادة الرسم */
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent.trim() === "+100")
    ?.click();
});
await wait(700);
const quick = await page.evaluate(() =>
  Number(
    Array.from(document.querySelectorAll('input[type="number"][dir="ltr"]')).find((i) =>
      i.closest("div")?.parentElement?.textContent.includes("سعر صرف الدولار")
    )?.value
  )
);
ok("زر «+100» يزيد السعر فوراً", quick === newRate + 100, `${newRate} ← ${quick}`);
await setRate(newRate);
await wait(300);

/* التحقق من القيم المرفوضة — طبقتان:
   أ) قيمة 50: الحقل type=number min=100 فالمتصفح يمنع الإرسال أصلاً (لا يُحفظ شيء)
   ب) حقل فارغ: يصل إلى save() فيظهر تنبيه «سعر صرف غير منطقي» */
const activeRate = () =>
  page.evaluate(() => document.body.innerText.match(/1 \$ = ([\d,]+) ل\.س/)?.[1] ?? "");
const activeBefore = await activeRate();

await setRate(50);
await wait(500);
const blocked = await page.evaluate(() => {
  const input = Array.from(document.querySelectorAll('input[type="number"][dir="ltr"]')).find((i) =>
    i.closest("div")?.parentElement?.textContent.includes("سعر صرف الدولار")
  );
  const form = Array.from(document.querySelectorAll("form")).find((f) =>
    f.textContent.includes("سعر صرف الدولار")
  );
  const btn = form?.querySelector('button[type="submit"]');
  btn?.click();
  return {
    value: input?.value,
    valid: input?.checkValidity(),
    msg: input?.validationMessage ?? "",
    toasts: Array.from(document.querySelectorAll('[role="status"]')).length,
  };
});
await wait(900);
const activeAfter50 = await activeRate();
ok(
  "سعر 50 مرفوض: المتصفح يمنع الإرسال (تحقق أصلي min=100)",
  blocked.value === "50" && blocked.valid === false && blocked.toasts === 0,
  blocked.msg.slice(0, 60)
);
ok("السعر النشط لم يتغير بعد محاولة الحفظ بـ 50", activeAfter50 === activeBefore, `${activeBefore} ← ${activeAfter50}`);

/* الحقل الفارغ → تنبيه الخطأ من save() */
await setRate("");
await wait(500);
await page.evaluate(() => {
  const form = Array.from(document.querySelectorAll("form")).find((f) =>
    f.textContent.includes("سعر صرف الدولار")
  );
  form?.querySelector('button[type="submit"]')?.click();
});
await wait(900);
const emptyRejected = await page.evaluate(() => ({
  toast: Array.from(document.querySelectorAll('[role="status"]')).some((t) =>
    /غير منطقي/.test(t.textContent)
  ),
  active: document.body.innerText.match(/1 \$ = ([\d,]+) ل\.س/)?.[1] ?? "",
}));
ok("حقل سعر فارغ → تنبيه «سعر صرف غير منطقي» ولا يُحفظ", emptyRejected.toast);
ok("السعر النشط يبقى كما كان بعد الرفض", emptyRejected.active === activeBefore, emptyRejected.active);

await setRate(newRate);
await wait(300);

/* الحفظ */
const saved = await page.evaluate(() => {
  const form = Array.from(document.querySelectorAll("form")).find((f) =>
    f.textContent.includes("سعر صرف الدولار")
  );
  const btn = form?.querySelector('button[type="submit"]');
  if (!btn || btn.disabled) return false;
  btn.click();
  return true;
});
await wait(1800);
const afterSave = await page.evaluate(
  (r) => ({
    toast: /تم حفظ/.test(document.body.innerText),
    active: document.body.innerText.includes(`1 $ = ${r.toLocaleString("en-US")} ل.س`),
    updatedAt: /آخر تعديل يدوي:/.test(document.body.innerText),
    note: /يسري\s*فوراً|بلا خادم/.test(document.body.innerText),
  }),
  newRate
);
ok("زر الحفظ نُقر", saved);
ok("إشعار الحفظ ظهر", afterSave.toast);
ok("«سعر الصرف النشط» يعرض السعر الجديد", afterSave.active);
ok("تاريخ آخر تعديل يدوي يُسجَّل ويظهر", afterSave.updatedAt);
ok("ملاحظة نطاق السريان ظاهرة للمسؤول", afterSave.note);

/* ─────────── ② سريان السعر الجديد على التحويل ─────────── */
console.log("\n② سريان السعر الجديد في نموذج الإعلان…");
await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2" });
await wait(1800);
await fillPrice(100);
await wait(500);
const after = await readConversion();
ok(
  `التحويل يستخدم السعر الجديد (100$ = ${(newRate * 100).toLocaleString("en-US")} ل.س)`,
  after.syp === newRate * 100,
  after.text.slice(0, 80)
);

/* ─────────── أخطاء JavaScript ─────────── */
ok("صفر أخطاء JavaScript", jsErrors.length === 0, jsErrors.slice(0, 2).join(" | "));

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
