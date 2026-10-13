/* ==========================================================================
   qa/wave17-e2e.mjs — بلاغ موجة 17 (2026-10-13)
   --------------------------------------------------------------------------
   ① إلغاء محدد «نوع السيارة (الهيكل)» من النموذج (يُشتق آلياً).
   ② أنواع المركبات التسعة بأسماء السوق (سياحية/جيب، بيك أب، شاحنة، فان،
      ميكروباص، باص، دراجة، جرار، آليات ثقيلة).
   ③ الصور من المعرض فقط (بلا ذكر الكاميرا).
   ④ الاسم المعتمد: بديل أونلاين / Badeel Online (عنوان + لوغو + فوتر).
   ⑤ الصفحات القانونية الأربع + روابطها في الفوتر.
   ⑥ موديلات السوق: سنتافي CM/غولد/فيراكروز تظهر عند اختيار هيونداي.
   التشغيل: node qa/wave17-e2e.mjs
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

/* ─────────── SSR ─────────── */
console.log("① فحص HTML الخادم…");
const home = await (await fetch(`${BASE}/`)).text();
ok("العنوان يحمل الاسم الجديد", home.includes("بديل أونلاين | Badeel Online"));
ok("اللوغو يعرض «بديل أونلاين»", home.includes("بديل أونلاين"));
ok("الفوتر: © بديل أونلاين — Badeel Online", home.includes("بديل أونلاين — Badeel Online. جميع الحقوق محفوظة"));
for (const [href, label] of [
  ["/about", "من نحن"],
  ["/terms", "شروط الاستخدام"],
  ["/privacy", "سياسة الخصوصية"],
  ["/cookies", "سياسة ملفات الارتباط"],
]) {
  ok(`الفوتر فيه رابط ${label}`, home.includes(`href="${href}"`) && home.includes(label));
}

const post = await (await fetch(`${BASE}/post-ad`)).text();
ok("محدد «نوع السيارة (الهيكل)» أُُلغي من النموذج", !post.includes("نوع السيارة (الهيكل)"));
ok("زر الصور: «أضف صوراً من المعرض»", post.includes("أضف صوراً من المعرض"));
ok("لا ذكر للكاميرا في زر الصور", !post.includes("من الكاميرا أو المعرض"));

for (const [path, head] of [
  ["/terms", "شروط الاستخدام"],
  ["/privacy", "سياسة الخصوصية"],
  ["/cookies", "سياسة ملفات الارتباط"],
  ["/about", "من نحن"],
]) {
  const r = await fetch(`${BASE}${path}`);
  const t = await r.text();
  ok(`صفحة ${path} منشورة وتحوي عنوانها`, r.status === 200 && t.includes(head));
}

/* ─────────── متصفح ─────────── */
console.log("\n② داخل النموذج: الأنواع والموديلات…");
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
await page.waitForSelector("text/صور الإعلان");
await wait(1500);
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("سيارات ومركبات") || x.textContent.trim().startsWith("مركبات"))
    ?.click();
});
await wait(900);
const types = await page.evaluate(() => {
  const names = [
    "سيارة سياحية / جيب",
    "بيك أب",
    "شاحنة",
    "فان",
    "ميكروباص",
    "باص",
    "دراجة نارية",
    "جرار زراعي",
    "آليات ثقيلة",
  ];
  const btns = Array.from(document.querySelectorAll("button")).map((b) => b.textContent.trim());
  return {
    count: names.filter((n) => btns.some((t) => t === n || t.startsWith(n))).length,
    noBodyLabel: !document.body.innerText.includes("نوع السيارة (الهيكل)"),
  };
});
ok("أزرار الأنواع التسعة ظاهرة", types.count === 9, `${types.count}/9`);
ok("لا أثر لمحدد الهيكل في الصفحة", types.noBodyLabel);

/* اختيار سياحية ثم هيونداي ثم فحص موديلات السوق */
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent.trim().startsWith("سيارة سياحية / جيب"))
    ?.click();
});
await wait(800);
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent.trim().includes("هيونداي"))
    ?.click();
});
await wait(900);
const models = await page.evaluate(() => {
  /* الموديلات قائمة select — نص الخيارات لا يظهر في innerText */
  const t = Array.from(document.querySelectorAll("select option"))
    .map((o) => o.textContent ?? "")
    .join(" ");
  return {
    gold: t.includes("سنتافي غولد"),
    cm: t.includes("سنتافي CM"),
    dm: t.includes("سنتافي DM"),
    tm: t.includes("سنتافي TM"),
    veracruz: t.includes("فيراكروز"),
  };
});
ok("موديلات السوق ظاهرة: غولد + CM + DM + TM + فيراكروز", Object.values(models).every(Boolean), JSON.stringify(models));

ok("صفر أخطاء JavaScript", jsErrors.length === 0, jsErrors.slice(0, 2).join(" | "));

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
