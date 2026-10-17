/* ==========================================================================
   qa/wave20-ads.mjs — موجة 20: المساحة الإعلانية المأجورة
   --------------------------------------------------------------------------
   ① SSR: بلا حملات ⇒ لافتة «مساحتك الإعلانية هنا» مع زر حجز واتساب.
   ② حملة حية في مخزن الزائر ⇒ بانر «إعلان ممول» بعنوان المعلن ورابط وجهته.
   ③ حملة منتهية ⇒ تعود اللافتة (المساحة لا تبقى ميتة).
   ④ من اللوحة: تبويب «إعلانات مأجورة» ← إضافة حملة ⇒ تظهر في القائمة «حية»
      وفي الرئيسية بانر فعّال.
   التشغيل: node qa/wave20-ads.mjs   (BASE_URL افتراضياً localhost:3000)
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
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

/* ① HTML الخادم بلا حملات */
const home = await (await fetch(`${BASE}/`)).text();
ok("SSR: لافتة بيع المساحة حاضرة افتراضياً", home.includes("مساحتك الإعلانية هنا"));
ok("SSR: زر الحجز عبر واتساب", home.includes("احجز المساحة عبر واتساب"));

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

const setVal = (sel, value, pg = page) =>
  pg.evaluate(
    (s, v) => {
      const el = document.querySelector(s);
      if (!el) return false;
      const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    },
    sel,
    value
  );

/* بذرة مخزن الزائر بحملة معينة ثم فتح الرئيسية */
const seedAndOpen = async (sponsored) => {
  await page.evaluateOnNewDocument(
    (list) => localStorage.setItem("badeel.state.v1", JSON.stringify({ sponsored: list })),
    sponsored
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
  await wait(1200);
};

/* ② حملة حية */
await seedAndOpen([
  {
    id: "spn-qa1",
    advertiser: "معرض النور للسيارات",
    title: "وصلت حديثاً — كيا سبورتاج 2024",
    subtitle: "تقسيط مريح",
    linkUrl: "https://example.com/spn",
    startsAt: day(-1),
    endsAt: day(1),
    enabled: true,
  },
]);
let snap = await page.evaluate(() => ({
  label: document.body.innerText.includes("إعلان ممول"),
  title: document.body.innerText.includes("وصلت حديثاً — كيا سبورتاج 2024"),
  adv: document.body.innerText.includes("برعاية: معرض النور للسيارات"),
  href: Array.from(document.querySelectorAll("a")).some(
    (a) => a.getAttribute("href") === "https://example.com/spn"
  ),
  noPlaceholder: !document.body.innerText.includes("مساحتك الإعلانية هنا"),
}));
ok("حملة حية: وسم «إعلان ممول» + عنوان المعلن + رابطه", snap.label && snap.title && snap.adv && snap.href, JSON.stringify(snap));
ok("حملة حية: لافتة الحجز تختفي", snap.noPlaceholder);

/* ③ حملة منتهية */
await seedAndOpen([
  {
    id: "spn-qa2",
    advertiser: "معلن منتهٍ",
    title: "حملة انتهت أمس",
    startsAt: day(-5),
    endsAt: day(-1),
    enabled: true,
  },
]);
snap = await page.evaluate(() => ({
  placeholder: document.body.innerText.includes("مساحتك الإعلانية هنا"),
  gone: !document.body.innerText.includes("حملة انتهت أمس"),
}));
ok("حملة منتهية: تعود لافتة بيع المساحة ويختفي البانر", snap.placeholder && snap.gone);

/* ④ دورة اللوحة الكاملة — صفحة جديدة بلا سكربتات البذور حتى لا تُمسح الحملة */
const page2 = await browser.newPage();
page2.on("pageerror", (e) => jsErrors.push(String(e).slice(0, 140)));
await page2.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});
await page2.goto(`${BASE}/admin`, { waitUntil: "networkidle2", timeout: 60000 });
/* مسح أي بذور ورثتها الصفحة المشتركة ثم إعادة تحميل نظيفة */
await page2.evaluate(() => localStorage.removeItem("badeel.state.v1"));
await page2.reload({ waitUntil: "networkidle2" });
await wait(1500);
await setVal('input[placeholder="اسم المستخدم"]', "admin", page2);
await setVal('input[type="password"]', "Badeel@2026", page2);
await wait(300);
await page2.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(3000);
await page2.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("إعلانات مأجورة"))
    ?.click();
});
await wait(900);
ok("تبويب «إعلانات مأجورة» موجود ويفتح", await page2.evaluate(() => document.body.innerText.includes("المساحة الإعلانية المأجورة — الشريط أعلى الرئيسية")));

/* إدخال حملة جديدة */
const inputs = await page2.evaluate(() => {
  const labels = Array.from(document.querySelectorAll("label"));
  const byText = (t) => labels.find((l) => l.textContent.trim().startsWith(t))?.querySelector("input");
  const adv = byText("اسم المعلن");
  const title = byText("النص الرئيسي");
  if (adv) {
    const set = (el, v) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    set(adv, "صيدلية الشعب");
    set(title, "حسم 20% على كل الفيتامينات هذا الأسبوع");
    return true;
  }
  return false;
});
ok("حقلا المعلن والنص قابلان للتعبئة", inputs);
await wait(300);
await page2.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent.includes("إضافة الحملة"))
    ?.click();
});
await wait(900);
snap = await page2.evaluate(() => ({
  listed: document.body.innerText.includes("صيدلية الشعب"),
  live: /حية/.test(document.body.innerText),
  count: document.body.innerText.includes("الحملات (1)"),
}));
ok("الحملة أُضيفت: في القائمة بحالة «حية»", snap.listed && snap.live && snap.count, JSON.stringify(snap));

/* وانعكاسها على الرئيسية في نفس الجلسة */
await page2.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
await wait(1200);
snap = await page2.evaluate(() => ({
  banner: document.body.innerText.includes("حسم 20% على كل الفيتامينات هذا الأسبوع"),
  label: document.body.innerText.includes("إعلان ممول"),
}));
ok("الحملة المضافة من اللوحة تظهر بانراً على الرئيسية", snap.banner && snap.label);

ok("صفر أخطاء JavaScript", jsErrors.length === 0, jsErrors.slice(0, 2).join(" | "));
await browser.close();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail === 0 ? 0 : 1);
