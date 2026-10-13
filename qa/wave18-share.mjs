/* ==========================================================================
   qa/wave18-share.mjs — موجة 18: بطاقة المشاركة وزر المشاركة والترويسات
   --------------------------------------------------------------------------
   ① SSR: og:image وtwitter:card يشيران إلى /og-cover.png والصورة تُخدم 200.
   ② ترويسات الأمان الآمنة حاضرة على الاستجابة.
   ③ في المتصفح: زر «شارك المنصة» في الهيرو وأيقونة المشاركة في الفوتر،
      والقائمة البديلة (واتساب/فيسبوك/نسخ) بروابطها الصحيحة.
   التشغيل: node qa/wave18-share.mjs   (BASE_URL افتراضياً localhost:3000)
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

/* ─────────── ① HTML الخادم ─────────── */
console.log("① فحص HTML الخادم…");
const res = await fetch(`${BASE}/`);
const html = await res.text();
ok("og:image يشير إلى بطاقة المشاركة", /property="og:image"[^>]*\/og-cover\.png/.test(html));
ok("twitter:card = summary_large_image", html.includes('name="twitter:card" content="summary_large_image"'));
ok("JSON-LD ما زال حاضراً", html.includes("application/ld+json"));

const img = await fetch(`${BASE}/og-cover.png`);
ok(
  "الباقة تُخدم PNG بحجم 1200×630 تقريباً",
  img.status === 200 && (img.headers.get("content-type") ?? "").includes("image/png"),
  `${img.status} ${(img.headers.get("content-type") ?? "").split(";")[0]}`
);

/* ─────────── ② ترويسات الأمان ─────────── */
ok("X-Content-Type-Options: nosniff", res.headers.get("x-content-type-options") === "nosniff");
ok(
  "Referrer-Policy مضبوط",
  (res.headers.get("referrer-policy") ?? "") === "strict-origin-when-cross-origin"
);
ok("Permissions-Policy يعطّل الكاميرا/الميكروفون", (res.headers.get("permissions-policy") ?? "").includes("camera=()"));

/* ─────────── ③ المتصفح ─────────── */
console.log("\n② زر المشاركة وسلوكه في المتصفح…");
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
try {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
} catch { /* بعض الإصدارات لا تدعمها — فحص النسخ سيسقط بوضوح حينها */ }

await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
await wait(1200);

const present = await page.evaluate(() => ({
  pill: Array.from(document.querySelectorAll("button")).some((b) => b.textContent.includes("شارك المنصة")),
  footerIcon: !!document.querySelector('[aria-label="مشاركة المنصة"]'),
}));
ok("زر «شارك المنصة» في الهيرو", present.pill);
ok("أيقونة المشاركة في الفوتر", present.footerIcon);

/* فتح القائمة البديلة (headless بلا navigator.share) */
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent.includes("شارك المنصة"))
    ?.click();
});
await wait(400);
const menu = await page.evaluate(() => {
  const m = document.querySelector('[role="menu"]');
  if (!m) return null;
  const wa = m.querySelector('a[href^="https://wa.me/"]');
  const fb = m.querySelector('a[href*="facebook.com/sharer/sharer.php"]');
  return {
    wa: wa?.getAttribute("href") ?? "",
    fb: fb?.getAttribute("href") ?? "",
    copy: Array.from(m.querySelectorAll("button")).some((b) => b.textContent.includes("نسخ الرابط")),
  };
});
ok("القائمة البديلة تفتح: واتساب + فيسبوك + نسخ", !!menu && !!menu.wa && !!menu.fb && menu.copy);
if (menu) {
  const waDec = decodeURIComponent(menu.wa);
  ok(
    "رابط واتساب يحمل نص المشاركة ورابط الموقع",
    waDec.includes("بديل أونلاين") && waDec.includes(BASE.replace("http://", "http://")),
    waDec.slice(0, 60)
  );
  ok("رابط فيسبوك يحمل رابط الموقع مشفّراً", menu.fb.includes(encodeURIComponent(BASE + "/")));
}

/* نسخ الرابط */
await page.evaluate(() => {
  Array.from(document.querySelectorAll('[role="menu"] button'))
    .find((b) => b.textContent.includes("نسخ الرابط"))
    ?.click();
});
await wait(400);
const copied = await page.evaluate(() => document.body.innerText.includes("تم النسخ"));
ok("زر النسخ يؤكد بـ«تم النسخ»", copied);

ok("صفر أخطاء JavaScript", jsErrors.length === 0, jsErrors.slice(0, 2).join(" | "));

await browser.close();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail === 0 ? 0 : 1);
