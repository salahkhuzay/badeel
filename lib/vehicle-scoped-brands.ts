/* ==========================================================================
   lib/vehicle-scoped-brands.ts — ماركات المركبات المخصّصة بحسب نوع المركبة
   --------------------------------------------------------------------------
   لكل نوع مركبة قائمة ماركات محددة حصراً تناسبه:
   - القاعدة الذهبية: اسم الماركة فقط بدون أرقام أو موديلات بين قوسين
   - في كل نوع خيار «أخرى» متاح دائماً.
   ========================================================================== */

import type { Brand } from "./brands";
import type { VehicleType } from "./types";

export const OTHER_VEHICLE_BRAND: Brand = {
  id: "other",
  name: "أخرى",
  en: "Other",
  monogram: "؟",
  color: "#475569",
  origin: "—",
  models: [],
};

/* ---------------- 1) الجرارات الزراعية ---------------- */
export const TRACTOR_BRANDS: Brand[] = [
  { id: "massey", name: "ماسي فيرغسون", en: "Massey Ferguson", monogram: "MF", color: "#C8102E", logo: "massey", origin: "بريطانيا / أمريكا", alt: ["ماسي فيرجسون", "ماسي"], models: [] },
  { id: "new-holland", name: "نيوهولاند", en: "New Holland", monogram: "NH", color: "#002F6C", origin: "إيطاليا / أمريكا", models: [] },
  { id: "lovol", name: "فوتون لوفول", en: "Foton Lovol", monogram: "FL", color: "#C8102E", origin: "الصين", models: [] },
  { id: "furat", name: "فرات", en: "Furat", monogram: "ف", color: "#15803D", origin: "سوريا", models: [] },
  { id: "someca", name: "سوميكا", en: "Someca", monogram: "SO", color: "#E05A10", origin: "فرنسا / إيطاليا", models: [] },
  { id: "zetor", name: "زيتور", en: "Zetor", monogram: "Z", color: "#C8102E", origin: "التشيك", models: [] },
  { id: "zoomlion", name: "زووم لايون", en: "Zoomlion", monogram: "ZL", color: "#84BD00", origin: "الصين", models: [] },
  { id: "hp-fiat", name: "فيات", en: "Fiat", monogram: "F", color: "#941711", logo: "fiat", origin: "إيطاليا", models: [] },
  { id: "mahindra", name: "ماهيندرا", en: "Mahindra", monogram: "MA", color: "#DD052B", logo: "mahindra", origin: "الهند", models: [] },
  { id: "tumosan", name: "توموسان", en: "Tümosan", monogram: "TM", color: "#D32F2F", origin: "تركيا", models: [] },
  { id: "hattat", name: "هتات", en: "Hattat", monogram: "HT", color: "#1976D2", origin: "تركيا", models: [] },
  { id: "pars", name: "بارس", en: "Pars", monogram: "PR", color: "#388E3C", origin: "إيران", models: [] },
  { id: "kubota", name: "كوبوتا", en: "Kubota", monogram: "KB", color: "#FF6F00", origin: "اليابان", models: [] },
  { id: "john-deere", name: "جون دير", en: "John Deere", monogram: "JD", color: "#367C2B", origin: "أمريكا", models: [] },
  { id: "universal", name: "يونيفرسال", en: "Universal (UTB)", monogram: "UTB", color: "#E65100", origin: "رومانيا", models: [] },
  { id: "dongfeng", name: "دونغ فينغ", en: "Dongfeng", monogram: "DF", color: "#C62828", origin: "الصين", models: [] },
  { id: "solis", name: "سوليس", en: "Solis", monogram: "SL", color: "#1565C0", origin: "الهند", models: [] },
  { id: "tafe", name: "تافي", en: "TAFE", monogram: "TF", color: "#B71C1C", origin: "الهند", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 2) شاحنة كبيرة ---------------- */
export const HEAVY_TRUCK_BRANDS: Brand[] = [
  { id: "mercedes", name: "مرسيدس", en: "Mercedes-Benz", monogram: "M", color: "#000000", logo: "mercedes", origin: "ألمانيا", models: [] },
  { id: "volvo", name: "فولفو", en: "Volvo", monogram: "VOLVO", color: "#003057", logo: "volvo", origin: "السويد", models: [] },
  { id: "iveco", name: "ايفيكو", en: "Iveco", monogram: "IV", color: "#003399", origin: "إيطاليا", models: [] },
  { id: "man", name: "مان", en: "MAN", monogram: "MAN", color: "#002B49", origin: "ألمانيا", models: [] },
  { id: "scania", name: "سكانيا", en: "Scania", monogram: "SC", color: "#041E42", origin: "السويد", models: [] },
  { id: "shacman", name: "شاكمان", en: "Shacman", monogram: "SH", color: "#D32F2F", origin: "الصين", models: [] },
  { id: "sinotruk", name: "سينوتراك", en: "Sinotruk Howo", monogram: "HOWO", color: "#C62828", origin: "الصين", models: [] },
  { id: "foton", name: "فوتون", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", models: [] },
  { id: "daf", name: "داف", en: "DAF", monogram: "DAF", color: "#004B87", origin: "هولندا", models: [] },
  { id: "renault-trucks", name: "رينو", en: "Renault Trucks", monogram: "RT", color: "#CC0000", origin: "فرنسا", models: [] },
  { id: "faw", name: "فاو", en: "FAW", monogram: "FAW", color: "#003399", origin: "الصين", models: [] },
  { id: "dongfeng", name: "دونغ فينغ", en: "Dongfeng", monogram: "DF", color: "#C62828", origin: "الصين", models: [] },
  { id: "jac", name: "جاك", en: "JAC", monogram: "JAC", color: "#E53935", origin: "الصين", models: [] },
  { id: "kamaz", name: "كاماز", en: "Kamaz", monogram: "KM", color: "#0D47A1", origin: "روسيا", models: [] },
  { id: "maz", name: "ماز", en: "MAZ", monogram: "MAZ", color: "#B71C1C", origin: "بيلاروسيا", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 3) شاحنة متوسطة ---------------- */
export const MEDIUM_TRUCK_BRANDS: Brand[] = [
  { id: "hyundai", name: "هيونداي", en: "Hyundai", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["بورتر", "انتر", "H100", "اتش 100", "مايتي"], models: [] },
  { id: "kia", name: "كيا", en: "Kia", monogram: "KIA", color: "#05141F", logo: "kia", origin: "كوريا الجنوبية", alt: ["كيا 4000", "كيا 2700", "بونغو", "K4000", "K2700"], models: [] },
  { id: "truck-porter", name: "بورتر", en: "Hyundai Porter", monogram: "P", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["بورتر", "بورترو", "Porter", "H100"], models: [] },
  { id: "truck-inter", name: "انتر", en: "Hyundai Inter / Mighty", monogram: "IN", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["انتر", "إنتر", "مايتي", "Mighty"], models: [] },
  { id: "isuzu", name: "ايسوزو", en: "Isuzu", monogram: "ISUZU", color: "#CC0000", origin: "اليابان", alt: ["إيسوزو", "ايسوزو شاحنة", "NPR", "NQR"], models: [] },
  { id: "jac", name: "جاك", en: "JAC", monogram: "JAC", color: "#E53935", origin: "الصين", models: [] },
  { id: "foton", name: "فوتون", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", alt: ["فوتون شاحنة", "فورلاند", "أولين"], models: [] },
  { id: "mitsubishi", name: "ميتسوبيشي", en: "Mitsubishi", monogram: "M", color: "#D12640", logo: "mitsubishi", origin: "اليابان", alt: ["كانتر", "Canter", "ميتسوبيشي كانتر"], models: [] },
  { id: "dongfeng", name: "دونغ فينغ", en: "Dongfeng", monogram: "DF", color: "#C62828", origin: "الصين", models: [] },
  { id: "faw", name: "فاو", en: "FAW", monogram: "FAW", color: "#003399", origin: "الصين", models: [] },
  { id: "nissan", name: "نيسان", en: "Nissan", monogram: "N", color: "#C3002F", logo: "nissan", origin: "اليابان", alt: ["كابستار", "اتلس", "Cabstar"], models: [] },
  { id: "tata", name: "تاتا", en: "Tata", monogram: "TATA", color: "#005B94", origin: "الهند", models: [] },
  { id: "daewoo", name: "دايو", en: "Daewoo", monogram: "D", color: "#0B4EA2", logo: "daewoo", origin: "كوريا الجنوبية", models: [] },
  { id: "mercedes", name: "مرسيدس", en: "Mercedes-Benz", monogram: "M", color: "#000000", logo: "mercedes", origin: "ألمانيا", models: [] },
  { id: "man", name: "مان", en: "MAN", monogram: "MAN", color: "#002B49", origin: "ألمانيا", models: [] },
  { id: "iveco", name: "ايفيكو", en: "Iveco", monogram: "IV", color: "#003399", origin: "إيطاليا", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* للتوافق العام مع أي استدعاء سابق */
export const TRUCK_BRANDS = HEAVY_TRUCK_BRANDS;

/* ---------------- 4) الآليات الثقيلة ---------------- */
export const MACHINERY_BRANDS: Brand[] = [
  { id: "cat", name: "كاتربيلر", en: "Caterpillar", monogram: "CAT", color: "#FFC72C", text: "#1E293B", logo: "caterpillar", origin: "أمريكا", models: [] },
  { id: "komatsu", name: "كوماتسو", en: "Komatsu", monogram: "KO", color: "#F6A800", text: "#1E293B", logo: "komatsu", origin: "اليابان", models: [] },
  { id: "hp-hyundai", name: "هيونداي", en: "Hyundai CE", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["هيونداي آليات"], models: [] },
  { id: "sany", name: "ساني", en: "Sany", monogram: "SY", color: "#C62828", origin: "الصين", models: [] },
  { id: "liugong", name: "ليوغونغ", en: "Liugong", monogram: "LG", color: "#E65100", origin: "الصين", models: [] },
  { id: "shantui", name: "شانتوي", en: "Shantui", monogram: "ST", color: "#F57C00", origin: "الصين", models: [] },
  { id: "boom", name: "بوم", en: "Boom", monogram: "BM", color: "#D32F2F", origin: "متنوع", models: [] },
  { id: "bomag", name: "بوماج", en: "Bomag", monogram: "BG", color: "#FBC02D", text: "#1E293B", origin: "ألمانيا", models: [] },
  { id: "ammann", name: "أمان", en: "Ammann", monogram: "AM", color: "#1976D2", origin: "سويسرا", models: [] },
  { id: "bobcat", name: "بوبكات", en: "Bobcat", monogram: "BC", color: "#ED1C24", origin: "أمريكا", models: [] },
  { id: "jcb", name: "JCB", en: "JCB", monogram: "JCB", color: "#FBB03B", text: "#1E293B", origin: "بريطانيا", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 5) الدراجات النارية ---------------- */
export const MOTORCYCLE_BRANDS: Brand[] = [
  { id: "moto-bart", name: "بارت", en: "Bart", monogram: "B", color: "#7C3AED", origin: "سوريا (تجميع)", models: [] },
  { id: "moto-aitani", name: "عيتاني", en: "Aitani", monogram: "ع", color: "#0F766E", origin: "سوريا (تجميع)", models: [] },
  { id: "moto-aqqad", name: "عقاد", en: "Aqqad", monogram: "ع", color: "#B45309", origin: "سوريا (تجميع)", models: [] },
  { id: "moto-delta", name: "دلتا", en: "Delta", monogram: "د", color: "#0369A1", origin: "سوريا (تجميع)", models: [] },
  { id: "moto-jialing", name: "جيلينغ", en: "Jialing", monogram: "J", color: "#B91C1C", origin: "الصين", models: [] },
  { id: "moto-loncin", name: "لونسن", en: "Loncin", monogram: "L", color: "#1D4ED8", origin: "الصين", models: [] },
  { id: "moto-honda", name: "هوندا", en: "Honda", monogram: "H", color: "#E40521", logo: "honda", origin: "اليابان", models: [] },
  { id: "moto-yamaha", name: "ياماها", en: "Yamaha", monogram: "Y", color: "#0033A0", logo: "yamaha", origin: "اليابان", models: [] },
  { id: "moto-suzuki", name: "سوزوكي", en: "Suzuki", monogram: "S", color: "#E30613", logo: "suzuki", origin: "اليابان", models: [] },
  { id: "moto-dayang", name: "دايون", en: "Dayang", monogram: "د", color: "#C8102E", origin: "الصين", models: [] },
  { id: "moto-haojue", name: "هواجوي", en: "Haojue", monogram: "ه", color: "#E11A22", origin: "الصين", models: [] },
  { id: "moto-rks", name: "RKS", en: "RKS", monogram: "R", color: "#0A4D9C", origin: "الصين", models: [] },
  { id: "moto-kawasaki", name: "كاوازاكي", en: "Kawasaki", monogram: "K", color: "#00A650", logo: "kawasaki", origin: "اليابان", models: [] },
  { id: "moto-yadea", name: "ياديا", en: "Yadea", monogram: "Y", color: "#FF6600", origin: "الصين", alt: ["ياديا كهربائية"], models: [] },
  { id: "moto-tailg", name: "تايلغ", en: "Tailg", monogram: "T", color: "#0080FF", origin: "الصين", alt: ["تايلغ كهربائية"], models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 6) شاحنة صغيرة ( سوزوكي ) ---------------- */
export const MINI_TRUCK_BRANDS: Brand[] = [
  { id: "suzuki", name: "سوزوكي", en: "Suzuki Carry", monogram: "S", color: "#E30613", logo: "suzuki", origin: "اليابان", models: [] },
  { id: "changan", name: "شانجان", en: "Changan", monogram: "CA", color: "#003A70", logo: "changan", origin: "الصين", models: [] },
  { id: "dfsk", name: "دفسك", en: "DFSK", monogram: "DFSK", color: "#CC0000", logo: "dfsk", origin: "الصين", models: [] },
  { id: "foton", name: "فوتون", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", models: [] },
  { id: "dongfeng", name: "دونغ فينغ", en: "Dongfeng", monogram: "DF", color: "#C62828", origin: "الصين", models: [] },
  { id: "hafei", name: "هاوفي", en: "Hafei", monogram: "HF", color: "#D32F2F", origin: "الصين", models: [] },
  { id: "daewoo", name: "دايو", en: "Daewoo Labo", monogram: "D", color: "#0B4EA2", logo: "daewoo", origin: "كوريا الجنوبية", alt: ["لابو", "Labo"], models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 7) بيك أب ---------------- */
export const PICKUP_BRANDS: Brand[] = [
  { id: "toyota", name: "تويوتا", en: "Toyota", monogram: "T", color: "#EB0A1E", logo: "toyota", origin: "اليابان", alt: ["هاي لوكس", "شاص", "Hilux"], models: [] },
  { id: "mitsubishi", name: "ميتسوبيشي", en: "Mitsubishi", monogram: "M", color: "#D12640", logo: "mitsubishi", origin: "اليابان", alt: ["L200", "ال 200"], models: [] },
  { id: "nissan", name: "نيسان", en: "Nissan", monogram: "N", color: "#C3002F", logo: "nissan", origin: "اليابان", alt: ["نافارا", "داتسون", "ددسن", "Navara"], models: [] },
  { id: "isuzu", name: "ايسوزو", en: "Isuzu", monogram: "ISUZU", color: "#CC0000", origin: "اليابان", alt: ["دي ماكس", "D-Max"], models: [] },
  { id: "skoda", name: "سكودا", en: "Škoda", monogram: "S", color: "#0E3A2F", logo: "skoda", origin: "التشيك", alt: ["سكودا بيك أب", "فيليشيا بيك أب"], models: [] },
  { id: "volkswagen", name: "فولكس فاغن", en: "Volkswagen", monogram: "VW", color: "#151F5D", logo: "volkswagen", origin: "ألمانيا", alt: ["فولكس فاجن", "كادي", "تارو", "أماروك", "Amarok"], models: [] },
  { id: "chery", name: "شيري", en: "Chery", monogram: "CH", color: "#E4032E", logo: "chery", origin: "الصين", alt: ["شيري بيك أب"], models: [] },
  { id: "zaz", name: "زاز دايو", en: "ZAZ Daewoo", monogram: "ZAZ", color: "#0B4EA2", logo: "daewoo", origin: "أوكرانيا / كوريا الجنوبية", alt: ["زاز", "زاز بيك أب", "دايو زاز", "تافريا بيك أب", "ZAZ"], models: [] },
  { id: "ford", name: "فورد", en: "Ford", monogram: "F", color: "#003478", logo: "ford", origin: "أمريكا", alt: ["رينجر", "F-150", "F150", "Ranger"], models: [] },
  { id: "chevrolet", name: "شيفروليه", en: "Chevrolet", monogram: "CH", color: "#CD9834", logo: "chevrolet", origin: "أمريكا", alt: ["سيلفرادو", "كولورادو", "Silverado"], models: [] },
  { id: "gmc", name: "جي إم سي", en: "GMC", monogram: "GMC", color: "#CC0000", logo: "gmc", origin: "أمريكا", alt: ["سييرا", "Sierra"], models: [] },
  { id: "foton", name: "فوتون", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", alt: ["تونلاند", "Tunland"], models: [] },
  { id: "changan", name: "شانجان", en: "Changan", monogram: "CA", color: "#003A70", logo: "changan", origin: "الصين", alt: ["هنتر", "Hunter"], models: [] },
  { id: "great-wall", name: "جريت وول", en: "Great Wall", monogram: "GW", color: "#CC0000", origin: "الصين", alt: ["باور", "وينجل", "Poer", "Wingle"], models: [] },
  { id: "jac", name: "جاك", en: "JAC", monogram: "JAC", color: "#E53935", origin: "الصين", alt: ["T6", "T8", "T8 Pro"], models: [] },
  { id: "mazda", name: "مازدا", en: "Mazda", monogram: "M", color: "#101010", logo: "mazda", origin: "اليابان", alt: ["BT-50", "BT50"], models: [] },
  { id: "hyundai", name: "هيونداي", en: "Hyundai", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["سانتا كروز"], models: [] },
  { id: "kia", name: "كيا", en: "Kia", monogram: "KIA", color: "#05141F", logo: "kia", origin: "كوريا الجنوبية", alt: ["تاسمان", "بونغو"], models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 8) فان ---------------- */
export const VAN_BRANDS: Brand[] = [
  { id: "hyundai", name: "هيونداي", en: "Hyundai", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["H1", "اتش 1", "ستاريا", "سولاتي"], models: [] },
  { id: "kia", name: "كيا", en: "Kia", monogram: "KIA", color: "#05141F", logo: "kia", origin: "كوريا الجنوبية", alt: ["بريستيج", "كارنيفال", "كرنفال"], models: [] },
  { id: "toyota", name: "تويوتا", en: "Toyota", monogram: "T", color: "#EB0A1E", logo: "toyota", origin: "اليابان", alt: ["هايس", "HiAce"], models: [] },
  { id: "mercedes", name: "مرسيدس", en: "Mercedes-Benz", monogram: "M", color: "#000000", logo: "mercedes", origin: "ألمانيا", alt: ["فيتو", "سبرينتر", "Vito", "Sprinter"], models: [] },
  { id: "volkswagen", name: "فولكس فاغن", en: "Volkswagen", monogram: "VW", color: "#001E50", logo: "volkswagen", origin: "ألمانيا", alt: ["فولكس فاجن", "ترانسبورتر", "كادي", "كرافتر", "Transporter", "Caddy"], models: [] },
  { id: "ford", name: "فورد", en: "Ford", monogram: "F", color: "#003478", logo: "ford", origin: "أمريكا", alt: ["ترانزيت", "Transit"], models: [] },
  { id: "renault", name: "رينو", en: "Renault", monogram: "R", color: "#000000", logo: "renault", origin: "فرنسا", alt: ["ترافيك", "كانجو", "Trafic", "Kangoo"], models: [] },
  { id: "peugeot", name: "بيجو", en: "Peugeot", monogram: "P", color: "#000000", logo: "peugeot", origin: "فرنسا", alt: ["بارتنر", "بوكسر", "Partner", "Boxer"], models: [] },
  { id: "citroen", name: "سيتروين", en: "Citroën", monogram: "C", color: "#6E0000", origin: "فرنسا", alt: ["بيرلينغو", "جامبي", "Berlingo"], models: [] },
  { id: "fiat", name: "فيات", en: "Fiat", monogram: "FIAT", color: "#941711", logo: "fiat", origin: "إيطاليا", alt: ["دوبلو", "دوكاتو", "Doblo", "Ducato"], models: [] },
  { id: "changan", name: "شانجان", en: "Changan", monogram: "CA", color: "#003A70", logo: "changan", origin: "الصين", models: [] },
  { id: "dfsk", name: "دفسك", en: "DFSK", monogram: "DFSK", color: "#CC0000", logo: "dfsk", origin: "الصين", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 9) ميكرو باص ---------------- */
export const MICROBUS_BRANDS: Brand[] = [
  { id: "micro-asia", name: "آسيا", en: "Asia Motors", monogram: "AS", color: "#0B4EA2", origin: "كوريا الجنوبية", alt: ["اسيا", "Asia", "كومبي", "توبيك"], models: [] },
  { id: "toyota", name: "تويوتا", en: "Toyota", monogram: "T", color: "#EB0A1E", logo: "toyota", origin: "اليابان", alt: ["كوستر", "Coaster"], models: [] },
  { id: "hyundai", name: "هيونداي", en: "Hyundai", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["كاونتي", "كورس", "County", "Chorus"], models: [] },
  { id: "mitsubishi", name: "ميتسوبيشي", en: "Mitsubishi", monogram: "M", color: "#D12640", logo: "mitsubishi", origin: "اليابان", alt: ["روزا", "Rosa"], models: [] },
  { id: "nissan", name: "نيسان", en: "Nissan", monogram: "N", color: "#C3002F", logo: "nissan", origin: "اليابان", alt: ["سيفيليان", "Civilian", "أورفان"], models: [] },
  { id: "king-long", name: "كينغ لونغ", en: "King Long", monogram: "KL", color: "#C8102E", origin: "الصين", models: [] },
  { id: "golden-dragon", name: "جولدن دراجون", en: "Golden Dragon", monogram: "GD", color: "#D32F2F", origin: "الصين", models: [] },
  { id: "foton", name: "فوتون", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", models: [] },
  { id: "jac", name: "جاك", en: "JAC", monogram: "JAC", color: "#E53935", origin: "الصين", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 10) باص ---------------- */
export const BUS_BRANDS: Brand[] = [
  { id: "mercedes", name: "مرسيدس", en: "Mercedes-Benz", monogram: "M", color: "#000000", logo: "mercedes", origin: "ألمانيا", alt: ["ترافيكو", "توريزمو", "باصات"], models: [] },
  { id: "man", name: "مان", en: "MAN", monogram: "MAN", color: "#002B49", origin: "ألمانيا", alt: ["ليونز كوتش", "Lions Coach"], models: [] },
  { id: "volvo", name: "فولفو", en: "Volvo", monogram: "VOLVO", color: "#003057", logo: "volvo", origin: "السويد", models: [] },
  { id: "scania", name: "سكانيا", en: "Scania", monogram: "SC", color: "#041E42", origin: "السويد", models: [] },
  { id: "yutong", name: "يوتونغ", en: "Yutong", monogram: "YT", color: "#004B87", origin: "الصين", models: [] },
  { id: "king-long", name: "كينغ لونغ", en: "King Long", monogram: "KL", color: "#C8102E", origin: "الصين", models: [] },
  { id: "higer", name: "هيجر", en: "Higer", monogram: "HIGER", color: "#D32F2F", origin: "الصين", models: [] },
  { id: "ankai", name: "أنكاي", en: "Ankai", monogram: "AK", color: "#C62828", origin: "الصين", models: [] },
  { id: "dongfeng", name: "دونغ فينغ", en: "Dongfeng", monogram: "DF", color: "#C62828", origin: "الصين", models: [] },
  OTHER_VEHICLE_BRAND,
];

/** كل الماركات المخصصة غير السياحية لفهرستها في محرك البحث والعرض العام */
export const SCOPED_SPECIAL_BRANDS: Brand[] = [
  ...TRACTOR_BRANDS,
  ...HEAVY_TRUCK_BRANDS,
  ...MEDIUM_TRUCK_BRANDS,
  ...MACHINERY_BRANDS,
  ...MOTORCYCLE_BRANDS,
  ...MINI_TRUCK_BRANDS,
  ...PICKUP_BRANDS,
  ...VAN_BRANDS,
  ...MICROBUS_BRANDS,
  ...BUS_BRANDS,
];

/** استرجاع الماركات المقابلة لنوع المركبة */
export function getScopedVehicleBrands(
  type?: VehicleType | "",
  passengerBrands: Brand[] = []
): Brand[] {
  switch (type) {
    case "tractor":
      return TRACTOR_BRANDS;
    case "heavy-truck":
    case "truck":
      return HEAVY_TRUCK_BRANDS;
    case "medium-truck":
      return MEDIUM_TRUCK_BRANDS;
    case "machinery":
      return MACHINERY_BRANDS;
    case "motorcycle":
      return MOTORCYCLE_BRANDS;
    case "mini-truck":
      return MINI_TRUCK_BRANDS;
    case "pickup":
      return PICKUP_BRANDS;
    case "van":
      return VAN_BRANDS;
    case "microbus":
      return MICROBUS_BRANDS;
    case "bus":
      return BUS_BRANDS;
    case "passenger":
    case "other":
    default: {
      // إبقاء خيار «أخرى» دائماً في نهاية القائمة
      const withoutOther = passengerBrands.filter((b) => b.id !== "other");
      return [...withoutOther, OTHER_VEHICLE_BRAND];
    }
  }
}
