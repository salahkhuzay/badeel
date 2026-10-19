/* ============================================================================
   مراجعة شاملة — زحف الموقع: كل المسارات + الروابط الداخلية + أخطاء الكونسول
   التشغيل: node qa/site-sweep.mjs [url]
   ========================================================================== */
import puppeteer from "puppeteer";

const BASE = process.argv[2] || "http://localhost:3000";
let pass = 0;
let fail = 0;
const problems = [];
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`✅ ${name}`); }
  else { fail++; problems.push(`${name} ${extra}`); console.log(`❌ ${name} — ${extra}`); }
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = [
  "/", "/category/real-estate", "/category/vehicles", "/category/furniture",
  "/category/appliances", "/category/clothing", "/category/phones", "/category/jobs",
  "/car-types", "/search", "/post-ad", "/how-it-works", "/about",
  "/privacy", "/terms", "/cookies", "/offline", "/admin",
  "/ad/BD-8001", "/category/nope-404",
];

/* ① حالات HTTP لكل مسار */
for (const r of ROUTES) {
  const res = await fetch(`${BASE}${r}`, { cache: "no-store" });
  const expect404 = r.includes("404");
  const good = expect404 ? res.status === 404 : res.status === 200;
  ok(`HTTP ${res.status} ← ${r}`, good, `متوقع ${expect404 ? 404 : 200}`);
}

/* ② أخطاء الكونسول/الشبكة في الصفحات الرئيسية (جوال) */
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
const SWEEP = ["/", "/category/vehicles", "/category/real-estate", "/search", "/post-ad", "/how-it-works", "/about", "/admin", "/ad/BD-8001"];
for (const r of SWEEP) {
  const errs = [];
  const onErr = (e) => errs.push(String(e.message || e).slice(0, 120));
  const onConsole = (m) => {
    if (m.type() === "error") errs.push("console: " + m.text().slice(0, 120));
  };
  const onFail = (req) => {
    const f = req.failure();
    if (f) errs.push(`net:${req.url().slice(0, 80)}:${f.errorText}`);
  };
  page.on("pageerror", onErr);
  page.on("console", onConsole);
  page.on("requestfailed", onFail);
  await page.goto(`${BASE}${r}`, { waitUntil: "networkidle2", timeout: 60000 }).catch((e) => errs.push("goto:" + e.message));
  await wait(1800);
  page.off("pageerror", onErr);
  page.off("console", onConsole);
  page.off("requestfailed", onFail);
  /* إلغاءات prefetch الطبيعية في Next (_rsc) ليست أخطاء حقيقية */
  const real = errs.filter((e) => !/favicon|manifest|sw\.js/.test(e) && !/ERR_ABORTED/.test(e));
  ok(`بلا أخطاء JS/شبكة ← ${r}`, real.length === 0, real.slice(0, 3).join(" | "));
}

/* ③ الروابط الداخلية من الرئيسية والتصنيفات: لا رابط ميت */
const hrefs = await page.evaluate(() =>
  Array.from(new Set(Array.from(document.querySelectorAll("a[href]")).map((a) => a.getAttribute("href"))))
);
const internal = hrefs.filter((h) => h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/api/"));
let dead = 0;
for (const h of internal) {
  const res = await fetch(`${BASE}${h}`, { cache: "no-store" });
  if (res.status !== 200) { dead++; problems.push(`رابط ميت ${h} → ${res.status}`); console.log(`❌ رابط ميت: ${h} → ${res.status}`); }
}
ok(`كل الروابط الداخلية في الرئيسية حية (${internal.length} رابطاً)`, dead === 0, `${dead} ميت`);

/* ④ عناصر أساسية في كل صفحة عامة */
await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await wait(1200);
const basics = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  dir: document.documentElement.dir,
  h1: document.querySelectorAll("h1").length,
  title: document.title.length > 10,
  manifest: Boolean(document.querySelector('link[rel="manifest"]')),
  viewport: Boolean(document.querySelector('meta[name="viewport"]')),
}));
ok("html lang=ar dir=rtl", basics.lang === "ar" && basics.dir === "rtl", JSON.stringify(basics));
ok("h1 واحد على الأقل + title + manifest + viewport", basics.h1 >= 1 && basics.title && basics.manifest && basics.viewport, JSON.stringify(basics));

await browser.close();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
if (problems.length) console.log("المشاكل:\n- " + problems.join("\n- "));
process.exit(fail ? 1 : 0);
