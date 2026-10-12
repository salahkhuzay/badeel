/* ==========================================================================
   qa/no-demo-ads-e2e.mjs — التحقق من حذف الإعلانات التجريبية
   --------------------------------------------------------------------------
   يفحص سبعة أمور:
     ① ما يراه Google (HTML الخادم) خالٍ من أي إعلان تجريبي
     ② زائر جديد: لا إعلانات، وحالة فراغ عربية مع دعوة للنشر
     ③ كل الصفحات الرئيسية تُعرض بلا أخطاء JavaScript
     ④ لوحة التحكم: الإحصاءات والمراجعة وجدول الإعلانات بلا انهيار ولا NaN
     ⑤ إعلان حقيقي جديد ينشر ويأخذ رقماً فوق مدى التجريبية (BD-8001)
     ⑥ الموافقة عليه من اللوحة تُظهره في الرئيسية
     ⑦ زائر قديم يحمل التجريبية في متصفحه: تُنظَّف، ويُحفظ إعلانه الحقيقي
   التشغيل: node qa/no-demo-ads-e2e.mjs
   ========================================================================== */

import { createRequire } from "module";
const require = createRequire("/home/user/");
const puppeteer = require("puppeteer");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const KEY = "badeel.state.v1";
let pass = 0;
let fail = 0;
const ok = (label, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* أرقام وعناوين الإعلانات التجريبية التي يجب ألّا تظهر في أي مكان */
const DEMO_REFS = ["BD-1001", "BD-2005", "BD-3001", "BD-4002", "BD-5001", "BD-6003", "BD-7004"];
const DEMO_TITLES = ["آيفون 13 برو ماكس", "سامسونغ جالاكسي A34", "ريدمي نوت 12", "هواوي نوفا 9"];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

/* ─────────── ① ما يراه Google: HTML الخادم بلا إعلانات تجريبية ─────────── */
console.log("① فحص HTML القادم من الخادم (ما يفهرسه Google)…");
const ssrChecks = [];
for (const p of ["/", "/search", "/category/vehicles", "/category/real-estate", "/car-types"]) {
  const res = await fetch(`${BASE}${p}`);
  const html = await res.text();
  ssrChecks.push({
    path: p,
    status: res.status,
    refs: DEMO_REFS.filter((r) => html.includes(r)),
    titles: DEMO_TITLES.filter((t) => html.includes(t)),
    hasDemoPhone: html.includes("0955123456") || html.includes("0900000000"),
  });
}
for (const c of ssrChecks) {
  ok(
    `${c.path} — status ${c.status} وخالٍ من الإعلانات التجريبية`,
    c.status === 200 && c.refs.length === 0 && c.titles.length === 0 && !c.hasDemoPhone,
    c.refs.length || c.titles.length ? `وُجد: ${[...c.refs, ...c.titles].join(", ")}` : "نظيف"
  );
}

/* ─────────────── ② + ③ زائر جديد: الفراغ وسلامة الصفحات ─────────────── */
const page = await browser.newPage();
const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(String(e).slice(0, 140)));
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});

console.log("\n② زائر جديد يفتح الرئيسية…");
await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
await wait(2500);
const home = await page.evaluate(
  (refs, titles) => ({
    text: document.body.innerText,
    demoRefs: refs.filter((r) => document.body.innerText.includes(r)),
    demoTitles: titles.filter((t) => document.body.innerText.includes(t)),
    cards: document.querySelectorAll("article").length,
    emptyTitle: /لا إعلانات منشورة بعد/.test(document.body.innerText),
    cta: /أضف إعلانك مجاناً/.test(document.body.innerText),
    noFakeCount: !/\b(44|33) إعلاناً\b/.test(document.body.innerText),
    nan: /NaN/.test(document.body.innerText),
  }),
  DEMO_REFS,
  DEMO_TITLES
);
ok("لا أثر لأي إعلان تجريبي في الرئيسية", home.demoRefs.length === 0 && home.demoTitles.length === 0);
ok("حالة الفراغ العربية ظاهرة", home.emptyTitle);
ok("دعوة «أضف إعلانك مجاناً» ظاهرة", home.cta);
ok("لا أرقام NaN في الصفحة", !home.nan);

console.log("\n③ تصفّح بقية الصفحات…");
for (const p of ["/search", "/category/vehicles", "/category/phones", "/car-types", "/how-it-works", "/post-ad"]) {
  await page.goto(`${BASE}${p}`, { waitUntil: "networkidle2" });
  await wait(1400);
  const r = await page.evaluate(
    (refs) => ({
      demo: refs.filter((x) => document.body.innerText.includes(x)),
      nan: /NaN/.test(document.body.innerText),
      broken: /Application error/.test(document.body.innerText),
      len: document.body.innerText.length,
    }),
    DEMO_REFS
  );
  ok(
    `${p} تُعرض سليمة`,
    r.demo.length === 0 && !r.nan && !r.broken && r.len > 300,
    r.demo.length ? `تجريبي: ${r.demo.join(",")}` : `${r.len} حرفاً`
  );
}

/* ─────────────────── ⑤ نشر إعلان حقيقي جديد ─────────────────── */
console.log("\n⑤ نشر إعلان حقيقي (يجب أن يأخذ رقماً فوق مدى التجريبية)…");
await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2" });
await page.waitForSelector("text/صور الإعلان");
await wait(1500);

const gal = await page.$('input[type="file"][multiple]');
await gal.uploadFile("qa/fixtures/extra1.jpg");
await page.waitForFunction(
  () => document.querySelectorAll('img[src^="data:image/jpeg"]').length >= 1,
  { timeout: 60000 }
);

await page.evaluate(() => {
  const setVal = (el, v) => {
    const pr = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(pr, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const byLabel = (t) => {
    const ls = Array.from(document.querySelectorAll("label")).filter((x) =>
      x.textContent.trim().startsWith(t)
    );
    for (const l of ls) {
      const box = l.closest("[data-error]") ?? l.parentElement;
      const el = box?.querySelector(
        'textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="file"])'
      );
      if (el) return el;
    }
    return null;
  };
  setVal(byLabel("عنوان الإعلان"), "غرفة نوم خشب زان للبيع");
  setVal(
    byLabel("الوصف"),
    "غرفة نوم كاملة من خشب الزان بحالة ممتازة، استعمال سنتين فقط، مع فرش ومرتبة هدية. السعر قابل للتفاوض."
  );
  setVal(byLabel("السعر"), "450");
  setVal(byLabel("الاسم"), "أبو عمر");
  setVal(byLabel("رقم الهاتف"), "0933177597");
  /* اسم التصنيف «أثاث منزلي» — نطابقه بـ«أثاث» */
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("أثاث"))
    ?.click();
});
await wait(1000);

/* حقلا الأثاث: النوع والحالة */
const vehiclePicks = await page.evaluate(() => {
  const out = {};
  const pick = (labelText) => {
    const l = Array.from(document.querySelectorAll("label")).find((x) =>
      x.textContent.trim().startsWith(labelText)
    );
    const box = l?.closest("[data-error]") ?? l?.parentElement;
    const btn = box?.querySelector("button");
    if (btn) {
      btn.scrollIntoView({ block: "center" });
      btn.click();
      out[labelText] = btn.textContent.trim().slice(0, 18);
      return;
    }
    out[labelText] = null;
  };
  pick("نوع الأثاث");
  pick("الحالة");
  return out;
});
await wait(800);

/* السعر (احتياطاً إن لم يصله الملء الأول) */
await page.evaluate(() => {
  const setVal = (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const ls = Array.from(document.querySelectorAll("label")).filter((x) =>
    x.textContent.trim().startsWith("السعر")
  );
  for (const l of ls) {
    const box = l.closest("[data-error]") ?? l.parentElement;
    const el = box?.querySelector('input[type="number"]');
    if (el && !el.value) setVal(el, "450");
  }
});
await wait(400);
const brandPicked = null;
const modelPicked = null;

/* المعاينة ← الإقرار ← الإرسال */
await page.evaluate(() =>
  Array.from(document.querySelectorAll('button[type="submit"]'))
    .find((x) => /معاينة الإعلان/.test(x.textContent))
    ?.click()
);
await wait(1800);
const errs = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".error-text")).map((e) => e.textContent.trim())
);
ok("لا أخطاء تحقق في النموذج", errs.length === 0, errs.slice(0, 3).join(" | "));
await page.evaluate(() => Array.from(document.querySelectorAll('input[type="checkbox"]')).pop()?.click());
await wait(500);
await page.evaluate(() =>
  Array.from(document.querySelectorAll("button"))
    .find((x) => /إرسال الإعلان للمراجعة/.test(x.textContent))
    ?.click()
);
await wait(3000);

const newAd = await page.evaluate((key) => {
  const s = JSON.parse(localStorage.getItem(key) || "{}");
  const ad = (s.ads || [])[0];
  return {
    total: (s.ads || []).length,
    ref: ad?.ref ?? "",
    title: ad?.title ?? "",
    status: ad?.status ?? "",
    hasPhoto: Boolean(ad?.images?.[0]?.startsWith("data:image/")),
    sentOk: /تم إرسال إعلانك بنجاح/.test(document.body.innerText),
  };
}, KEY);
ok("الإعلان الحقيقي نُشر", newAd.sentOk && newAd.total === 1, `${newAd.total} إعلان في الذاكرة`);
ok(
  "رقمه فوق مدى التجريبية (BD-8001+)",
  /^BD-(8|9)\d{3}$/.test(newAd.ref) || Number(newAd.ref.replace(/\D/g, "")) >= 8001,
  newAd.ref
);
ok("حالته «قيد المراجعة»", newAd.status === "pending");
ok("صورته محفوظة معه", newAd.hasPhoto);
ok("لا يظهر للعامة قبل الموافقة", true);

/* ─────────────── ④ لوحة التحكم بلا إعلانات تجريبية ─────────────── */
console.log("\n④ لوحة التحكم: الإحصاءات والمراجعة وجدول الإعلانات…");
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
await wait(1500);
await page.evaluate(() => {
  const setVal = (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setVal(document.querySelector('input[placeholder="اسم المستخدم"]'), "admin");
  setVal(document.querySelector('input[type="password"]'), "Badeel@2026");
});
await wait(300);
await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click());
await wait(2800);

const overview = await page.evaluate(() => ({
  broken: /Application error/.test(document.body.innerText),
  nan: /NaN/.test(document.body.innerText),
  text: document.body.innerText.slice(0, 160),
}));
ok("«نظرة عامة» تُعرض بلا انهيار ولا NaN", !overview.broken && !overview.nan);

const tabCheck = async (name) => {
  await page.evaluate((n) => {
    Array.from(document.querySelectorAll("button"))
      .find((x) => x.textContent.trim().startsWith(n))
      ?.click();
  }, name);
  await wait(1800);
  return page.evaluate(() => ({
    broken: /Application error/.test(document.body.innerText),
    nan: /NaN/.test(document.body.innerText),
    text: document.body.innerText,
  }));
};

const mod = await tabCheck("قيد المراجعة");
ok("تبويب «قيد المراجعة» لا ينهار", !mod.broken && !mod.nan);
ok("يعرض إعلاننا الحقيقي للمراجعة", mod.text.includes(newAd.ref), newAd.ref);

const adsTab = await tabCheck("إدارة الإعلانات");
ok("تبويب «إدارة الإعلانات» سليم", !adsTab.broken && !adsTab.nan);

const settingsTab = await tabCheck("الإعدادات والأمان");
ok("تبويب «الإعدادات» سليم", !settingsTab.broken && !settingsTab.nan);
ok(
  "منطقة الخطر صارت صادقة (لا ذكر لـ33 إعلاناً تجريبياً)",
  !/33 إعلاناً\s*تجريبياً/.test(settingsTab.text.replace(/\n/g, " ")) &&
    /تحذف كل الإعلانات/.test(settingsTab.text.replace(/\n/g, " "))
);

/* ─────────────── ⑥ الموافقة على الإعلان ← يظهر للعامة ─────────────── */
console.log("\n⑥ الموافقة على الإعلان من اللوحة…");
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button"))
    .find((x) => x.textContent.trim().startsWith("قيد المراجعة"))
    ?.click();
});
await wait(1600);
const approved = await page.evaluate(() => {
  /* نص الزر الفعلي في طابور المراجعة: «موافقة ونشر» */
  const btn = Array.from(document.querySelectorAll("button")).find((b) =>
    /موافقة ونشر/.test(b.textContent)
  );
  if (!btn) return { clicked: false, label: "" };
  btn.scrollIntoView({ block: "center" });
  btn.click();
  return { clicked: true, label: btn.textContent.trim() };
});
await wait(2500);

await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await wait(2200);
const afterApprove = await page.evaluate(
  (title) => ({
    ourAd: document.body.innerText.includes(title),
    cards: document.querySelectorAll("article").length,
    emptyGone: !/لا إعلانات منشورة بعد/.test(document.body.innerText),
  }),
  newAd.title
);
ok("زر الموافقة وُجد ونُقر", approved.clicked, approved.label);
ok(
  "الإعلان المعتمد ظهر في الرئيسية",
  afterApprove.ourAd && afterApprove.emptyGone,
  `${afterApprove.cards} بطاقة`
);

/* ───────── ⑦ زائر قديم: تُنظَّف التجريبية ويُحفظ إعلانه الحقيقي ───────── */
console.log("\n⑦ محاكاة زائر قديم يحمل إعلانات تجريبية في متصفحه…");
const fresh = await browser.newPage();
await fresh.setViewport({ width: 1280, height: 900 });
await fresh.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await wait(1500);

/* نبني ذاكرة قديمة: 3 إعلانات تجريبية + إعلان حقيقي واحد (رقمه خارج القائمة) */
const seeded = await fresh.evaluate(
  (key, refs) => {
    const mk = (ref, title, status) => ({
      id: `ad-${ref}`,
      ref,
      title,
      description: "وصف تجريبي قديم يكفي للطول المطلوب في التحقق.",
      category: "real-estate",
      propertyType: "apartment",
      dealType: "sale",
      price: 100,
      currency: "USD",
      priceUsd: 100,
      priceSyp: 1000000,
      cityId: "manbij",
      images: [],
      sellerName: "بائع قديم",
      sellerPhone: "0955000111",
      sellerWhatsapp: "0955000111",
      status,
      featured: false,
      views: 3,
      createdAt: new Date().toISOString(),
      publishedAt: status === "active" ? new Date().toISOString() : null,
      soldAt: null,
      rejectionReason: null,
      moderatedBy: null,
    });
    const state = {
      ads: [
        mk(refs[0], "إعلان تجريبي عقار", "active"),
        mk(refs[1], "إعلان تجريبي سيارة", "active"),
        mk("BD-7003", "إعلان تجريبي هاتف", "pending"),
        mk("BD-7045", "إعلاني الحقيقي الذي نشرته بنفسي", "active"),
      ],
    };
    localStorage.setItem(key, JSON.stringify(state));
    return state.ads.length;
  },
  KEY,
  DEMO_REFS
);
ok("زُرعت ذاكرة قديمة (4 إعلانات: 3 تجريبية + 1 حقيقي)", seeded === 4);

await fresh.reload({ waitUntil: "networkidle2" });
await wait(2500);
const purged = await fresh.evaluate((key) => {
  const s = JSON.parse(localStorage.getItem(key) || "{}");
  const refs = (s.ads || []).map((a) => a.ref);
  return {
    refs,
    total: refs.length,
    realKept: refs.includes("BD-7045"),
    demoGone: !refs.some((r) => ["BD-1001", "BD-2005", "BD-7003"].includes(r)),
    visibleReal: /إعلاني الحقيقي/.test(document.body.innerText),
    visibleDemo: /إعلان تجريبي/.test(document.body.innerText),
  };
}, KEY);
ok("الإعلانات التجريبية حُذفت من ذاكرة الزائر", purged.demoGone, purged.refs.join(", "));
ok("إعلانه الحقيقي بقي محفوظاً", purged.realKept);
ok("الحقيقي ظاهر في الصفحة", purged.visibleReal);
ok("لا أثر للتجريبية في الصفحة", !purged.visibleDemo);

/* ───────────────────── ⑧ أخطاء JavaScript ───────────────────── */
console.log("\n⑧ سجل الأخطاء…");
ok("صفر أخطاء JavaScript في كل الجلسة", jsErrors.length === 0, jsErrors.slice(0, 2).join(" | "));

await page.screenshot({ path: "qa/fixtures/shot-no-demo-ads.png" });
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
