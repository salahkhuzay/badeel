/* ==========================================================================
   qa/wave17-taxonomy.mjs — فحص الأنواع والموديلات وقواعد الاشتقاق (موجة 17)
   التشغيل: npx tsx qa/wave17-taxonomy.mjs
   ========================================================================== */
import { VEHICLE_TYPES } from "../lib/taxonomy";
import { BODY_TYPES, bodyTypeOfModel, bodyTypeOfAd } from "../lib/vehicleBodies";
import { BRANDS } from "../lib/brands";

let pass = 0;
let fail = 0;
const ok = (label: string, cond: boolean, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};

const ids = VEHICLE_TYPES.map((t) => t.id);
ok("تسعة أنواع مركبات", VEHICLE_TYPES.length === 9, ids.join(","));
for (const id of ["pickup", "tractor", "van", "microbus", "bus"]) {
  ok(`النوع الجديد موجود: ${id}`, ids.includes(id as (typeof ids)[number]));
}
ok("السياحية صارت «سيارة سياحية / جيب»", VEHICLE_TYPES.find((t) => t.id === "passenger")?.name === "سيارة سياحية / جيب");
ok("البيك أب منفصل عن الشاحنة", ids.includes("pickup") && VEHICLE_TYPES.find((t) => t.id === "truck")?.name === "شاحنة");
ok("الجرار منفصل عن الآليات", VEHICLE_TYPES.find((t) => t.id === "tractor")?.name === "جرار زراعي" && VEHICLE_TYPES.find((t) => t.id === "machinery")?.name === "آليات ثقيلة");

const hyundai = BRANDS.find((b) => b.id === "hyundai")!;
const mName = (id: string) => hyundai.models.find((m) => m.id === id)?.name ?? "";
ok("سنتافي غولد", mName("santa-fe-gold") === "سنتافي غولد");
ok("سنتافي CM / DM / TM", ["santa-fe-cm", "santa-fe-dm", "santa-fe-tm"].every((i) => mName(i).includes("سنتافي")));
ok("فيراكروز", mName("veracruz") === "فيراكروز");

const bm = (bid: string, mid: string) => {
  const b = BRANDS.find((x) => x.id === bid)!;
  const m = b.models.find((x) => x.id === mid)!;
  return bodyTypeOfModel(b.id, m);
};
ok("سنتافي CM ← SUV/جيب", bm("hyundai", "santa-fe-cm") === "suv");
ok("كورس ← ميكروباص/باص", bm("hyundai", "chorus") === "bus");
ok("غراس ← فان", bm("hyundai", "grace") === "van");
ok("بيستا كيا ← باص", bm("kia", "besta") === "bus");
ok("كوستر تويوتا ← باص", bm("toyota", "coaster") === "bus");
ok("شاحنة 1113 مرسيدس ← شاحنة", bm("mercedes", "m1113") === "truck");
ok("الفئة 5 E39 ← سيدان", bm("bmw", "e39") === "sedan");
ok("بيك أب D21 نيسان ← بيك أب", bm("nissan", "d21") === "pickup");
ok("روزا ميتسوبيشي ← باص", bm("mitsubishi", "rosa") === "bus");
ok("بورترو هيونداي ← نقل خفيف", bm("hyundai", "porter") === "lighttruck");

ok("اشتقاق من نص مخصّص: «كوستر» ← باص", bodyTypeOfAd({ make: "تويوتا", model: "كوستر 2012" }) === "bus");
ok("اشتقاق من نص مخصّص: «هايلوكس» ← بيك أب", bodyTypeOfAd({ model: "هايلوكس فيغو" }) === "pickup");
ok("قائمة الهيكل ما زالت موجودة للفلاتر", BODY_TYPES.length >= 14);

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail > 0 ? 1 : 0);
