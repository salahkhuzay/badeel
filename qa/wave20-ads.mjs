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
/* سرعة اللوحة: حقول الدخول في HTML الخادم نفسه — لا انتظار للجافاسكربت */
const adminHtml = await (await fetch(`${BASE}/admin`)).text();
ok("SSR: نموذج دخول اللوحة (كلمة المرور) في HTML الخادم", adminHtml.includes('type="password"'));
ok("SSR: لافتة بيع المساحة حاضرة افتراضياً", home.includes("مساحتك الإعلانية هنا"));
ok("SSR: زر الحجز عبر واتساب", home.includes("احجز المساحة عبر واتساب"));

/* جسر النشر /api/sponsored: بلا KV يعلن ذلك صراحةً، والمفتاح الخاطئ مرفوض */
const g = await fetch(`${BASE}/api/sponsored`);
const gj = await g.json().catch(() => null);
ok("جسر GET /api/sponsored: 200 مع kvConfigured:false محلياً", g.status === 200 && gj?.kvConfigured === false && Array.isArray(gj?.list));
const p = await fetch(`${BASE}/api/sponsored`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ list: [], key: "wrong-key-probe" }),
});
/* محلياً بلا RATE_WRITE_KEY ⇒ 503 «غير مضبوط»، ومع المفتاح ⇒ 401 للخاطئ —
   وكلاهما رفض صحيح؛ مسار 401 الحقيقي يُفحص على المنشور حيث المفتاح مضبوط */
ok("جسر POST يرفض النشر غير المصرح (401/503)", p.status === 401 || p.status === 503, `HTTP ${p.status}`);

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

/* ②-ب حملة بصورة فقط: البانر صورة والنص لا يظهر للزائر */
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
await seedAndOpen([
  {
    id: "spn-qa-img",
    advertiser: "معلن بالصورة",
    title: "عنوان إداري لا يظهر",
    imageUrl: TINY_PNG,
    linkUrl: "https://example.com/img",
    startsAt: day(-1),
    endsAt: day(1),
    enabled: true,
  },
]);
snap = await page.evaluate((src) => {
  const img = Array.from(document.querySelectorAll("img")).find((i) => i.getAttribute("src") === src);
  return {
    img: Boolean(img),
    wrapped: Boolean(img?.closest("a[href='https://example.com/img']")),
    contain: img ? getComputedStyle(img).objectFit === "contain" : false,
    label: document.body.innerText.includes("إعلان ممول"),
    noTitle: !document.body.innerText.includes("عنوان إداري لا يظهر"),
  };
}, TINY_PNG);
ok("حملة بصورة فقط: صورة كاملة (contain) قابلة للنقر + وسم ممول + بلا نص", snap.img && snap.wrapped && snap.label && snap.noTitle && snap.contain, JSON.stringify(snap));

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
await wait(2000); /* التحميل الكسول للتبويب */
ok("تبويب «إعلانات مأجورة» موجود ويفتح", await page2.evaluate(() => document.body.innerText.includes("المساحة الإعلانية المأجورة — الشريط أعلى الرئيسية")));
ok(
  "حقل رفع صورة البانر من الجهاز موجود",
  await page2.evaluate(() => Boolean(document.querySelector('input[type="file"][accept="image/*"]')))
);

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
    .find((b) => b.textContent.includes("حفظ الحملة ونشرها"))
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
