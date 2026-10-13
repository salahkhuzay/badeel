/* ==========================================================================
   qa/wave175-live.mjs — تحقق حيّ من الدفعة الثانية للموديلات على المنشور
   --------------------------------------------------------------------------
   يفتح https://badeel-online.vercel.app/post-ad عبر puppeteer ويقرأ نصوص
   خيارات <select> (لا تظهر في innerText) للماركات الثلاث، مع حلقة إعادة
   محاولة حتى يكتمل نشر Vercel (~3-5 دقائق بعد الدفع).
   التشغيل: node qa/wave175-live.mjs
   ========================================================================== */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const BASE = process.env.BASE_URL || "https://badeel-online.vercel.app";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* الموديلات المتوقعة — نصوص فرعية من اسم الخيار «الاسم (En)» */
const EXPECT = {
  هيونداي: ["سنتنيال", "كاسبر", "كليك", "انتر شاحنة", "غرانديور", "i40", "ماكس كروز", "بورتر بيك أب", "H100", "ستاريا", "سولاتي", "جراند i10"],
  كيا: ["كادينزا", "فورتي", "K4 (", "K5", "K7", "K8", "K9", "KX1", "ماجنتس", "مينتور", "رودستر", "روكستا", "سبيكترا", "ستينغر", "سونيت", "تاسمان", "K4000", "نيرو"],
  تويوتا: ["شاص", "جرانفيا"],
};

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

const clickButton = (txt) =>
  page.evaluate((t) => {
    Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent.trim().includes(t))
      ?.click();
  }, txt);

const readOptions = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("select option")).map((o) => o.textContent ?? "")
  );

let found = null;
for (let attempt = 1; attempt <= 12 && !found; attempt++) {
  console.log(`\n── محاولة ${attempt} على ${BASE} ──`);
  await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2", timeout: 60000 });
  await wait(1500);
  await clickButton("سيارات ومركبات");
  await wait(800);
  await clickButton("سيارة سياحية / جيب");
  await wait(800);

  const result = {};
  for (const [brand, needles] of Object.entries(EXPECT)) {
    await clickButton(brand);
    await wait(900);
    const opts = await readOptions();
    result[brand] = needles.filter((n) => !opts.some((o) => o.includes(n)));
  }
  const missing = Object.values(result).flat();
  if (missing.length === 0) {
    found = result;
    console.log("✅ النشر الجديد حيّ — كل الموديلات متاحة");
  } else {
    console.log(`⏳ لم يُنشر بعد — ناقص ${missing.length}: ${missing.slice(0, 6).join("، ")}`);
    if (attempt < 12) await wait(45000);
  }
}

let pass = 0, fail = 0;
const ok = (label, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};
for (const [brand, needles] of Object.entries(EXPECT)) {
  ok(
    `موديلات ${brand} الجديدة كاملة على المنشور (${needles.length})`,
    !!found && found[brand].length === 0,
    found ? "" : "انتهت المحاولات قبل اكتمال النشر"
  );
}

await browser.close();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail === 0 ? 0 : 1);
