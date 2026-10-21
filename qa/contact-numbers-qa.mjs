/* ==========================================================================
   qa/contact-numbers-qa.mjs — اختبار منطق أرقام التواصل
   يشمل: الترحيل الآمن · احترام الأرقام المخصّصة · الرقم الثانوي · إزالة التكرار
   التشغيل:  npx tsx qa/contact-numbers-qa.mjs
   ========================================================================== */

import {
  contactDigits,
  contactNumbers,
  isSupersededPhone,
  migrateContactPhone,
} from "../lib/contact.ts";

const DEFAULT = "0986801032";
let pass = 0;
let fail = 0;

function eq(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}`);
  if (!ok) console.log(`      المتوقع: ${JSON.stringify(want)} — الناتج: ${JSON.stringify(got)}`);
}

console.log("── ① تطبيع صيغ الكتابة (contactDigits) ──");
eq("0993177597", contactDigits("0993177597"), "993177597");
eq("+963993177597", contactDigits("+963993177597"), "993177597");
eq("00963993177597", contactDigits("00963993177597"), "993177597");
eq("963993177597", contactDigits("963993177597"), "993177597");
eq("0933177597", contactDigits("0933177597"), "933177597");
eq("+963933177597", contactDigits("+963933177597"), "933177597");
eq("فراغ", contactDigits(""), "");

console.log("\n── ② الترحيل الآمن (migrateContactPhone) ──");
/* الأرقام الافتراضية القديمة → تُحدَّث تلقائياً */
eq("القديم 0993177597", migrateContactPhone("0993177597", undefined, DEFAULT), DEFAULT);
eq("القديم 0933177597", migrateContactPhone("0933177597", undefined, DEFAULT), DEFAULT);
eq("القديم +963993…", migrateContactPhone("+963993177597", undefined, DEFAULT), DEFAULT);
eq("القديم 00963993…", migrateContactPhone("00963993177597", undefined, DEFAULT), DEFAULT);
eq("القديم 963993…", migrateContactPhone("963993177597", undefined, DEFAULT), DEFAULT);
eq("الخاطئ 0993177595", migrateContactPhone("0993177595", undefined, DEFAULT), DEFAULT);
eq("الخاطئ 0933177595", migrateContactPhone("0933177595", undefined, DEFAULT), DEFAULT);

/* الرقم الصحيح والأرقام المخصّصة → لا تُمسّ أبداً */
eq("الصحيح يبقى", migrateContactPhone(DEFAULT, "default", DEFAULT), DEFAULT);
eq("الصحيح بصيغة دولية يبقى", migrateContactPhone("+963986801032", "default", DEFAULT), "+963986801032");
eq("مخصّص لا يُمسّ", migrateContactPhone("0955555555", "custom", DEFAULT), "0955555555");
eq("مخصّص يشبه القديم لا يُمسّ", migrateContactPhone("0993177597", "custom", DEFAULT), "0993177597");
eq("رقم ثانٍ مخصّص لا يُمسّ", migrateContactPhone("0999888777", "custom", DEFAULT), "0999888777");
eq("غير معروف يبقى كما هو", migrateContactPhone("0551112233", "default", DEFAULT), "0551112233");
eq("فراغ → الافتراضي", migrateContactPhone("", undefined, DEFAULT), DEFAULT);
eq("غير موجود → الافتراضي", migrateContactPhone(undefined, undefined, DEFAULT), DEFAULT);

/* تغيير الافتراضي مستقبلاً: القديم يُضاف للقائمة فينتقل الزوار، والمخصّص يبقى */
eq("هل 0993177597 من القديمة؟", isSupersededPhone("0993177597"), true);
eq("هل 0933177597 من القديمة؟", isSupersededPhone("0933177597"), true);
eq("هل 0986801032 من القديمة؟", isSupersededPhone("0986801032"), false);

console.log("\n── ③ الأرقام المعروضة (contactNumbers) ──");
eq("أساسي فقط", contactNumbers({ contactPhone: DEFAULT }), [DEFAULT]);
eq("أساسي + ثانٍ", contactNumbers({ contactPhone: DEFAULT, contactPhone2: "0999888777" }), [
  DEFAULT,
  "0999888777",
]);
eq("ثانٍ بصيغة دولية مختلفة → يظهر", contactNumbers({ contactPhone: DEFAULT, contactPhone2: "+963999887777" }), [
  DEFAULT,
  "+963999887777",
]);
eq("ثانٍ مكرر بكتابة أخرى → يُدمج", contactNumbers({ contactPhone: DEFAULT, contactPhone2: "+963986801032" }), [
  DEFAULT,
]);
eq("ثانٍ فارغ → لا يظهر", contactNumbers({ contactPhone: DEFAULT, contactPhone2: "   " }), [DEFAULT]);
eq("ثانٍ غير معرّف → لا يظهر", contactNumbers({ contactPhone: DEFAULT }), [DEFAULT]);

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail > 0 ? 1 : 0);
