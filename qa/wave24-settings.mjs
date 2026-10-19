/* ============================================================================
   فحص جسر الإعدادات العامة — موجة 24
   شكوى صاحب المنصة: «غيّرت الرقم من اللوحة فتغيّر عندي فقط».
   الفحص على موقع حي: ينشر رقم اختبار عبر /api/settings، ويتأكد أن متصفحاً
   جديداً تماماً (لا ذاكرة مشتركة) يرى الرقم المنشور، ثم يلغي النشر ويعيد
   التحقق من عودة الافتراضي. لا يمس بيانات صاحب المنصة.
   التشغيل: node qa/wave24-settings.mjs [url]
   ========================================================================== */
import puppeteer from "puppeteer";

const BASE = process.argv[2] || "https://badeel-online.vercel.app";
/* المفتاح لا يُكتب في المستودع — يُمرَّر وقت التشغيل: PUBLISH_KEY=… node qa/wave24-settings.mjs */
const KEY = process.env.PUBLISH_KEY || "";
if (!KEY) {
  console.log("مرّر مفتاح النشر: PUBLISH_KEY=… node qa/wave24-settings.mjs");
  process.exit(1);
}
const TEST_PHONE = "0999887766";
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`✅ ${name}`); }
  else { fail++; console.log(`❌ ${name} — ${extra}`); }
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const digits = (s) => s.replace(/\D/g, "");

/* ① النشر عبر الجسر */
const payload = {
  settings: {
    contactPhone: TEST_PHONE,
    contactPhone2: "",
    contactPhoneSource: "custom",
    whatsappCountryCode: "963",
    siteSlogan: "شعار اختبار مؤقت",
    facebookUrl: "https://www.facebook.com",
  },
  cities: [], /* فارغة ⇒ الزوار يبقى على مدنهم المحلية (قاعدة الأمان في المتجر) */
  publishedAt: new Date().toISOString(),
};
const post = await fetch(`${BASE}/api/settings`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ payload, key: KEY }),
}).then((r) => r.json());
ok("النشر عبر /api/settings نجح", post.ok === true, JSON.stringify(post));

const get = await fetch(`${BASE}/api/settings`, { cache: "no-store" }).then((r) => r.json());
ok(
  "GET يعيد الحمولة المنشورة",
  get.kvConfigured === true && get.payload?.settings?.contactPhone === TEST_PHONE,
  JSON.stringify(get).slice(0, 120)
);

/* ② متصفح جديد تماماً يرى المنشور */
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.createBrowserContext(); /* سياق معزول: لا ذاكرة مشتركة */
const page = await ctx.newPage();
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});
await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await wait(2500);
const visitorText = await page.evaluate(() => document.body.innerText);
ok(
  "زائر جديد يرى الرقم المنشور",
  digits(visitorText).includes(digits(TEST_PHONE)),
  "الرقم غير موجود في الصفحة"
);

/* ③ إلغاء النشر ⇒ يعود الافتراضي */
const del = await fetch(`${BASE}/api/settings`, {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: KEY }),
}).then((r) => r.json());
ok("إلغاء النشر نجح", del.ok === true, JSON.stringify(del));
const page2 = await ctx.newPage();
await page2.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await wait(2500);
const afterText = await page2.evaluate(() => document.body.innerText);
ok(
  "بعد الإلغاء: رقم الاختبار اختفى من متصفح جديد",
  !digits(afterText).includes(digits(TEST_PHONE)),
  "ما زال ظاهرًا"
);
await browser.close();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail ? 1 : 0);
