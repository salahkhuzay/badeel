/* ============================================================================
   فحص سرعة لوحة التحكم على «جوال مثقل» — موجة 22
   يحاكي هاتف صاحب المنصة: ذاكرة متصفح قديمة الصيغة بحجم ~2.7 ميغابايت
   (30 إعلاناً بصور + بانر ممول) ومعالج مخنوق 4 مرات (CDP throttling)،
   ثم يقيس: ظهور حقول الدخول ← قابلية الكتابة (اكتمال الإماهة) ← لوحة
   التحكم بعد الضغط. ويتحقق من ترحيل التخزين إلى المفاتيح المنفصلة.
   التشغيل: node qa/admin-speed.mjs [url]
   ========================================================================== */
import puppeteer from "puppeteer";

const BASE = process.argv[2] || "http://localhost:3000";
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`✅ ${name}`); }
  else { fail++; console.log(`❌ ${name} — ${extra}`); }
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* حالة قديمة الصيغة (مفتاح واحد) بحجم كبير: صور base64 زائفة */
const bigPhoto = () => "data:image/jpeg;base64," + "A".repeat(80 * 1024);
const legacyState = () => ({
  ads: Array.from({ length: 30 }, (_, i) => ({
    id: `ad-sp-${i}`,
    ref: `BD-9${String(100 + i)}`,
    title: `إعلان مثقل رقم ${i + 1}`,
    category: "phones",
    status: "active",
    price: 1000 + i,
    currency: "USD",
    photos: [bigPhoto()],
    createdAt: new Date().toISOString(),
    views: i,
  })),
  sponsored: [
    {
      id: "spn-big",
      advertiser: "معلن مثقل",
      title: "بانر مثقل",
      imageUrl: "data:image/png;base64," + "B".repeat(250 * 1024),
      startsAt: new Date().toISOString().slice(0, 10),
      endsAt: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      enabled: true,
    },
  ],
  theme: "dark",
});

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
/* خنق المعالج 4× لمحاكاة جوال متوسط */
const cdp = await page.createCDPSession();
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.evaluateOnNewDocument((st) => {
  localStorage.setItem("badeel.state.v1", JSON.stringify(st));
  localStorage.removeItem("badeel.ads.v1");
  localStorage.removeItem("badeel.sponsored.v1");
}, legacyState());

const t0 = Date.now();
await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForSelector('input[type="password"]', { timeout: 60000 });
const tFields = Date.now() - t0;

/* الكتابة تعلق حتى تكتمل إماهة React (الحقول مسيطَر عليها) — نعيد المحاولة
   حتى تثبت القيمة، ووقتها تكون اللوحة قابلة للاستعمال فعلاً */
const typeSticky = async (sel, text) => {
  for (let i = 0; i < 8; i++) {
    await page.click(sel);
    await page.type(sel, text, { delay: 5 });
    await wait(250);
    const v = await page.$eval(sel, (el) => el.value);
    if (v === text) return true;
    await page.$eval(sel, (el) => { el.value = ""; });
  }
  return false;
};
const typedUser = await typeSticky('input[type="text"], input:not([type="password"])', "admin");
const typedPass = await typeSticky('input[type="password"]', "Badeel@2026");
const tTypable = Date.now() - t0;
ok("حقول الدخول استقبلت الكتابة (إماهة مكتملة)", typedUser && typedPass);

const btn = await page.$('button[type="submit"], form button');
await page.waitForFunction(
  () => {
    const b = document.querySelector('button[type="submit"]') ||
      Array.from(document.querySelectorAll("button")).find((x) => /تسجيل الدخول/.test(x.textContent || ""));
    return b && !b.disabled;
  },
  { timeout: 30000 }
).catch(() => {});
await page.evaluate(() => {
  const b = document.querySelector('button[type="submit"]') ||
    Array.from(document.querySelectorAll("button")).find((x) => /تسجيل الدخول/.test(x.textContent || ""));
  b?.click();
});
await page
  .waitForFunction(() => /نظرة عامة|لوحة التحكم/.test(document.body.innerText), { timeout: 60000 })
  .catch(() => {});
const tPanel = Date.now() - t0;
const panelShown = /نظرة عامة|الإحصائيات|لوحة/.test(await page.evaluate(() => document.body.innerText));
ok("الدخول أتم وظهرت اللوحة", panelShown, `بعد ${tPanel}ms`);

console.log(
  `⏱️ الحقول ظاهرة: ${tFields}ms · قابلة للكتابة: ${tTypable}ms · اللوحة بعد الدخول: ${tPanel}ms (خنق 4× وحالة ~2.7MB)`
);
ok("اللوحة الكاملة تحت 12 ثانية على جوال مثقل", tPanel < 12000, `${tPanel}ms`);
ok("الحقول قابلة للكتابة تحت 8 ثوانٍ", tTypable < 8000, `${tTypable}ms`);

/* الترحيل: المفاتيح الثقيلة انفصلت عن مفتاح الإعدادات الخفيف */
const storage = await page.evaluate(() => ({
  light: localStorage.getItem("badeel.state.v1") || "",
  ads: localStorage.getItem("badeel.ads.v1") || "",
  spn: localStorage.getItem("badeel.sponsored.v1") || "",
}));
const lightHasNoAds = !storage.light.includes('"ads"');
let adsCount = 0;
try { adsCount = (JSON.parse(storage.ads)?.ads || []).length; } catch { /* ignore */ }
ok(
  "الترحيل: الإعلانات انتقلت لمفتاحها الخاص والمفتاح الخفيف بلا صور",
  adsCount === 30 && lightHasNoAds && storage.light.length < 20000 && storage.spn.includes("spn-big"),
  `ads=${adsCount} light=${storage.light.length}b`
);
const loggedInPersisted = storage.light.includes('"loggedIn":true');
ok("الدخول سُجّل في المفتاح الخفيف فوراً", loggedInPersisted);

/* تحميل ثانٍ بالصيغة الجديدة: أسرع (بلا ترحيل وبلا تحليل الصور قبل الدخول) */
await page.evaluate(() => localStorage.removeItem("badeel.state.v1")); /* خروج من الجلسة */
const t1 = Date.now();
await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForSelector('input[type="password"]', { timeout: 60000 });
const t2Fields = Date.now() - t1;
console.log(`⏱️ تحميل ثانٍ — الحقول ظاهرة: ${t2Fields}ms`);
ok("التحميل الثاني: الحقول تحت 5 ثوانٍ", t2Fields < 5000, `${t2Fields}ms`);

await browser.close();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail ? 1 : 0);
