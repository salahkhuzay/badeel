/* ==========================================================================
   qa/wave27-vehicle-types.ts — فحص تخصيص أنواع المركبات الـ 12 والماركات والطي
   ========================================================================== */

import { VEHICLE_TYPES } from "../lib/taxonomy";
import { brandsForVehicleType, brandById } from "../lib/brands";
import type { VehicleType } from "../lib/types";

let pass = 0;
let fail = 0;
const ok = (label: string, cond: boolean, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`);
};

console.log("=== 1) التحقق من أنواع المركبات الـ 12 المحددة وتسمياتها وترتيبها ===");

const EXPECTED_TYPES: { id: VehicleType; name: string }[] = [
  { id: "passenger", name: "سيارة سياحية أو جيب" },
  { id: "pickup", name: "بيك أب" },
  { id: "van", name: "فان" },
  { id: "medium-truck", name: "شاحنة متوسطة" },
  { id: "tractor", name: "جرار زراعي" },
  { id: "motorcycle", name: "دراجة نارية" },
  { id: "microbus", name: "ميكرو باص" },
  { id: "bus", name: "باص" },
  { id: "machinery", name: "آليات ثقيلة" },
  { id: "heavy-truck", name: "شاحنة كبيرة" },
  { id: "mini-truck", name: "شاحنة صغيرة ( سوزوكي )" },
  { id: "other", name: "أخرى" },
];

ok("عدد أنواع المركبات 12 تماماً", VEHICLE_TYPES.length === 12);

EXPECTED_TYPES.forEach((exp, idx) => {
  const actual = VEHICLE_TYPES[idx];
  ok(
    `النوع ${idx + 1}: ${exp.name} (id: ${exp.id})`,
    actual && actual.id === exp.id && actual.name === exp.name,
    actual ? `${actual.name} (${actual.id})` : "غير موجود"
  );
});

console.log("\n=== 2) التحقق من عزل ماركات الجرارات الزراعية ===");
const tractorBrands = brandsForVehicleType("tractor");
const tractorIds = tractorBrands.map((b) => b.id);
ok("ماركات الجرارات تحوي ماسي", tractorIds.includes("massey"));
ok("ماركات الجرارات تحوي نيوهولاند", tractorIds.includes("new-holland"));
ok("ماركات الجرارات تحوي فوتون لوفول", tractorIds.includes("lovol"));
ok("ماركات الجرارات تحوي فرات", tractorIds.includes("furat"));
ok("ماركات الجرارات تحوي سوميكا", tractorIds.includes("someca"));
ok("ماركات الجرارات تحوي زيتور", tractorIds.includes("zetor"));
ok("ماركات الجرارات تحوي زووم لايون", tractorIds.includes("zoomlion"));
ok("ماركات الجرارات تحوي فيات", tractorIds.includes("hp-fiat"));
ok("ماركات الجرارات تحوي ماهيندرا", tractorIds.includes("mahindra"));
ok("ماركات الجرارات تحوي توموسان", tractorIds.includes("tumosan"));
ok("ماركات الجرارات تحوي هتات", tractorIds.includes("hattat"));
ok("ماركات الجرارات تحوي بارس", tractorIds.includes("pars"));
ok("ماركات الجرارات تحوي كوبوتا", tractorIds.includes("kubota"));
ok("ماركات الجرارات تحوي جون دير", tractorIds.includes("john-deere"));
ok("ماركات الجرارات تحوي يونيفرسال", tractorIds.includes("universal"));
ok("ماركات الجرارات تحوي دونغ فينغ", tractorIds.includes("dongfeng"));
ok("ماركات الجرارات تحوي سوليس", tractorIds.includes("solis"));
ok("ماركات الجرارات تحوي تافي", tractorIds.includes("tafe"));
ok("ماركات الجرارات تحوي خيار أخرى", tractorIds.includes("other"));
ok("ماركات الجرارات لا تحوي كيا ولا سايبا ولا بارت", !tractorIds.includes("kia") && !tractorIds.includes("saipa") && !tractorIds.includes("moto-bart"));

console.log("\n=== 3) التحقق من عزل ماركات سيارات الشحن (كبيرة ومتوسطة) ===");
const truckBrands = brandsForVehicleType("heavy-truck");
const truckIds = truckBrands.map((b) => b.id);
ok("ماركات الشاحنات تحوي مرسيدس", truckIds.includes("mercedes"));
ok("ماركات الشاحنات تحوي فولفو", truckIds.includes("volvo"));
ok("ماركات الشاحنات تحوي ايفيكو", truckIds.includes("iveco"));
ok("ماركات الشاحنات تحوي مان", truckIds.includes("man"));
ok("ماركات الشاحنات تحوي سكانيا", truckIds.includes("scania"));
ok("ماركات الشاحنات تحوي شاكمان", truckIds.includes("shacman"));
ok("ماركات الشاحنات تحوي سينوتراك هوهو", truckIds.includes("sinotruk"));
ok("ماركات الشاحنات تحوي فوتون", truckIds.includes("foton"));
ok("ماركات الشاحنات تحوي داف", truckIds.includes("daf"));
ok("ماركات الشاحنات تحوي رينو", truckIds.includes("renault-trucks"));
ok("ماركات الشاحنات تحوي فاو", truckIds.includes("faw"));
ok("ماركات الشاحنات تحوي دونغ فينغ", truckIds.includes("dongfeng"));
ok("ماركات الشاحنات تحوي جاك", truckIds.includes("jac"));
ok("ماركات الشاحنات تحوي كاماز", truckIds.includes("kamaz"));
ok("ماركات الشاحنات تحوي ماز", truckIds.includes("maz"));
ok("ماركات الشاحنات تحوي خيار أخرى", truckIds.includes("other"));
ok("ماركات الشاحنات لا تحوي بارت ولا سكودا", !truckIds.includes("moto-bart") && !truckIds.includes("skoda"));

console.log("\n=== 4) التحقق من ماركات الآليات الثقيلة ===");
const machineryBrands = brandsForVehicleType("machinery");
const machIds = machineryBrands.map((b) => b.id);
ok("الآليات تحوي كاتربيلر", machIds.includes("cat"));
ok("الآليات تحوي كوماتسو", machIds.includes("komatsu"));
ok("الآليات تحوي هيونداي آليات", machIds.includes("hp-hyundai"));
ok("الآليات تحوي ساني", machIds.includes("sany"));
ok("الآليات تحوي ليوغونغ", machIds.includes("liugong"));
ok("الآليات تحوي شانتوي", machIds.includes("shantui"));
ok("الآليات تحوي بوم", machIds.includes("boom"));
ok("الآليات تحوي بوماج", machIds.includes("bomag"));
ok("الآليات تحوي أمان", machIds.includes("ammann"));
ok("الآليات تحوي بوبكات", machIds.includes("bobcat"));
ok("الآليات تحوي JCB", machIds.includes("jcb"));
ok("الآليات تحوي خيار أخرى", machIds.includes("other"));

console.log("\n=== 5) التحقق من ماركات الدراجات النارية ===");
const motoBrands = brandsForVehicleType("motorcycle");
const motoIds = motoBrands.map((b) => b.id);
ok("الدراجات تحوي بارت", motoIds.includes("moto-bart"));
ok("الدراجات تحوي عيتاني", motoIds.includes("moto-aitani"));
ok("الدراجات تحوي عقاد", motoIds.includes("moto-aqqad"));
ok("الدراجات تحوي دلتا", motoIds.includes("moto-delta"));
ok("الدراجات تحوي جيلينغ", motoIds.includes("moto-jialing"));
ok("الدراجات تحوي لونسن", motoIds.includes("moto-loncin"));
ok("الدراجات تحوي هوندا", motoIds.includes("moto-honda"));
ok("الدراجات تحوي ياماها", motoIds.includes("moto-yamaha"));
ok("الدراجات تحوي سوزوكي", motoIds.includes("moto-suzuki"));
ok("الدراجات تحوي دايون", motoIds.includes("moto-dayang"));
ok("الدراجات تحوي هواجوي", motoIds.includes("moto-haojue"));
ok("الدراجات تحوي RKS", motoIds.includes("moto-rks"));
ok("الدراجات تحوي كاوازاكي", motoIds.includes("moto-kawasaki"));
ok("الدراجات تحوي ياديا", motoIds.includes("moto-yadea"));
ok("الدراجات تحوي تايلغ", motoIds.includes("moto-tailg"));
ok("الدراجات تحوي خيار أخرى", motoIds.includes("other"));

console.log("\n=== 6) التحقق من ماركات شاحنة صغيرة ( سوزوكي ) ===");
const miniTruckBrands = brandsForVehicleType("mini-truck");
const miniTruckIds = miniTruckBrands.map((b) => b.id);
ok("تحوي سوزوكي", miniTruckIds.includes("suzuki"));
ok("تحوي شانجان", miniTruckIds.includes("changan"));
ok("تحوي دفسك", miniTruckIds.includes("dfsk"));
ok("تحوي فوتون", miniTruckIds.includes("foton"));
ok("تحوي دونغ فينغ", miniTruckIds.includes("dongfeng"));
ok("تحوي هاوفي", miniTruckIds.includes("hafei"));
ok("تحوي دايو", miniTruckIds.includes("daewoo"));
ok("تحوي خيار أخرى", miniTruckIds.includes("other"));

console.log("\n=== 7) التحقق من البحث عن الماركات عبر brandById ===");
ok("العثور على ماسي عبر brandById", Boolean(brandById("massey")?.name.includes("ماسي")));
ok("العثور على فرات عبر brandById", brandById("furat")?.name === "فرات");
ok("العثور على بارت عبر brandById", brandById("moto-bart")?.name === "بارت");
ok("العثور على كاتربيلر عبر brandById", brandById("cat")?.name === "كاتربيلر");
ok("العثور على مان عبر brandById", brandById("man")?.name === "مان");

console.log("\n=== 8) التحقق من استنتاج نوع الهيكل bodyTypeOfAd ===");
import { bodyTypeOfAd } from "../lib/vehicleBodies";
ok("ماسي ← جرار زراعي", bodyTypeOfAd({ brandId: "massey" }) === "tractor");
ok("فرات ← جرار زراعي", bodyTypeOfAd({ brandId: "furat" }) === "tractor");
ok("مان ← شاحنة", bodyTypeOfAd({ brandId: "man" }) === "truck");
ok("بارت ← دراجة نارية", bodyTypeOfAd({ brandId: "moto-bart" }) === "motorcycle");
ok("كاتربيلر ← آليات ثقيلة", bodyTypeOfAd({ brandId: "cat" }) === "machinery");
ok("هاوفي ← نقل خفيف", bodyTypeOfAd({ brandId: "hafei" }) === "lighttruck");
ok("يوتونغ ← باص", bodyTypeOfAd({ brandId: "yutong" }) === "bus");

console.log(`\n══ النتيجة الإجمالية: ${pass} نجاح · ${fail} فشل ══`);
if (fail > 0) process.exit(1);
