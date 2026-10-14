/* ==========================================================================
   qa/wave19-e2e.mjs — موجة 19: الموديلات الجديدة داخل نموذج النشر
   --------------------------------------------------------------------------
   يفتح /post-ad ← فئة «هواتف مستعملة وجديدة» ← كل ماركة من الخمس ← يقرأ
   نصوص خيارات <select> (لا تظهر في innerText) ويتحقق من عينات الدفعة.
   التشغيل: node qa/wave19-e2e.mjs   (BASE_URL افتراضياً localhost:3000)
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
const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(String(e).slice(0, 140)));
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});
await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2", timeout: 60000 });
await wait(1500);

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

await clickButton("هواتف مستعملة وجديدة");
await wait(900);

const CHECKS = [
  ["آيفون", ["آيفون 11 برو ماكس", "آيفون 16 بلس", "آيفون 17 برو ماكس", "آيفون 17e", "آيفون Air", "آيفون Duo", "آيفون 18 برو ماكس"]],
  ["سامسونغ", ["جالاكسي A15", "جالاكسي S25 ألترا", "جالاكسي S26 ألترا", "جالاكسي S26 FE", "نوت 20 ألترا", "جالاكسي Z فولد 5", "جالاكسي M51"]],
  ["شاومي", ["ريدمي 14", "ريدمي نوت 13 برو", "بوكو X6 برو", "بوكو F6", "شاومي 14 ألترا"]],
  ["إنفينيكس", ["سمارت 8", "هوت 40", "نوت 40 برو", "زيرو 30", "GT 20 برو"]],
  ["هواوي", ["Y9s", "P30 برو", "ميت 60", "نوفا 12", "بورا 70"]],
];

for (const [brandName, needles] of CHECKS) {
  await clickButton(brandName);
  await wait(900);
  const opts = await readOptions();
  const joined = opts.join(" | ");
  const missing = needles.filter((n) => !joined.includes(n));
  ok(
    `موديلات ${brandName} الجديدة في القائمة (${opts.length} خياراً)`,
    missing.length === 0,
    missing.length ? `ناقص: ${missing.join("، ")}` : ""
  );
}

ok("صفر أخطاء JavaScript", jsErrors.length === 0, jsErrors.slice(0, 2).join(" | "));
await browser.close();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail === 0 ? 0 : 1);
