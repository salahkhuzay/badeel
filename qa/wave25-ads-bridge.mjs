/* ============================================================================
   فحص جسر الإعلانات Supabase — موجة 25
   يشغّل محاكي Supabase (qa/supabase-stub.mjs) + نسخة Next على :3002 بمتغيرات
   الجسر، ثم يتحقق من الدورة الكاملة: نشر زائر ⇒ تعليق ⇒ موافقة المدير ⇒
   ظهور لكل الزوار ⇒ حذف. وفي النهاية يقتل كل ما أطلقه.
   التشغيل: node qa/wave25-ads-bridge.mjs
   ========================================================================== */
import { spawn } from "node:child_process";
import puppeteer from "puppeteer";

const KEY = "qa-key-123";
const BASE = "http://localhost:3002";
const STUB = 9877;
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`✅ ${name}`); }
  else { fail++; console.log(`❌ ${name} — ${extra}`); }
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const stub = spawn("node", ["qa/supabase-stub.mjs", String(STUB)], { stdio: "ignore" });
const srv = spawn("./node_modules/.bin/next", ["start", "-H", "0.0.0.0", "-p", "3002"], {
  env: {
    ...process.env,
    SUPABASE_URL: `http://localhost:${STUB}`,
    SUPABASE_SERVICE_ROLE_KEY: "stub-key",
    RATE_WRITE_KEY: KEY,
  },
  stdio: "ignore",
});
const cleanup = () => { stub.kill(); srv.kill(); };
process.on("exit", cleanup);

/* انتظار جهوزية الخادم */
let up = false;
for (let i = 0; i < 60 && !up; i++) {
  await wait(1000);
  up = await fetch(BASE, { cache: "no-store" }).then((r) => r.ok).catch(() => false);
}
if (!up) { console.log("❌ الخادم :3002 لم يستجب"); cleanup(); process.exit(1); }

const tiny = "data:image/jpeg;base64," + "A".repeat(4000);
const ad = {
  id: "ad-bridge-1",
  ref: "BD-9501",
  title: "شقة جسر الإعلانات للاختبار",
  description: "إعلان فحص دورة النشر والموافقة والحذف.",
  category: "real-estate",
  status: "active", /* سيُجبَر إلى pending من الخادم */
  price: 1000, currency: "USD", priceUsd: 1000, priceSyp: 13000000, negotiable: false,
  cityId: "manbij",
  images: [tiny],
  sellerName: "فاحص", sellerPhone: "0933177597", sellerWhatsapp: "0933177597",
  featured: false, views: 0, createdAt: new Date().toISOString(),
};

/* ① الجسر مضبوط والقائمة فارغة */
const g0 = await fetch(`${BASE}/api/ads`, { cache: "no-store" }).then((r) => r.json());
ok("الجسر مضبوط والقائمة تبدأ فارغة", g0.bridgeConfigured === true && g0.ads.length === 0, JSON.stringify(g0));

/* ② نشر زائر ⇒ pending + صورة مرفوعة برابط عام */
const post = await fetch(`${BASE}/api/ads`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ad }),
}).then((r) => r.json());
ok(
  "نشر الزائر: pending + رابط صورة من التخزين",
  post.ok === true && post.ad.status === "pending" && String(post.ad.images?.[0] || "").includes(`/storage/v1/object/public/ads/`),
  JSON.stringify(post).slice(0, 140)
);
const imgOk = await fetch(post.ad?.images?.[0] ?? "", { cache: "no-store" })
  .then((r) => r.ok && (r.headers.get("content-type") || "").includes("image"))
  .catch(() => false);
ok("رابط الصورة يخدم صورة فعلية", imgOk);

/* ③ المعلّق مخفي عن الزوار ومرئي للمدير بالمفتاح فقط */
const pub1 = await fetch(`${BASE}/api/ads`, { cache: "no-store" }).then((r) => r.json());
const admNoKey = await fetch(`${BASE}/api/ads?scope=admin`, { cache: "no-store" });
const adm = await fetch(`${BASE}/api/ads?scope=admin&key=${KEY}`, { cache: "no-store" }).then((r) => r.json());
ok("المعلّق مخفي عن النطاق العام", !pub1.ads.some((a) => a.id === ad.id));
ok("نطاق المدير بلا مفتاح ⇒ 401", admNoKey.status === 401, String(admNoKey.status));
ok("نطاق المدير بالمفتاح يرى المعلّق", adm.ads.some((a) => a.id === ad.id && a.status === "pending"));

/* ④ موافقة المدير ⇒ يظهر للجميع */
const patch = await fetch(`${BASE}/api/ads/${ad.id}`, {
  method: "PATCH", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: KEY, patch: { status: "active", publishedAt: new Date().toISOString(), moderatedBy: "admin" } }),
}).then((r) => r.json());
const pub2 = await fetch(`${BASE}/api/ads`, { cache: "no-store" }).then((r) => r.json());
ok("موافقة المدير تنشر الإعلان للجميع", patch.ok === true && pub2.ads.some((a) => a.id === ad.id && a.status === "active"));

/* ⑤ واجهة الزائر ترى الإعلان وصورته من الجسر */
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await wait(2200);
const ui = await page.evaluate((t) => ({
  title: document.body.innerText.includes(t),
  img: Array.from(document.querySelectorAll("img")).some((i) => (i.getAttribute("src") || "").includes("/storage/v1/object/public/ads/")),
}), ad.title);
ok("واجهة الزائر: العنوان وصورة التخزين ظاهران", ui.title && ui.img, JSON.stringify(ui));

/* ⑥ تعديل بلا مفتاح مرفوض */
const noKey = await fetch(`${BASE}/api/ads/${ad.id}`, {
  method: "PATCH", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ patch: { status: "active" } }),
});
ok("تعديل بلا مفتاح ⇒ 401", noKey.status === 401, String(noKey.status));

/* ⑦ الحذف يخفي الإعلان ويحذف الصورة */
const del = await fetch(`${BASE}/api/ads/${ad.id}`, {
  method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: KEY }),
}).then((r) => r.json());
const pub3 = await fetch(`${BASE}/api/ads`, { cache: "no-store" }).then((r) => r.json());
const imgGone = await fetch(ad.images[0].includes("/storage/v1/object/public/ads/") ? post.ad.images[0] : "", { cache: "no-store" }).then((r) => r.status === 404).catch(() => true);
ok("الحذف: اختفى من القائمة ومن التخزين", del.ok === true && !pub3.ads.some((a) => a.id === ad.id) && imgGone);

await browser.close();
cleanup();
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail ? 1 : 0);
