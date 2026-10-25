/* ==========================================================================
   lib/vehicle-scoped-brands.ts — ماركات المركبات المخصّصة بحسب نوع المركبة
   --------------------------------------------------------------------------
   لكل نوع مركبة قائمة ماركات محددة حصراً تناسبه:
   - جرار زراعي: ماسي، نيوهولاند، فوتون لوفول، فرات، سوميكا، زيتور، زووم لايون،
     فيات، ماهيندرا، توموسان، هتات، بارس، كوبوتا، جون دير، يونيفرسال، دونغ فينغ،
     سوليس، تافي، أخرى.
   - شاحنة كبيرة: مرسيدس، فولفو، ايفيكو، مان، سكانيا، شاكمان، سينوتراك،
     فوتون، داف، رينو، فاو، دونغ فينغ، جاك، كاماز، ماز، أخرى.
   - شاحنة متوسطة: بورتر، H100، انتر، ايسوزو، جاك، فوتون، كيا 4000، كيا 2700،
     هيونداي، كيا، ميتسوبيشي كانتر، دونغ فينغ، فاو، نيسان، تاتا، دايو، أخرى.
   - آليات ثقيلة: كاتربيلر، كوماتسو، هيونداي، ساني، ليوغونغ، شانتوي، بوم، بوماج،
     أمان، بوبكات، JCB، أخرى.
   - دراجات نارية: بارت، عيتاني، عقاد، دلتا، جيلينغ، لونسن، هوندا، ياماها، سوزوكي،
     دايون، هواجوي، RKS، كاوازاكي، ياديا، تايلغ، أخرى.
   - شاحنة صغيرة (سوزوكي): سوزوكي، شانجان، دفسك، فوتون، دونغ فينغ، هاوفي، دايو، أخرى.
   - بيك أب: تويوتا، ميتسوبيشي، نيسان، ايسوزو، فورد، شيفروليه، جي إم سي، فوتون،
     شانجان، جريت وول، جاك، مازدا، أخرى.
   - فان: هيونداي، كيا، تويوتا، مرسيدس، فولكس فاجن، فورد، رينو، بيجو، سيتروين، فيات،
     شانجان، دفسك، أخرى.
   - ميكرو باص: آسيا، تويوتا، هيونداي، ميتسوبيشي، نيسان، كينغ لونغ، جولدن دراجون، فوتون،
     جاك، أخرى.
   - باص: مرسيدس، مان، فولفو، سكانيا، يوتونغ، كينغ لونغ، هيجر، أنكاي، دونغ فينغ، أخرى.
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
  { id: "truck-porter", name: "بورتر", en: "Hyundai Porter", monogram: "P", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["بورتر", "بورترو", "Porter"], models: [] },
  { id: "truck-h100", name: "H100", en: "Hyundai H100", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["اتش 100", "H-100", "H100"], models: [] },
  { id: "truck-inter", name: "انتر", en: "Hyundai Inter / Mighty", monogram: "IN", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", alt: ["انتر", "إنتر", "مايتي", "Mighty"], models: [] },
  { id: "isuzu", name: "ايسوزو", en: "Isuzu", monogram: "ISUZU", color: "#CC0000", origin: "اليابان", alt: ["إيسوزو", "ايسوزو شاحنة", "NPR", "NQR"], models: [] },
  { id: "jac", name: "جاك", en: "JAC", monogram: "JAC", color: "#E53935", origin: "الصين", models: [] },
  { id: "foton", name: "فوتون", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", alt: ["فوتون شاحنة", "فورلاند"], models: [] },
  { id: "truck-k4000", name: "كيا 4000", en: "Kia K4000", monogram: "K4", color: "#05141F", logo: "kia", origin: "كوريا الجنوبية", alt: ["كيا 4000", "K4000"], models: [] },
  { id: "truck-k2700", name: "كيا 2700", en: "Kia K2700", monogram: "K2", color: "#05141F", logo: "kia", origin: "كوريا الجنوبية", alt: ["كيا 2700", "K2700", "بونغو", "Bongo"], models: [] },
  { id: "hyundai", name: "هيونداي", en: "Hyundai", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", models: [] },
  { id: "kia", name: "كيا", en: "Kia", monogram: "KIA", color: "#05141F", logo: "kia", origin: "كوريا الجنوبية", models: [] },
  { id: "mitsubishi-canter", name: "ميتسوبيشي كانتر", en: "Mitsubishi Canter", monogram: "MC", color: "#D12640", logo: "mitsubishi", origin: "اليابان", alt: ["كانتر", "Canter"], models: [] },
  { id: "dongfeng", name: "دونغ فينغ", en: "Dongfeng", monogram: "DF", color: "#C62828", origin: "الصين", models: [] },
  { id: "faw", name: "فاو", en: "FAW", monogram: "FAW", color: "#003399", origin: "الصين", models: [] },
  { id: "nissan", name: "نيسان", en: "Nissan Cabstar", monogram: "N", color: "#C3002F", logo: "nissan", origin: "اليابان", alt: ["كابستار", "اتلس", "Cabstar"], models: [] },
  { id: "tata", name: "تاتا", en: "Tata", monogram: "TATA", color: "#005B94", origin: "الهند", models: [] },
  { id: "daewoo", name: "دايو", en: "Daewoo", monogram: "D", color: "#0B4EA2", logo: "daewoo", origin: "كوريا الجنوبية", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* للتوافق العام مع أي استدعاء سابق */
export const TRUCK_BRANDS = HEAVY_TRUCK_BRANDS;

/* ---------------- 4) الآليات الثقيلة ---------------- */
export const MACHINERY_BRANDS: Brand[] = [
  { id: "cat", name: "كاتربيلر", en: "Caterpillar", monogram: "CAT", color: "#FFC72C", text: "#1E293B", logo: "caterpillar", origin: "أمريكا", models: [] },
  { id: "komatsu", name: "كوماتسو", en: "Komatsu", monogram: "KO", color: "#F6A800", text: "#1E293B", logo: "komatsu", origin: "اليابان", models: [] },
  { id: "hp-hyundai", name: "هيونداي (آليات)", en: "Hyundai CE", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", models: [] },
  { id: "sany", name: "ساني", en: "Sany", monogram: "SY", color: "#C62828", origin: "الصين", models: [] },
  { id: "liugong", name: "ليوغونغ", en: "Liugong", monogram: "LG", color: "#E65100", origin: "الصين", models: [] },
  { id: "shantui", name: "شانتوي", en: "Shantui", monogram: "ST", color: "#F57C00", origin: "الصين", models: [] },
  { id: "boom", name: "بوم", en: "Boom", monogram: "BM", color: "#D32F2F", origin: "متنوع", models: [] },
  { id: "bomag", name: "بوماج", en: "Bomag", monogram: "BG", color: "#FBC02D", text: "#1E293B", origin: "ألمانيا", models: [] },
  { id: "ammann", name: "أمان", en: "Ammann", monogram: "AM", color: "#1976D2", origin: "سويسرا", models: [] },
  { id: "bobcat", name: "بوبكات", en: "Bobcat", monogram: "BC", color: "#D32F2F", origin: "أمريكا", models: [] },
  { id: "jcb", name: "JCB", en: "JCB", monogram: "JCB", color: "#FFD400", text: "#1E293B", logo: "jcb", origin: "بريطانيا", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 5) الدراجات النارية ---------------- */
export const MOTORCYCLE_BRANDS: Brand[] = [
  { id: "moto-bart", name: "بارت", en: "Bart", monogram: "B", color: "#7C3AED", origin: "سوريا (تجميع)", models: [] },
  { id: "moto-aitani", name: "عيتاني", en: "Aitani", monogram: "ع", color: "#0F766E", origin: "سوريا (تجميع)", models: [] },
  { id: "moto-aqqad", name: "عقاد", en: "Aqqad", monogram: "عق", color: "#B45309", origin: "سوريا (تجميع)", models: [] },
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
  { id: "moto-yadea", name: "ياديا (كهربائية)", en: "Yadea", monogram: "Y", color: "#FF6600", origin: "الصين", models: [] },
  { id: "moto-tailg", name: "تايلغ (كهربائية)", en: "Tailg", monogram: "T", color: "#0080FF", origin: "الصين", models: [] },
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
  { id: "daewoo", name: "دايو (لابو)", en: "Daewoo Labo", monogram: "D", color: "#0B4EA2", logo: "daewoo", origin: "كوريا الجنوبية", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 7) بيك أب ---------------- */
export const PICKUP_BRANDS: Brand[] = [
  { id: "toyota", name: "تويوتا (هاي لوكس / شاص)", en: "Toyota Hilux", monogram: "T", color: "#EB0A1E", logo: "toyota", origin: "اليابان", models: [] },
  { id: "mitsubishi", name: "ميتسوبيشي (L200)", en: "Mitsubishi L200", monogram: "M", color: "#D12640", logo: "mitsubishi", origin: "اليابان", models: [] },
  { id: "nissan", name: "نيسان (نافارا / داتسون)", en: "Nissan Navara", monogram: "N", color: "#C3002F", logo: "nissan", origin: "اليابان", models: [] },
  { id: "isuzu", name: "ايسوزو (D-Max)", en: "Isuzu D-Max", monogram: "ISUZU", color: "#CC0000", origin: "اليابان", models: [] },
  { id: "ford", name: "فورد (F-150 / رينجر)", en: "Ford", monogram: "F", color: "#003478", logo: "ford", origin: "أمريكا", models: [] },
  { id: "chevrolet", name: "شيفروليه (سيلفرادو)", en: "Chevrolet", monogram: "CH", color: "#CD9834", logo: "chevrolet", origin: "أمريكا", models: [] },
  { id: "gmc", name: "جي إم سي (سييرا)", en: "GMC Sierra", monogram: "GMC", color: "#CC0000", logo: "gmc", origin: "أمريكا", models: [] },
  { id: "foton", name: "فوتون (تونلاند)", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", models: [] },
  { id: "changan", name: "شانجان (هنتر)", en: "Changan", monogram: "CA", color: "#003A70", logo: "changan", origin: "الصين", models: [] },
  { id: "great-wall", name: "جريت وول (باور)", en: "Great Wall", monogram: "GW", color: "#CC0000", origin: "الصين", models: [] },
  { id: "jac", name: "جاك (T8)", en: "JAC", monogram: "JAC", color: "#E53935", origin: "الصين", models: [] },
  { id: "mazda", name: "مازدا (BT-50)", en: "Mazda", monogram: "M", color: "#101010", logo: "mazda", origin: "اليابان", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 8) فان ---------------- */
export const VAN_BRANDS: Brand[] = [
  { id: "hyundai", name: "هيونداي (H1 / ستاريا)", en: "Hyundai", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", models: [] },
  { id: "kia", name: "كيا (بريستيج / كارنيفال)", en: "Kia", monogram: "KIA", color: "#05141F", logo: "kia", origin: "كوريا الجنوبية", models: [] },
  { id: "toyota", name: "تويوتا (هايس)", en: "Toyota HiAce", monogram: "T", color: "#EB0A1E", logo: "toyota", origin: "اليابان", models: [] },
  { id: "mercedes", name: "مرسيدس (فيتو / سبرينتر)", en: "Mercedes-Benz", monogram: "M", color: "#000000", logo: "mercedes", origin: "ألمانيا", models: [] },
  { id: "volkswagen", name: "فولكس فاجن (ترانسبورتر / كادي)", en: "Volkswagen", monogram: "VW", color: "#001E50", logo: "volkswagen", origin: "ألمانيا", models: [] },
  { id: "ford", name: "فورد (ترانزيت)", en: "Ford Transit", monogram: "F", color: "#003478", logo: "ford", origin: "أمريكا", models: [] },
  { id: "renault", name: "رينو (ترافيك / كانجو)", en: "Renault", monogram: "R", color: "#000000", logo: "renault", origin: "فرنسا", models: [] },
  { id: "peugeot", name: "بيجو (بارتنر / بوكسر)", en: "Peugeot", monogram: "P", color: "#000000", logo: "peugeot", origin: "فرنسا", models: [] },
  { id: "citroen", name: "سيتروين (بيرلينغو)", en: "Citroën", monogram: "C", color: "#6E0000", origin: "فرنسا", models: [] },
  { id: "fiat", name: "فيات (دوبلو / دوكاتو)", en: "Fiat", monogram: "FIAT", color: "#941711", logo: "fiat", origin: "إيطاليا", models: [] },
  { id: "changan", name: "شانجان", en: "Changan", monogram: "CA", color: "#003A70", logo: "changan", origin: "الصين", models: [] },
  { id: "dfsk", name: "دفسك", en: "DFSK", monogram: "DFSK", color: "#CC0000", logo: "dfsk", origin: "الصين", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 9) ميكرو باص ---------------- */
export const MICROBUS_BRANDS: Brand[] = [
  { id: "micro-asia", name: "آسيا", en: "Asia Motors", monogram: "AS", color: "#0B4EA2", origin: "كوريا الجنوبية", alt: ["اسيا", "Asia", "كومبي", "توبيك"], models: [] },
  { id: "toyota", name: "تويوتا (كوستر)", en: "Toyota Coaster", monogram: "T", color: "#EB0A1E", logo: "toyota", origin: "اليابان", models: [] },
  { id: "hyundai", name: "هيونداي (كاونتي / كورس)", en: "Hyundai County", monogram: "H", color: "#002C5F", logo: "hyundai", origin: "كوريا الجنوبية", models: [] },
  { id: "mitsubishi", name: "ميتسوبيشي (روزا)", en: "Mitsubishi Rosa", monogram: "M", color: "#D12640", logo: "mitsubishi", origin: "اليابان", models: [] },
  { id: "nissan", name: "نيسان (سيفيليان)", en: "Nissan Civilian", monogram: "N", color: "#C3002F", logo: "nissan", origin: "اليابان", models: [] },
  { id: "king-long", name: "كينغ لونغ", en: "King Long", monogram: "KL", color: "#C8102E", origin: "الصين", models: [] },
  { id: "golden-dragon", name: "جولدن دراجون", en: "Golden Dragon", monogram: "GD", color: "#D32F2F", origin: "الصين", models: [] },
  { id: "foton", name: "فوتون", en: "Foton", monogram: "FT", color: "#005BAA", origin: "الصين", models: [] },
  { id: "jac", name: "جاك", en: "JAC", monogram: "JAC", color: "#E53935", origin: "الصين", models: [] },
  OTHER_VEHICLE_BRAND,
];

/* ---------------- 10) باص ---------------- */
export const BUS_BRANDS: Brand[] = [
  { id: "mercedes", name: "مرسيدس (باصات)", en: "Mercedes-Benz", monogram: "M", color: "#000000", logo: "mercedes", origin: "ألمانيا", models: [] },
  { id: "man", name: "مان (ليونز كوتش)", en: "MAN Lions Coach", monogram: "MAN", color: "#002B49", origin: "ألمانيا", models: [] },
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
    default:
      // تأكد أن أخرى موجودة في نهاية القائمة
      return passengerBrands.some((b) => b.id === "other")
        ? passengerBrands
        : [...passengerBrands, OTHER_VEHICLE_BRAND];
  }
}
