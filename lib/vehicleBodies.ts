import { BRANDS, MOTO_BRANDS, EQUIP_BRANDS, type Brand, type BrandModel } from "./brands";
import { SCOPED_SPECIAL_BRANDS } from "./vehicle-scoped-brands";

/* ==========================================================================
   أنواع السيارات (هيكل المركبة) — بديل | Badeel
   الهيكل: نوع ← ماركات النوع ← طرازات كل ماركة
   - 12 نوعاً مع أيقونة مرسومة داخل المشروع (components/VehicleBodyIcon.tsx)
   - التصنيف آلي: كل طراز يُصنَّف من اسمه/معرّفه (عربي + لاتيني) بقواعد كلمات مفتاحية،
     مع تصنيف افتراضي لكل ماركة عند عدم وجود تطابق.
   ========================================================================== */

export type BodyTypeId =
  | "sedan"
  | "hatchback"
  | "suv"
  | "coupe"
  | "pickup"
  | "van"
  | "bus"
  | "truck"
  | "lighttruck"
  | "motorcycle"
  | "scooter"
  | "ebike"
  | "tractor"
  | "machinery"
  | "other";

export interface BodyTypeDef {
  id: BodyTypeId;
  name: string;
  en: string;
  hint: string;
  /** الفئة العامة المرتبطة بنوع التعامل في نموذج النشر */
  group: "passenger" | "motorcycle" | "machinery" | "truck" | "other";
}

export const BODY_TYPES: BodyTypeDef[] = [
  { id: "sedan", name: "سيدان", en: "Sedan", hint: "سيارة بأربعة أبواب وصندوق خلفي — كورولا، كامري، إلنترا...", group: "passenger" },
  { id: "hatchback", name: "هاتشباك", en: "Hatchback", hint: "سيارة صغيرة بباب خلفي — i10، بيكانتو، جولف، 206...", group: "passenger" },
  { id: "suv", name: "رباعية الدفع (SUV)", en: "SUV / 4x4", hint: "مرتفعة بأربع دفع — توسان، لاند كروزر، راف 4، X5...", group: "passenger" },
  { id: "coupe", name: "كوبيه ورياضية", en: "Coupe / Sport", hint: "منخفضة ورياضية — TT، Z4، CLA، موستانغ...", group: "passenger" },
  { id: "pickup", name: "بيك أب", en: "Pickup", hint: "صندوق مفتوح — هايلوكس، L200، نافارا، رينجر...", group: "passenger" },
  { id: "van", name: "فان وعائلية", en: "Van / MPV", hint: "عائلية أو نقل خفيف — ستاركس، H1، كارنفال، فيتو...", group: "passenger" },
  { id: "bus", name: "باص ونقل جماعي", en: "Bus", hint: "كوستر، كاونتي، H100 باص، ميكروباص...", group: "truck" },
  { id: "truck", name: "شاحنة", en: "Truck", hint: "شاحنات نقل — كانتر، بوكسر، أكتورس...", group: "truck" },
  { id: "lighttruck", name: "شاحنة صغيرة (نقل خفيف)", en: "Light Truck", hint: "الشاحنات الصغيرة الرائجة في منبج — بونغو، بورتر، سوبر كاري، تشانا ستار، شانجان ستار، هفي، فورلاند، ايسوزو NPR، ديلي ايفيكو…", group: "truck" },
  { id: "motorcycle", name: "دراجة نارية", en: "Motorcycle", hint: "دراجات — CG125، YBR، RKS، هواجوي...", group: "motorcycle" },
  { id: "scooter", name: "سكوتر ودراجة كهربائية", en: "Scooter", hint: "سكوتر ودباب ودراجات كهربائية", group: "motorcycle" },
  { id: "ebike", name: "دراجات كهربائية", en: "Electric Bike", hint: "دراجات كهربائية بالبطارية — ياديا، تايلغ، وسكوترات الشحن الكهربائية...", group: "motorcycle" },
  { id: "tractor", name: "جرار زراعي", en: "Tractor", hint: "جرارات — ماسي فيرغسون، نيو هولاند، زايتور، فيات، فرات، ماهيندرا...", group: "machinery" },
  { id: "machinery", name: "آليات ثقيلة", en: "Heavy Machinery", hint: "حفارات، لودرات، باكو — كاتربيلر، كوماتسو، JCB، هيونداي، فوتون لوفول...", group: "machinery" },
  { id: "other", name: "أخرى", en: "Other", hint: "ما لا يدخل في الأنواع السابقة", group: "other" },
];

export const bodyTypeById = (id?: string) => BODY_TYPES.find((t) => t.id === id);
export const bodyTypeName = (id?: string) => bodyTypeById(id)?.name ?? "";

/* --------------------------- قواعد التصنيف --------------------------- */

/** كل مصفوفة = كلمات مفتاحية (عربية + لاتينية) — الأسبق في الترتيب يفوز */
const RULES: { id: BodyTypeId; keys: string[] }[] = [
  {
    id: "ebike",
    keys: ["دراجة كهربائية", "دراجه كهربائيه", "دراجة كهرباء", "سكوتر كهربائي", "دباب كهربائي", "بطارية", "ebike", "electric bike", "yadea", "tailg", "ياديا", "تايلغ"],
  },
  {
    id: "scooter",
    keys: ["سكوتر", "سكوترا", "دباب رمل", "atv", "scooter", "nmax", "xmax", "access", "ua125", "sh "],
  },
  {
    id: "tractor",
    keys: ["جرار", "tractor", "محراث", "mf ", "massey", "td5", "tt55", "tt75", "td80", "td90", "td95", "t7060", "5050", "5065", "5075", "5100", "6125", "3036", "6403", "425", "440", "زايتور", "zetor", "فرات", "ماهيندرا", "mahindra", "لوفول", "lovol", "265 di", "275 di", "575 di", "70-56", "80-90"],
  },
  {
    id: "machinery",
    keys: ["حفارة", "حفاره", "لودر", "جرافة", "جرافه", "باكو", "بوبكات", "بوكات", "excavator", "loader", "dozer", "backhoe", "pc130", "pc200", "pc300", "pc400", "wa320", "wa380", "d65", "3cx", "4cx", "js205", "js20", "8018", "535-125", "s450", "s550", "s650", "s770", "t590", "e35", "e50", "exc320", "exc330", "exc305", "ldr950", "ldr966", "d6", "428"],
  },
  {
    id: "bus",
    keys: ["باص", "ميكروباص", "كوستر", "coaster", "county", "bus", "h100", "كورس", "chorus", "بيستا", "besta", "روزا", "rosa", "سيفيليان", "civilian"],
  },
  {
    id: "lighttruck",
    keys: [
      "شاحنة صغيرة", "شاحنه صغيره", "نقل خفيف", "ستار شاحنة", "بونغو", "bongo", "k2500",
      "بورتر", "porter", "hd65", "hd72", "سوبر كاري", "super carry", "فورلاند", "forland",
      "أومارك", "aumark", "أولين", "تشانا ستار", "كوايو", "kuayue", "npr", "nqr", "nkr", "ديلي", "daily", "tgl",
      "ميني تراك", "شاحنة هفي", "light truck",
      "بورترو", "porter", "k2700", "k4000", "h100 شاحنة"],
  },
  {
    id: "truck",
    keys: ["شاحنة", "شاحنه", "نقل ثقيل", "قلاب", "truck", "mighty", "مايتي", "canter", "كانتر", "fuso", "فوسو", "boxer", "بوكسر", "actros", "أكتورس", "1113", "1513", "1613", "اتيغو", "atego", "داينا", "dyna", "سنتنيال", "centennial", "انتر"],
  },
  {
    id: "pickup",
    keys: ["هايلوكس", "hilux", "بيك أب", "بيك اب", "l200", "نافارا", "navara", "bt-50", "bt50", "أماروك", "اماروك", "amarok", "غلادياتور", "gladiator", "رينجر", "ranger", "f-150", "f150", "سيلفرادو", "silverado", "سييرا", "sierra", "كولورادو", "colorado", "سوبر كاري", "super carry", "غلاديتور", "d21", "d20", "تاسمان", "tasman", "شاص", "shass"],
  },
  {
    id: "van",
    keys: ["فان", "عائلية", "ستاركس", "starex", "h1", "هايس", "hiace", "فيتو", "vito", "فيانو", "viano", "سبرينتر", "sprinter", "v220", "v250", "الفئة v", "فئة v", "توران", "touran", "كادي", "caddy", "كارنفال", "carnival", "كارينز", "carens", "سيينا", "sienna", "بريفيا", "previa", "إنوفا", "innova", "فيرسو", "verso", "ترافيك", "trafic", "بارتنر", "partner", "ريفر", "rifter", "كانغو", "kangoo", "سينيك", "scenic", "مازدا 5", "أوديسي", "odyssey", "إرتيغا", "ertiga", "إفري", "every", "apv", "فيرسو", "غراس", "grace", "تراجيت", "trajet", "ماتريكس", "matrix", "بريجيو", "pregio", "ديليكا", "delica", "l300", "فانيت", "vanette", "ترانسبورتر", "transporter", "مولتيفان", "multivan", "كرافتر", "crafter", "شاران", "sharan", "ليت اس", "liteace", "ستاريا", "staria", "سولاتي", "solati", "جرانفيا", "granvia"],
  },
  {
    id: "coupe",
    keys: ["كوبيه", "coupe", "cla ", "cls ", "slk", "tt ", "r8", "z4", "i8", "mx-5", "mx5", "rx-8", "rx8", "شيروكو", "scirocco", "باسات cc", " cc", "آرتيون", "arteon", "الفئة 8", "الفئة 6", "الفئة 4", "الفئة 2", "a5", "a7", "موستانغ", "mustang", "كامارو", "camaro", "تشالنجر", "challenger", "لانسر إيفو", "evo", "لانسر ex", "رودستر", "roadster", "ستينغر", "stinger"],
  },
  {
    id: "suv",
    keys: ["سنتافي", "توسان", "كريتا", "كونا", "فينيو", "ix35", "ix55", "باليسيد", "سبورتاج", "سورينتو", "سيلتوس", "موهافي", "لاند كروزر", "برادو", "راف 4", "راف4", "rav4", "فورتشنر", "هايلاندر", "highlander", "c-hr", "chr", "باجيرو", "أوتلاندر", "outlander", "asx", "إكليبس", "رانجلر", "شيروكي", "cherokee", "كومباس", "رينيغيد", "باتريوت", "ليبرتي", "واغونير", "ديفندر", "ديسكفري", "فريلاندر", "سيريس", "رنج روفر", "فوج", "إيفوك", "فيلار", "أوتوبيوغرافي", "لونغ ويلبيس", "p530", "x1", "x3", "x4", "x5", "x6", "x7", "q3", "q5", "q7", "q8", "تيغوان", "tiguan", "طوارق", "touareg", "كودياك", "kodiaq", "كاروك", "karoq", "ييتي", "yeti", "cx-3", "cx-5", "cx-7", "cx-9", "cx-30", "باترول", "اكستيرا", "باثفايندر", "قشقاي", "جوك", "x-trail", "أرمادا", "داستر", "duster", "كابتور", "captur", "2008", "3008", "5008", "glk", "glc", "gle", "gls", "الفئة m", "الفئة g", "ml2", "ml3", "ml4", "ml5", "gl3", "gl4", "gl5", "g300", "g500", "g63", "فيتارا", "جيمني", "إغنيس", "sx4", "cr-v", "crv", "hr-v", "hrv", "بايلوت", "pilot", "إسكيب", "escape", "إكسبلورر", "explorer", "إيدج", "edge", "برونكو", "bronco", "كابتيفا", "captiva", "تاهو", "tahoe", "سوبربان", "suburban", "ترافيرس", "traverse", "إكوينوكس", "equinox", "غالوبر", "galloper", "فيراكروز", "veracruz", "كاسبر", "casper", "ماكس كروز", "maxcruz", "سونيت", "sonet", "kx1", "نيرو", "niro", "روكستا"],
  },
  {
    id: "hatchback",
    keys: ["i10", "i20", "i30", "جيتز", "getz", "فيلوستر", "veloster", "بيكانتو", "picanto", "ريو", "rio", "شوما", "سيفيا", "برايد", "ريغا", "soul", "سول", "ميكرا", "micra", "ياريس", "yaris", "ستارلت", "starlet", "إيكو", "echo", "ميراج", "mirage", "كولت", "colt", "فابيا", "fabia", "رابيد", "rapid", "سكالا", "scala", "بولو", "polo", "جولف", "golf", "بيتل", "beetle", "205", "206", "207", "208", "كليو", "clio", "سانديرو", "sandero", "مازدا 2", "سبارك", "spark", "آفيو", "aveo", "ماتيز", "matiz", "تيكو", "tico", "جاز", "fit", "سويفت", "swift", "بالينو", "ألتو", "سياز", "سوبر كاري", "أتوس", "atos", "مورنينغ", "morning", "أوريس", "auris", "كليك", "click", "جراند i10"],
  },
  {
    id: "sedan",
    keys: ["كورولا", "corolla", "كامري", "camry", "إكسنت", "accent", "فيرنا", "verna", "أفانتي", "avante", "إلنترا", "elantra", "سوناتا", "sonata", "أزيرا", "azera", "سيراتو", "cerato", "أوبتيما", "optima", "k3", "k5", "k7", "كلاروس", "clarus", "لانسر", "lancer", "تيدا", "صني", "sunny", "سنترا", "sentra", "التيما", "altima", "ماكسيما", "maxima", "كراون", "crown", "أفالون", "avalon", "أفينسيس", "avensis", "فوكس", "focus", "فييستا", "fiesta", "فيوجن", "fusion", "توروس", "taurus", "مونديو", "mondeo", "باسات", "passat", "جيتا", "jetta", "بورا", "bora", "301", "405", "406", "407", "505", "508", "a3", "a4", "a6", "a8", "s3", "s4", "s8", "316", "318", "320", "323", "325", "328", "330", "335", "518", "520", "523", "525", "528", "530", "535", "730", "735", "740", "745", "750", "الفئة 1", "الفئة 3", "الفئة 5", "الفئة 7", "الفئة a", "الفئة b", "الفئة c", "الفئة e", "الفئة s", "s280", "s300", "s320", "s350", "s400", "s430", "s500", "s550", "s600", "s63", "e200", "e220", "e230", "e240", "e250", "e260", "e270", "e280", "e300", "e320", "e350", "e400", "e430", "e500", "c180", "c200", "c220", "c230", "c240", "c250", "c280", "c300", "c320", "c350", "c63", "w123", "w124", "بنز قديم", "سيمبول", "symbol", "ميجان", "megane", "سافران", "safrane", "لوجان", "logan", "تاليسمان", "talisman", "مازدا 3", "مازدا 6", "مازدا 323", "مازدا 626", "أوبترا", "optra", "كروز", "cruze", "ماليبو", "malibu", "إمبالا", "impala", "أكورد", "accord", "سيفيك", "civic", "سيتي", "نوبيرا", "nubira", "ليجانزا", "leganza", "لانوس", "lanos", "إسبيرو", "espero", "سكودا 120", "فافوريت", "favorit", "رينو 11", "رينو 19", "رينو 21", "أودي 80", "أودي 90", "أودي 100", "أوكتافيا", "octavia", "سوبيرب", "superb", "كابريس", "caprice", "بلو بيرد", "bluebird", "e34", "e39", "e60", "f10", "e36", "e46", "e90", "e32", "e38", "w123", "w124", "w201", "w210", "w211", "w212", "إبيكا", "epica", "غرانديور", "grandeur", "i40", "كادينزا", "cadenza", "فورتي", "forte", "ماجنتس", "magentis", "مينتور", "mentor", "سبيكترا", "spectra", "k8", "k9", "k4"],
  },
];

/** تجاوزات صريحة (ماركة:معرّف الطراز) للحالات المتشابهة أو الخاصة */
const OVERRIDES: Record<string, BodyTypeId> = {
  "mercedes:cla": "coupe",
  "mercedes:gla": "suv",
  "mercedes:glb": "suv",
  "ford:transit-connect": "van",
  "mercedes:s500": "sedan",
  "mercedes:s550": "sedan",
  "mercedes:class-a": "hatchback",
  "mercedes:class-b": "van",
  "mercedes:class-r": "van",
  "audi:s5": "coupe",
  "kia:clarus": "sedan",
  "volkswagen:jetta": "sedan",
  "skoda:octavia-a5": "sedan",
  "skoda:octavia-a7": "sedan",
  "toyota:yaris-sedan": "sedan",
  "range-rover:classic": "suv",
};

/** تصنيف افتراضي لكل ماركة عند عدم تطابق أي كلمة مفتاحية */
const BRAND_DEFAULT: Record<string, BodyTypeId> = {
  hyundai: "sedan", kia: "sedan", toyota: "sedan", mercedes: "sedan", bmw: "sedan",
  audi: "sedan", volkswagen: "hatchback", mazda: "sedan", nissan: "sedan", skoda: "sedan",
  peugeot: "sedan", renault: "sedan", mitsubishi: "sedan", sham: "van",
  ford: "sedan", chevrolet: "sedan", honda: "sedan", suzuki: "hatchback", daewoo: "sedan",
  jeep: "suv", "land-rover": "suv", "range-rover": "suv",
  gmc: "pickup", cadillac: "suv", dodge: "sedan", citroen: "sedan", dacia: "sedan",
  fiat: "sedan", ferrari: "coupe", porsche: "suv", "rolls-royce": "sedan", volvo: "sedan",
  lexus: "sedan", infiniti: "sedan", isuzu: "pickup", subaru: "sedan",
  "samsung-motors": "sedan", ssangyong: "suv", saipa: "sedan", proton: "sedan",
  tesla: "sedan", iveco: "truck", man: "truck", scania: "truck",
  "moto-honda": "motorcycle", "moto-yamaha": "motorcycle", "moto-suzuki": "motorcycle",
  "moto-kawasaki": "motorcycle", "moto-dayang": "motorcycle", "moto-haojue": "motorcycle",
  "moto-rks": "motorcycle",
  cat: "machinery", komatsu: "machinery", jcb: "machinery", bobcat: "machinery",
  sany: "machinery", liugong: "machinery", shantui: "machinery", boom: "machinery",
  bomag: "machinery", ammann: "machinery",
  massey: "tractor", newholland: "tractor", "new-holland": "tractor", johndeere: "tractor",
  "john-deere": "tractor", lovol: "tractor", someca: "tractor", zoomlion: "tractor",
  tumosan: "tractor", hattat: "tractor", pars: "tractor", kubota: "tractor",
  universal: "tractor", solis: "tractor", tafe: "tractor",
  shacman: "truck", sinotruk: "truck", daf: "truck", "renault-trucks": "truck",
  faw: "truck", kamaz: "truck", maz: "truck", hafei: "lighttruck",
  "king-long": "bus", "golden-dragon": "bus", yutong: "bus", higer: "bus", ankai: "bus",
  "moto-jialing": "motorcycle", "moto-loncin": "motorcycle", "moto-bart": "motorcycle",
  "moto-aitani": "motorcycle", "moto-aqqad": "motorcycle", "moto-delta": "motorcycle",
  "moto-yadea": "ebike", "moto-tailg": "ebike",
  "hp-hyundai": "machinery", "hp-lovol": "tractor", zetor: "tractor", miger: "machinery",
  furat: "tractor", "hp-fiat": "tractor", mahindra: "tractor",
};

/** عائلة الماركة: تحدد قواعد التصنيف المسموحة (يمنع تسرّب الدراجات إلى أنواع السيارات) */
const FAMILY: Record<string, "moto" | "equip"> = {
  "moto-honda": "moto", "moto-yamaha": "moto", "moto-suzuki": "moto", "moto-kawasaki": "moto",
  "moto-dayang": "moto", "moto-haojue": "moto", "moto-rks": "moto", "other-moto": "moto",
  "moto-jialing": "moto", "moto-loncin": "moto", "moto-bart": "moto", "moto-aitani": "moto",
  "moto-aqqad": "moto", "moto-delta": "moto", "moto-yadea": "moto", "moto-tailg": "moto",
  cat: "equip", komatsu: "equip", jcb: "equip", bobcat: "equip",
  sany: "equip", liugong: "equip", shantui: "equip", boom: "equip", bomag: "equip", ammann: "equip",
  massey: "equip", newholland: "equip", "new-holland": "equip", johndeere: "equip", "john-deere": "equip",
  lovol: "equip", someca: "equip", zoomlion: "equip", tumosan: "equip", hattat: "equip", pars: "equip",
  kubota: "equip", universal: "equip", solis: "equip", tafe: "equip", "other-equip": "equip",
  "hp-hyundai": "equip", "hp-lovol": "equip", zetor: "equip", miger: "equip",
  furat: "equip", "hp-fiat": "equip", mahindra: "equip",
};

const ALLOWED: Record<"car" | "moto" | "equip", BodyTypeId[]> = {
  car: ["sedan", "hatchback", "suv", "coupe", "pickup", "van", "bus", "truck", "lighttruck", "other"],
  moto: ["motorcycle", "scooter", "ebike", "other"],
  equip: ["tractor", "machinery", "other"],
};

/** تصنيف طراز واحد: يعيد معرّف نوع الهيكل */
export function bodyTypeOfModel(brandId: string | undefined, model: BrandModel): BodyTypeId {
  const family = (brandId && FAMILY[brandId]) || "car";
  const allowed = ALLOWED[family === "moto" ? "moto" : family === "equip" ? "equip" : "car"];
  /* ① نوع الهيكل الصريح في البيانات (إن وُجد وكان مسموحاً لعائلة الماركة) */
  const explicit = model.body as BodyTypeId | undefined;
  if (explicit && allowed.includes(explicit)) return explicit;
  /* ② تجاوزات صريحة للحالات المتشابهة */
  const override = OVERRIDES[`${brandId ?? ""}:${model.id}`];
  if (override) return override;
  const haystack = [model.name, model.en ?? "", model.id].join(" ").toLowerCase();
  for (const rule of RULES) {
    if (!allowed.includes(rule.id)) continue;
    if (rule.keys.some((k) => haystack.includes(k.toLowerCase()))) return rule.id;
  }
  const fallback = BRAND_DEFAULT[brandId ?? ""] ?? "other";
  return allowed.includes(fallback) ? fallback : family === "moto" ? "motorcycle" : family === "equip" ? "machinery" : "other";
}

/** كل ماركات المركبات (سيارات + دراجات + آليات + الماركات المخصصة) بلا «أخرى» */
export const ALL_VEHICLE_BRANDS: Brand[] = [
  ...BRANDS,
  ...MOTO_BRANDS,
  ...EQUIP_BRANDS,
  ...SCOPED_SPECIAL_BRANDS,
];

export interface BodyTypeBrand {
  brand: Brand;
  models: BrandModel[];
}

/** الماركات والطرازات داخل نوع معيّن */
export function catalogForBodyType(typeId: BodyTypeId): BodyTypeBrand[] {
  const out: BodyTypeBrand[] = [];
  for (const brand of ALL_VEHICLE_BRANDS) {
    const models = brand.models.filter((m) => bodyTypeOfModel(brand.id, m) === typeId);
    if (models.length || (typeId === "other" && !brand.models.length)) out.push({ brand, models });
  }
  return out;
}

/** توزيع طرازات ماركة واحدة على الأنواع */
export function bodyTypesOfBrand(brandId: string): { type: BodyTypeDef; models: BrandModel[] }[] {
  const brand = ALL_VEHICLE_BRANDS.find((b) => b.id === brandId);
  if (!brand) return [];
  const map = new Map<BodyTypeId, BrandModel[]>();
  brand.models.forEach((m) => {
    const t = bodyTypeOfModel(brandId, m);
    map.set(t, [...(map.get(t) ?? []), m]);
  });
  return BODY_TYPES.filter((t) => map.has(t.id)).map((t) => ({ type: t, models: map.get(t.id) ?? [] }));
}

/** عدد الطرازات الكلي في كل نوع */
export function bodyTypeCounts(): Record<BodyTypeId, number> {
  const counts = {} as Record<BodyTypeId, number>;
  BODY_TYPES.forEach((t) => (counts[t.id] = 0));
  ALL_VEHICLE_BRANDS.forEach((b) => {
    b.models.forEach((m) => {
      const t = bodyTypeOfModel(b.id, m);
      counts[t] = (counts[t] ?? 0) + 1;
    });
  });
  return counts;
}

/** استنتاج نوع الهيكل من إعلان (حقل صريح أو من الماركة/الطراز المخزَّن) */
export function bodyTypeOfAd(ad: {
  bodyType?: string;
  brandId?: string;
  modelId?: string;
  make?: string;
  model?: string;
}): BodyTypeId {
  if (ad.bodyType) return ad.bodyType as BodyTypeId;
  const brand = ALL_VEHICLE_BRANDS.find(
    (b) => b.id === ad.brandId || b.name === ad.make || (ad.make ? ad.make.includes(b.name) : false)
  );
  if (brand) {
    const model =
      brand.models.find((m) => m.id === ad.modelId) ??
      brand.models.find((m) => ad.model && (ad.model.includes(m.name) || (m.en && ad.model.toLowerCase().includes(m.en.toLowerCase()))));
    if (model) return bodyTypeOfModel(brand.id, model);
    /* موجة 17: طراز خارج القائمة ← مطابقة قواعد الكلمات على النص قبل افتراض الماركة */
    const hayIn = [ad.make ?? "", ad.model ?? ""].join(" ").toLowerCase();
    for (const rule of RULES) {
      if (rule.keys.some((k) => hayIn.includes(k.toLowerCase()))) return rule.id;
    }
    return BRAND_DEFAULT[brand.id] ?? "other";
  }
  /* موجة 17: ماركة مخصّصة ← اشتقاق من نص الإعلان نفسه (كوستر←باص، هايلوكس←بيك أب…) */
  const hay = [ad.make ?? "", ad.model ?? ""].join(" ").toLowerCase();
  if (hay.trim()) {
    for (const rule of RULES) {
      if (rule.keys.some((k) => hay.includes(k.toLowerCase()))) return rule.id;
    }
  }
  return "other";
}

/* ==================== مجموعات السوق: صيني · كهربائي · الأكثر رواجاً ==================== */

export type VehicleMarket = "all" | "ev";

/** مجموعتا العرض: كل الماركات مدمجة · والكهربائية/الهايبرد وحدها قسم مستقل */
export const VEHICLE_MARKETS: { id: VehicleMarket; name: string; hint: string }[] = [
  { id: "all", name: "كل الماركات", hint: "الصينية والأوروبية واليابانية والكورية مدمجة في قائمة واحدة" },
  { id: "ev", name: "كهربائية وهايبرد", hint: "سيارات تعمل بالكهرباء بالكامل أو هايبرد/مدى ممتد" },
];

export const isChineseBrand = (brand: Brand) => (brand.tags ?? []).includes("chinese");
export const isElectrified = (m: BrandModel) => m.fuel === "ev" || m.fuel === "hybrid";
export const isHotModel = (m: BrandModel) => Boolean(m.hot);

/** تصفية كتالوج نوع معيّن بحسب مجموعة العرض */
export function filterCatalogByMarket(catalog: BodyTypeBrand[], market: VehicleMarket): BodyTypeBrand[] {
  if (market === "all") return catalog;
  return catalog
    .map(({ brand, models }) => ({ brand, models: models.filter(isElectrified) }))
    .filter((x) => x.models.length > 0);
}

/** إحصاء الماركات والطرازات في كل مجموعة */
export function marketStats() {
  const all = ALL_VEHICLE_BRANDS;
  const evBrands = all.filter((b) => b.models.some(isElectrified));
  const count = (list: Brand[], f?: (m: BrandModel) => boolean) =>
    list.reduce((s, b) => s + b.models.filter((m) => (f ? f(m) : true)).length, 0);
  return {
    all: { brands: all.length, models: count(all) },
    ev: { brands: evBrands.length, models: count(evBrands, isElectrified) },
  } as Record<VehicleMarket, { brands: number; models: number }>;
}

/** الطرازات الكهربائية داخل نوع معيّن (للشارات والأعداد) */
export function electrifiedCountIn(typeId: BodyTypeId): number {
  return catalogForBodyType(typeId).reduce((s, x) => s + x.models.filter(isElectrified).length, 0);
}
