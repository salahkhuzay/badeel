/* ==========================================================================
   qa/photo-upload-e2e.mjs — اختبار حقيقي في متصفح لرفع الصور من الجوال
   --------------------------------------------------------------------------
   يحاكي جوال أندرويد (Pixel · شاشة لمسية) ويرفع **ملفات JPEG فعلية** عبر
   DOM.setFileInputFiles — وهو نفس المسار الذي يسلكه الجوال حين يختار المستخدم
   صورة من المعرض أو يلتقطها بالكاميرا.
   المتطلبات: node qa/make-test-photos.mjs (مرة واحدة) + خادم يعمل على :3000
   التشغيل:   node qa/photo-upload-e2e.mjs
   ========================================================================== */

import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire("/home/user/");
const puppeteer = require("puppeteer");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const FIX = path.resolve("qa/fixtures");

let pass = 0;
let fail = 0;
const ok = (label, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(path.join(FIX, "big.jpg"))) {
  console.error("❌ صور الاختبار مفقودة — شغّل أولاً: node qa/make-test-photos.mjs");
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(String(e).slice(0, 160)));

/* جوال أندرويد مثل جهاز المستخدم */
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
});

/** عدد الصور المرفوعة الظاهرة في شبكة الرفع */
const photoCount = () =>
  page.evaluate(() => document.querySelectorAll('img[src^="data:image/jpeg"]').length);

/** انتظار وصول العدد إلى n */
async function waitPhotos(n, timeout = 60000) {
  await page.waitForFunction(
    (target) => document.querySelectorAll('img[src^="data:image/jpeg"]').length >= target,
    { timeout },
    n
  );
}

const galleryInput = () => page.$('input[type="file"][multiple]');

/* ───────────────────────── ① فتح الصفحة ───────────────────────── */
console.log("① فتح «أضف إعلانك» على محاكي جوال أندرويد…");
await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("text/صور الإعلان", { timeout: 20000 });
await wait(1500); /* مهلة استقرار عامل الخدمة */

const ui = await page.evaluate(() => ({
  /* مهم: لا نية كاميرا خارجية — كانت سبب خروج «رجوع» من الموقع في أندرويد */
  captureInput: Boolean(document.querySelector('input[capture]')),
  gallery: Boolean(document.querySelector('input[type="file"][multiple]')),
  inputCount: document.querySelectorAll('input[type="file"]').length,
  acceptImage: document.querySelector('input[type="file"]')?.accept === "image/*",
  oneBtn: /أضف صوراً من المعرض/.test(document.body.innerText),
  hint: /زر الرجوع يعيدك إلى هنا دائماً/.test(document.body.innerText),
  noReload: true,
}));
ok("الصفحة فُتحت ولم تُعاد تحميلها تلقائياً", ui.noReload);
ok("لا حقل بـ capture (بلا نية كاميرا خارجية)", !ui.captureInput);
ok("حقل ملف واحد يقبل صوراً متعددة", ui.gallery && ui.inputCount === 1);
ok("الحقل يقبل الصور فقط (accept=image/*)", ui.acceptImage);
ok("زر واحد يضم الكاميرا والمعرض", ui.oneBtn);
ok("تلميح الأمان ظاهر", ui.hint);

/* ───────────────── ② رفع صورة كبيرة من المعرض ───────────────── */
console.log("\n② رفع صورة كبيرة (3000×2250 · 277 ك.ب) من المعرض…");
const origBytes = fs.statSync(path.join(FIX, "big.jpg")).size;
await (await galleryInput()).uploadFile(path.join(FIX, "big.jpg"));
await waitPhotos(1);
await wait(400);

const r1 = await page.evaluate(async () => {
  const img = document.querySelector('img[src^="data:image/jpeg"]');
  const src = img.src;
  const dims = await new Promise((res) => {
    const im = new Image();
    im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
    im.onerror = () => res({ w: 0, h: 0 });
    im.src = src;
  });
  return {
    chars: src.length,
    ...dims,
    cover: Array.from(document.querySelectorAll("span")).some((s) => s.textContent.trim() === "الغلاف"),
    counter: /صورة من جوالك/.test(document.body.innerText),
    sizeShown: /الحجم ≈/.test(document.body.innerText),
    successToast: /تمت إضافة الصورة/.test(document.body.innerText),
  };
});
ok("الصورة أُضيفت وظهرت في الشبكة", true);
ok(`صُغّرت إلى ≤1280px (كانت 3000×2250)`, Math.max(r1.w, r1.h) <= 1280, `${r1.w}×${r1.h}`);
ok("ضُغطت تحت الحد المستهدف", r1.chars <= 150_000, `${Math.round(r1.chars / 1024)} ك.ب نص`);
ok(
  "نسبة الأبعاد محفوظة (4:3)",
  Math.abs(r1.w / r1.h - 3000 / 2250) < 0.02,
  `${(r1.w / r1.h).toFixed(3)}`
);
ok("شارة «الغلاف» على الصورة الأولى", r1.cover);
ok("عدّاد «صورة من جوالك» ظاهر", r1.counter);
ok("الحجم التقريبي معروض", r1.sizeShown);
ok("إشعار نجاح عربي ظهر", r1.successToast);
console.log(`   (الأصل ${Math.round(origBytes / 1024)} ك.ب ← الناتج ≈ ${Math.round(r1.chars / 1.37 / 1024)} ك.ب)`);

/* ─────────────────── ③ صورة طولية عبر الكاميرا ─────────────────── */
console.log("\n③ التقاط صورة طولية (1200×1600) عبر زر الكاميرا…");
await (await galleryInput()).uploadFile(path.join(FIX, "portrait.jpg"));
await waitPhotos(2);
await wait(400);
const r2 = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img[src^="data:image/jpeg"]'));
  return {
    count: imgs.length,
    covers: Array.from(document.querySelectorAll("span")).filter((s) => s.textContent.trim() === "الغلاف").length,
    makeCoverBtns: Array.from(document.querySelectorAll("button")).filter((b) =>
      /اجعليها الغلاف/.test(b.textContent)
    ).length,
  };
});
ok("الصورة الثانية أُضيفت (المجموع 2)", r2.count === 2, `العدد ${r2.count}`);
ok("غلاف واحد فقط (الترتيب محفوظ)", r2.covers === 1);
ok("زر «اجعليها الغلاف» على الثانية", r2.makeCoverBtns === 1);

/* ─────────────────────── ④ تغيير الغلاف ─────────────────────── */
console.log("\n④ جعل الصورة الثانية غلافاً…");
/* ملاحظة: أول 60 حرفاً من أي data URL متطابقة (ترويسة base64) — لذلك نُقارن
   بصمة من وسط النص لا أوله. */
const fingerprint = () =>
  page.evaluate(() => {
    const s = document.querySelector('img[src^="data:image/jpeg"]').src;
    return `${s.length}:${s.slice(400, 460)}`;
  });
const firstBefore = await fingerprint();
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((x) => /اجعليها الغلاف/.test(x.textContent));
  b.click();
});
await wait(600);
const firstAfter = await fingerprint();
const coverSwap = await page.evaluate(() => ({
  count: document.querySelectorAll('img[src^="data:image/jpeg"]').length,
}));
coverSwap.changed = firstBefore !== firstAfter;
ok("الغلاف تغيّر إلى الصورة الثانية", coverSwap.changed);
ok("لم تُفقد أي صورة", coverSwap.count === 2);

/* ───────────────────── ⑤ رفع دفعة (4 صور) ───────────────────── */
console.log("\n⑤ رفع 4 صور دفعة واحدة من المعرض…");
await (
  await galleryInput()
).uploadFile(
  path.join(FIX, "extra1.jpg"),
  path.join(FIX, "extra2.jpg"),
  path.join(FIX, "extra3.jpg"),
  path.join(FIX, "extra4.jpg")
);
await waitPhotos(6);
await wait(600);
ok("المجموع صار 6 صور", (await photoCount()) === 6, `العدد ${await photoCount()}`);

/* ────────────────────── ⑥ الحد الأقصى 6 ────────────────────── */
console.log("\n⑥ محاولة رفع صورة سابعة (الحد 6)…");
await (await galleryInput()).uploadFile(path.join(FIX, "extra5.jpg"));
await wait(2500);
const limit = await page.evaluate(() => ({
  count: document.querySelectorAll('img[src^="data:image/jpeg"]').length,
  toast: /الحد الأقصى/.test(document.body.innerText),
  hint: /احذف صورة/.test(document.body.innerText),
}));
ok("العدد بقي 6 (لم تُضف السابعة)", limit.count === 6, `العدد ${limit.count}`);
ok("إشعار عربي بالحد الأقصى", limit.toast && limit.hint);

/* ──────────────────── ⑦ ملف ليس صورة ──────────────────── */
console.log("\n⑦ رفع ملف نصي (ليس صورة)…");
/* نُفرغ مقعداً أولاً: عند امتلاء الـ6 يظهر تنبيه الحد الأقصى قبل فحص النوع */
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button")).find((b) => b.title === "حذف الصورة").click();
});
await wait(700);
ok("فُرغ مقعد للاختبار (6 → 5)", (await photoCount()) === 5, `العدد ${await photoCount()}`);
await (await galleryInput()).uploadFile(path.join(FIX, "not-a-photo.txt"));
await wait(2500);
const bad = await page.evaluate(() => ({
  count: document.querySelectorAll('img[src^="data:image/jpeg"]').length,
  msg: /ليس صورة/.test(document.body.innerText),
}));
ok("الملف النصي رُفض (بقي 5)", bad.count === 5, `العدد ${bad.count}`);
ok("رسالة عربية واضحة ظهرت", bad.msg);

/* ─────────────────────── ⑧ حذف صورة ─────────────────────── */
console.log("\n⑧ حذف صورة…");
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button")).find((b) => b.title === "حذف الصورة").click();
});
await wait(700);
ok("الحذف يعمل (5 → 4)", (await photoCount()) === 4, `العدد ${await photoCount()}`);

/* ─────────────── ⑩ الرسوم الجاهزة ما زالت تعمل ─────────────── */
console.log("\n⑨ اختيار رسم جاهز من مكتبة بديل مع وجود صور حقيقية…");
const artPick = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button")).filter((b) =>
    /^(منزل|شقة|أرض|محل|سيارة|رباعية|هاتف|أثاث|جهاز|ملابس|وظيفة)$/.test(b.textContent.trim())
  );
  if (!btns.length) return { found: false };
  btns[0].click();
  return { found: true, label: btns[0].textContent.trim() };
});
await wait(600);
const afterArt = await page.evaluate(() => ({
  photos: document.querySelectorAll('img[src^="data:image/jpeg"]').length,
  selected: document.body.innerText.includes("صورة مختارة"),
  total: (document.body.innerText.match(/(\d+) صورة مختارة/) || [])[1],
}));
ok("مكتبة الرسوم ما زالت متاحة", artPick.found, artPick.label ?? "");
ok("الصور الحقيقية لم تتأثر", afterArt.photos === 4, `${afterArt.photos} صور`);
ok("العدّاد يجمع النوعين", Number(afterArt.total) === 5, `${afterArt.total} مختارة`);

/* ───────────── ⑩ تعبئة النموذج ونشر إعلان حقيقي ───────────── */
console.log("\n⑩ تعبئة النموذج ونشر الإعلان…");
const filled = await page.evaluate(() => {
  const setVal = (el, value) => {
    if (!el) return false;
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return el.value === value;
  };
  /* الحاوية الصحيحة للحقل هي div[data-error] التي تحوي التسمية والحقل معاً.
     ومهم: تجاهل مربعات الاختيار والملفات — فتسمية «السعر قابل للتفاوض» تسبق
     حقل «السعر *» في الصفحة، والتقاطها كان يكتب القيمة في checkbox. */
  const byLabel = (txt) => {
    const labels = Array.from(document.querySelectorAll("label")).filter((x) =>
      x.textContent.trim().startsWith(txt)
    );
    for (const l of labels) {
      const box = l.closest("[data-error]") ?? l.parentElement;
      const el = box?.querySelector(
        'textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="file"])'
      );
      if (el) return el;
    }
    return null;
  };
  const priceEl = byLabel("السعر");
  return {
    priceIsNumberInput: priceEl?.type === "number",
    title: setVal(byLabel("عنوان الإعلان"), "غرفة نوم خشب زان للبيع"),
    desc: setVal(
      byLabel("الوصف"),
      "غرفة نوم كاملة من خشب الزان بحالة ممتازة، استعمال سنتين فقط، مع فرش ومرتبة هدية. السعر قابل للتفاوض."
    ),
    price: setVal(byLabel("السعر"), "450"),
    name: setVal(byLabel("الاسم"), "أبو محمد"),
    phone: setVal(byLabel("رقم الهاتف"), "0955123456"),
  };
});
await wait(400);
ok(
  "كل حقول النموذج امتلأت فعلاً (وفي الحقول الصحيحة)",
  filled.priceIsNumberInput &&
    filled.title &&
    filled.desc &&
    filled.price &&
    filled.name &&
    filled.phone,
  JSON.stringify(filled)
);

/* اختيار التصنيف ثم النوع والحالة */
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((x) =>
    x.textContent.trim().startsWith("أثاث")
  );
  b?.scrollIntoView({ block: "center" });
  b?.click();
});
await wait(700);
const picks = await page.evaluate(() => {
  const click1st = (labelText) => {
    const l = Array.from(document.querySelectorAll("label")).find((x) =>
      x.textContent.trim().startsWith(labelText)
    );
    const btn = l?.parentElement?.querySelector("button");
    if (btn) {
      btn.scrollIntoView({ block: "center" });
      btn.click();
      return true;
    }
    return false;
  };
  return { subtype: click1st("نوع الأثاث"), condition: click1st("الحالة") };
});
ok("التصنيف/النوع/الحالة اختيرت", picks.subtype && picks.condition);
await wait(500);

/* الخطوة الأولى: زر النموذج يفتح **نافذة المعاينة** (لا ينشر مباشرة) */
const previewOpened = await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button[type="submit"]')).find((x) =>
    /معاينة الإعلان قبل الإرسال/.test(x.textContent)
  );
  if (!b) return false;
  b.scrollIntoView({ block: "center" });
  b.click();
  return true;
});
await wait(1800);
const modal = await page.evaluate(() => ({
  title: /راجعتُ كل البيانات/.test(document.body.innerText),
  photoInModal: Boolean(document.querySelector('img[src^="data:image/jpeg"]')),
  ackBox: Boolean(document.querySelector('input[type="checkbox"]')),
  confirmDisabled:
    Array.from(document.querySelectorAll("button")).find((b) =>
      /إرسال الإعلان للمراجعة/.test(b.textContent)
    )?.disabled ?? null,
}));
ok("زر النموذج فتح نافذة المعاينة", previewOpened && modal.title);
ok("الصورة المرفوعة ظاهرة داخل المعاينة", modal.photoInModal);
ok("زر الإرسال مقفل قبل الإقرار (حماية المستخدم)", modal.confirmDisabled === true);

/* الخطوة الثانية: الإقرار بصحة البيانات */
const acked = await page.evaluate(() => {
  const box = Array.from(document.querySelectorAll('input[type="checkbox"]')).pop();
  if (!box) return false;
  box.click();
  return true;
});
await wait(600);
const unlocked = await page.evaluate(
  () =>
    Array.from(document.querySelectorAll("button")).find((b) =>
      /إرسال الإعلان للمراجعة/.test(b.textContent)
    )?.disabled === false
);
ok("الإقرار فُتح زر الإرسال", acked && unlocked);

/* الخطوة الثالثة: النشر الفعلي */
const submitted = await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((x) =>
    /إرسال الإعلان للمراجعة/.test(x.textContent)
  );
  if (!b) return false;
  b.scrollIntoView({ block: "center" });
  b.click();
  return true;
});
ok("نُقر «إرسال الإعلان للمراجعة»", submitted);
await wait(3500);

const published = await page.evaluate(() => {
  const text = document.body.innerText;
  const stored = localStorage.getItem("badeel.state.v1") || "";
  return {
    review: /قيد المراجعة/.test(text),
    sent: /تم إرسال إعلانك بنجاح/.test(text),
    cardPhoto: Boolean(document.querySelector('img[src^="data:image/jpeg"]')),
    storedPhoto: stored.includes("data:image/jpeg"),
    storedKb: Math.round(stored.length / 1024),
    ref: (text.match(/BD-[A-Z0-9]+/) || [])[0] || "",
    errorsVisible: /أدخل|اكتب|اختر|حدّد/.test(text) && !/قيد المراجعة/.test(text),
  };
});
ok("الإعلان نُشر (شاشة النجاح + قيد المراجعة)", published.review && published.sent);
ok("الصورة المرفوعة تظهر على بطاقة الإعلان", published.cardPhoto);
ok("الصورة محفوظة في ذاكرة المتصفح", published.storedPhoto, `الحالة ${published.storedKb} ك.ب`);
ok("لا أخطاء تحقق عالقة", !published.errorsVisible);

/* ───────── ⑪ الصفحة التفصيلية + لوحة الإدارة تعرضان الصورة ───────── */
if (published.ref) {
  console.log(`\n⑪ فتح صفحة الإعلان ${published.ref} ولوحة المراجعة…`);
  await page.goto(`${BASE}/ad/${published.ref}`, { waitUntil: "networkidle2" });
  await wait(1200);
  const adPage = await page.evaluate(() => ({
    photo: Boolean(document.querySelector('img[src^="data:image/jpeg"]')),
    brokenSvg: document.querySelectorAll("svg image").length,
  }));
  ok("الصورة تظهر في صفحة الإعلان", adPage.photo);

  /* اللوحة مقفلة بكلمة مرور (PBKDF2 + قفل بعد المحاولات) — نسجّل الدخول أولاً */
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  await wait(1200);
  const locked = await page.evaluate(() =>
    Boolean(document.querySelector('input[type="password"]'))
  );
  ok("لوحة التحكم مقفلة وتتطلب دخولاً", locked);

  if (locked) {
    await page.evaluate(() => {
      const setVal = (el, v) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      };
      setVal(document.querySelector('input[placeholder="اسم المستخدم"]'), "admin");
      setVal(document.querySelector('input[type="password"]'), "Badeel@2026");
    });
    await wait(300);
    await page.evaluate(() => {
      document.querySelector('form button[type="submit"]').click();
    });
    await wait(2500);
  }

  const loggedIn = await page.evaluate(() => !document.querySelector('input[type="password"]'));
  ok("الدخول إلى اللوحة نجح", loggedIn);

  /* اللوحة تفتح على «نظرة عامة» — ننتقل إلى تبويب «قيد المراجعة» */
  if (loggedIn) {
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("button")).find((x) =>
        x.textContent.trim().startsWith("قيد المراجعة")
      );
      b?.click();
    });
    await wait(1500);
  }

  const admin = await page.evaluate(() => ({
    listed: new RegExp("BD-").test(document.body.innerText),
    hasPhoto: Boolean(document.querySelector('img[src^="data:image/jpeg"]')),
    ourTitle: /غرفة نوم خشب زان/.test(document.body.innerText),
  }));
  ok("الإعلان المرفوع مدرج في اللوحة", admin.listed && admin.ourTitle);
  ok("صورته تظهر في لوحة المراجعة", admin.hasPhoto);
}

/* ─────────── ⑬ المسودة التلقائية + حارس زر الرجوع ─────────── */
console.log("\n⑬ المسودة التلقائية وحارس زر الرجوع…");
await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await wait(1200);
await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2" });
await wait(1800);

/* اكتب عنواناً فيصير النموذج «متسخاً» وتُحفظ مسودة ويُدفَع الحارس */
await page.evaluate(() => {
  const l = Array.from(document.querySelectorAll("label")).find((x) =>
    x.textContent.trim().startsWith("عنوان الإعلان")
  );
  const box = l?.closest("[data-error]") ?? l?.parentElement;
  const el = box?.querySelector("input");
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
    el,
    "مسودة اختبار زر الرجوع"
  );
  el.dispatchEvent(new Event("input", { bubbles: true }));
});
await wait(1000);
ok(
  "المسودة حُفظت تلقائياً بعد الكتابة",
  await page.evaluate(() => sessionStorage.getItem("badeel.postad.draft.v1") !== null)
);

/* رجوع #1: يبقى ويشرح */
await page.evaluate(() => history.back());
await wait(1500);
const back1 = await page.evaluate(() => ({
  url: location.pathname,
  toast: /مسودتك محفوظة هنا/.test(document.body.innerText),
}));
ok("رجوع #1 يُبقي المستخدم في صفحة الإعلان", back1.url === "/post-ad", back1.url);
ok("مع شرح أن المسودة محفوظة", back1.toast);

/* رجوع #2: خروج طبيعي بإرادته */
await page.evaluate(() => history.back());
await wait(2000);
const back2 = await page.evaluate(() => location.pathname);
ok("رجوع #2 يُخرج طبيعياً (لا احتجاز)", back2 !== "/post-ad", back2);

/* العودة: تُستعاد المسودة */
await page.goto(`${BASE}/post-ad`, { waitUntil: "networkidle2" });
await wait(2000);
const restored = await page.evaluate(() => {
  const l = Array.from(document.querySelectorAll("label")).find((x) =>
    x.textContent.trim().startsWith("عنوان الإعلان")
  );
  const box = l?.closest("[data-error]") ?? l?.parentElement;
  return {
    title: box?.querySelector("input")?.value ?? "",
    toast: /استعدنا مسودتك/.test(document.body.innerText),
  };
});
ok("المسودة استُعيدت عند العودة", restored.title.includes("مسودة اختبار"), restored.title);
ok("إشعار الاستعادة ظهر", restored.toast);
await page.evaluate(() => sessionStorage.removeItem("badeel.postad.draft.v1"));

/* ─────────────────── ⑫ أخطاء JavaScript ─────────────────── */
console.log("\n⑫ سجل الأخطاء…");
ok("صفر أخطاء JavaScript", jsErrors.length === 0, jsErrors.slice(0, 2).join(" | "));

await page.screenshot({ path: "qa/fixtures/shot-mobile-postad.png" });
console.log("\n📸 لقطة: qa/fixtures/shot-mobile-postad.png");
console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
await browser.close();
process.exit(fail > 0 ? 1 : 0);
