/* ==========================================================================
   qa/make-test-photos.mjs — توليد صور JPEG حقيقية لاختبار رفع الصور
   تُكتب في qa/fixtures/ (ملفات فعلية على القرص، لا data URLs) لأن اختبار
   المتصفح يرفعها عبر DOM.setFileInputFiles تماماً كما يفعل الجوال.
   التشغيل: node qa/make-test-photos.mjs
   ========================================================================== */

import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire("/home/user/");
const puppeteer = require("puppeteer");

const OUT = path.resolve("qa/fixtures");
fs.mkdirSync(OUT, { recursive: true });

/* أحجام وأشكال مختلفة تحاكي ما يأتي من الهواتف فعلياً */
const SPECS = [
  { name: "big", w: 3000, h: 2250, q: 0.95, text: "صورة كبيرة 3000×2250" },
  { name: "portrait", w: 1200, h: 1600, q: 0.9, text: "صورة طولية (جوال)" },
  { name: "extra1", w: 1600, h: 1200, q: 0.9, text: "غرفة نوم" },
  { name: "extra2", w: 1400, h: 1050, q: 0.88, text: "أثاث" },
  { name: "extra3", w: 1300, h: 975, q: 0.88, text: "مطبخ" },
  { name: "extra4", w: 1250, h: 940, q: 0.85, text: "حدائق" },
  { name: "extra5", w: 1200, h: 900, q: 0.85, text: "صالون" },
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.goto("about:blank");

for (const s of SPECS) {
  const dataUrl = await page.evaluate(async ({ w, h, q, text }) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#1e3a8a");
    g.addColorStop(0.5, "#0f766e");
    g.addColorStop(1, "#f59e0b");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.fillStyle = "rgba(255,255,255,.92)";
    x.font = `bold ${Math.round(h / 7)}px sans-serif`;
    x.fillText(text, 60, h / 2);
    return c.toDataURL("image/jpeg", q);
  }, s);
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  const file = path.join(OUT, `${s.name}.jpg`);
  fs.writeFileSync(file, buf);
  console.log(`✔ ${file} — ${Math.round(buf.length / 1024)} ك.ب (${s.w}×${s.h})`);
}

/* ملف ليس صورة — لاختبار الرفض برسالة عربية */
const txt = path.join(OUT, "not-a-photo.txt");
fs.writeFileSync(txt, "هذا ملف نصي وليس صورة\n");
console.log(`✔ ${txt}`);

await browser.close();
console.log("\n✅ كل ملفات الاختبار جاهزة في qa/fixtures/");
