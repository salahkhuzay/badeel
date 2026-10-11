/* ==========================================================================
   ماركات السيارات وموديلاتها — بديل | Badeel
   الأيقونات: شعارات نصية (Monogram) بألوان كل ماركة بدل ملفات الشعارات
   الرسمية المحميّة بحقوق تجارية — أوضح وأخف وأسرع على الاتصال الضعيف.
   ========================================================================== */

export interface BrandModel {
  id: string;
  name: string; // بالعربية كما يكتبها الناس
  en?: string;
}

export interface Brand {
  id: string;
  name: string; // بالعربية
  en: string;
  monogram: string; // الحروف على الأيقونة
  color: string; // لون العلامة (خلفية الأيقونة)
  text?: string; // لون النص فوق الأيقونة (افتراضياً أبيض)
  origin: string; // بلد المنشأ (للاستخدام في الوصف)
  alt?: string[]; // مرادفات البحث (كتابات شائعة أخرى)
  models: BrandModel[];
}

export const BRANDS: Brand[] = [
  {
    id: "hyundai",
    name: "هيونداي",
    en: "Hyundai",
    monogram: "H",
    color: "#002C5F",
    origin: "كوريا الجنوبية",
    models: [
      { id: "santa-fe", name: "سنتافي", en: "Santa Fe" },
      { id: "palisade", name: "باليسيد", en: "Palisade" },
      { id: "azera", name: "أزيرا", en: "Azera" },
      { id: "accent", name: "إكسنت", en: "Accent" },
      { id: "avante", name: "أفانتي", en: "Avante" },
      { id: "elantra", name: "إلنترا", en: "Elantra" },
      { id: "sonata", name: "سوناتا", en: "Sonata" },
      { id: "tucson", name: "توسان", en: "Tucson" },
      { id: "creta", name: "كريتا", en: "Creta" },
      { id: "kona", name: "كونا", en: "Kona" },
      { id: "i10", name: "i10", en: "i10" },
      { id: "i20", name: "i20", en: "i20" },
      { id: "i30", name: "i30", en: "i30" },
      { id: "h1", name: "H1 فان", en: "H-1" },
      { id: "hd65", name: "شاحنة HD65", en: "HD65" },
      { id: "hd72", name: "شاحنة HD72", en: "HD72" },
      { id: "veloster", name: "فيلوستر", en: "Veloster" },
    ],
  },
  {
    id: "kia",
    name: "كيا",
    en: "Kia",
    monogram: "K",
    color: "#05141F",
    origin: "كوريا الجنوبية",
    models: [
      { id: "cerato", name: "سيراتو", en: "Cerato" },
      { id: "rio", name: "ريو", en: "Rio" },
      { id: "sportage", name: "سبورتاج", en: "Sportage" },
      { id: "sorento", name: "سورينتو", en: "Sorento" },
      { id: "seltos", name: "سيلتوس", en: "Seltos" },
      { id: "carnival", name: "كارنيفال", en: "Carnival" },
      { id: "optima", name: "أوبتيما", en: "Optima" },
      { id: "k3", name: "K3", en: "K3" },
      { id: "k5", name: "K5", en: "K5" },
      { id: "k7", name: "K7", en: "K7" },
      { id: "mohave", name: "موهافي", en: "Mohave" },
      { id: "picanto", name: "بيكانتو", en: "Picanto" },
      { id: "soul", name: "سول", en: "Soul" },
      { id: "carrens", name: "كارينز", en: "Carens" },
      { id: "bongo", name: "شاحنة بونغو", en: "Bongo" },
    ],
  },
  {
    id: "toyota",
    name: "تويوتا",
    en: "Toyota",
    monogram: "T",
    color: "#EB0A1E",
    origin: "اليابان",
    models: [
      { id: "corolla", name: "كورولا", en: "Corolla" },
      { id: "camry", name: "كامري", en: "Camry" },
      { id: "yaris", name: "ياريس", en: "Yaris" },
      { id: "hilux", name: "هايلوكس", en: "Hilux" },
      { id: "land-cruiser", name: "لاند كروزر", en: "Land Cruiser" },
      { id: "rav4", name: "راف 4", en: "RAV4" },
      { id: "prado", name: "برادو", en: "Prado" },
      { id: "avalon", name: "أفالون", en: "Avalon" },
      { id: "hais", name: "هايس", en: "HiAce" },
      { id: "innova", name: "إنوفا", en: "Innova" },
      { id: "fortuner", name: "فورتشنر", en: "Fortuner" },
      { id: "echo", name: "إيكو", en: "Echo" },
    ],
  },
  {
    id: "mercedes",
    name: "مارسيدس",
    alt: ["مرسيدس", "بنز", "مرسيدس بنز"],
    en: "Mercedes-Benz",
    monogram: "★",
    color: "#1B1B1B",
    origin: "ألمانيا",
    models: [
      { id: "s-class", name: "الفئة S", en: "S-Class" },
      { id: "e-class", name: "الفئة E", en: "E-Class" },
      { id: "c-class", name: "الفئة C", en: "C-Class" },
      { id: "gle", name: "GLE", en: "GLE" },
      { id: "glc", name: "GLC", en: "GLC" },
      { id: "g-class", name: "الفئة G", en: "G-Class" },
      { id: "cla", name: "CLA", en: "CLA" },
      { id: "ml", name: "ML", en: "ML" },
      { id: "sprinter", name: "سبرينتر", en: "Sprinter" },
      { id: "viano", name: "فيانو", en: "Viano" },
      { id: "190", name: "190", en: "190" },
      { id: "e200", name: "E200", en: "E200" },
      { id: "c200", name: "C200", en: "C200" },
    ],
  },
  {
    id: "mitsubishi",
    name: "ميتسوبيشي",
    alt: ["متسوبيشي"],
    en: "Mitsubishi",
    monogram: "M",
    color: "#E60012",
    origin: "اليابان",
    models: [
      { id: "lancer", name: "لانسر", en: "Lancer" },
      { id: "pajero", name: "باجيرو", en: "Pajero" },
      { id: "l200", name: "L200", en: "L200" },
      { id: "attrage", name: "أتراج", en: "Attrage" },
      { id: "eclipse", name: "إكليبس", en: "Eclipse" },
      { id: "montero", name: "مونتيرو", en: "Montero" },
      { id: "galant", name: "جالانت", en: "Galant" },
      { id: "canter", name: "شاحنة كانتر", en: "Canter" },
    ],
  },
  {
    id: "jeep",
    name: "جيب",
    en: "Jeep",
    monogram: "J",
    color: "#3B4A3F",
    origin: "أمريكا",
    models: [
      { id: "wrangler", name: "رانجلر", en: "Wrangler" },
      { id: "cherokee", name: "شيروكي", en: "Cherokee" },
      { id: "grand-cherokee", name: "جراند شيروكي", en: "Grand Cherokee" },
      { id: "compass", name: "كومباس", en: "Compass" },
      { id: "renegade", name: "رينيغيد", en: "Renegade" },
      { id: "liberty", name: "ليبرتي", en: "Liberty" },
      { id: "gladiator", name: "غلادياتور", en: "Gladiator" },
    ],
  },
  {
    id: "land-rover",
    name: "لاندروفر",
    alt: ["لاند روفر"],
    en: "Land Rover",
    monogram: "LR",
    color: "#005A2B",
    origin: "بريطانيا",
    models: [
      { id: "defender", name: "ديفندر", en: "Defender" },
      { id: "discovery", name: "ديسكفري", en: "Discovery" },
      { id: "discovery-sport", name: "ديسكفري سبورت", en: "Discovery Sport" },
      { id: "freelander", name: "فريلاندر", en: "Freelander" },
      { id: "evoque", name: "إيفوك", en: "Evoque" },
      { id: "velar", name: "فيلار", en: "Velar" },
      { id: "range-rover", name: "رنج روفر", en: "Range Rover" },
    ],
  },
  {
    id: "range-rover",
    name: "رنج روفر",
    en: "Range Rover",
    monogram: "RR",
    color: "#0B0B0B",
    origin: "بريطانيا",
    models: [
      { id: "vogue", name: "فوج", en: "Vogue" },
      { id: "rr-sport", name: "رنج روفر سبورت", en: "Sport" },
      { id: "rr-velar", name: "رنج روفر فيلار", en: "Velar" },
      { id: "rr-evoque", name: "رنج روفر إيفوك", en: "Evoque" },
      { id: "autobiography", name: "أوتوبيوغرافي", en: "Autobiography" },
      { id: "svr", name: "SVR", en: "SVR" },
      { id: "long", name: "لونغ ويلبيس", en: "Long Wheelbase" },
    ],
  },
  {
    id: "bmw",
    name: "بي إم دبليو",
    alt: ["BMW", "بي ام دبليو"],
    en: "BMW",
    monogram: "B",
    color: "#1C69D4",
    origin: "ألمانيا",
    models: [
      { id: "series-3", name: "الفئة الثالثة", en: "3 Series" },
      { id: "series-5", name: "الفئة الخامسة", en: "5 Series" },
      { id: "series-7", name: "الفئة السابعة", en: "7 Series" },
      { id: "x1", name: "X1", en: "X1" },
      { id: "x3", name: "X3", en: "X3" },
      { id: "x5", name: "X5", en: "X5" },
      { id: "x6", name: "X6", en: "X6" },
      { id: "318", name: "318", en: "318" },
      { id: "520", name: "520", en: "520" },
      { id: "730", name: "730", en: "730" },
      { id: "m3", name: "M3", en: "M3" },
    ],
  },
  {
    id: "audi",
    name: "أودي",
    en: "Audi",
    monogram: "A",
    color: "#BB0A30",
    origin: "ألمانيا",
    models: [
      { id: "a3", name: "A3", en: "A3" },
      { id: "a4", name: "A4", en: "A4" },
      { id: "a6", name: "A6", en: "A6" },
      { id: "a8", name: "A8", en: "A8" },
      { id: "q3", name: "Q3", en: "Q3" },
      { id: "q5", name: "Q5", en: "Q5" },
      { id: "q7", name: "Q7", en: "Q7" },
      { id: "tt", name: "TT", en: "TT" },
      { id: "rs", name: "RS", en: "RS" },
    ],
  },
  {
    id: "volkswagen",
    name: "فولكس فاغن",
    alt: ["فولكسواجن", "فولكس"],
    en: "Volkswagen",
    monogram: "VW",
    color: "#001E50",
    origin: "ألمانيا",
    models: [
      { id: "passat", name: "باسات", en: "Passat" },
      { id: "golf", name: "غولف", en: "Golf" },
      { id: "tiguan", name: "تيغوان", en: "Tiguan" },
      { id: "jetta", name: "جيتا", en: "Jetta" },
      { id: "polo", name: "بولو", en: "Polo" },
      { id: "touran", name: "توران", en: "Touran" },
      { id: "touareg", name: "توارق", en: "Touareg" },
      { id: "beetle", name: "بيتل", en: "Beetle" },
      { id: "caddy", name: "كادي", en: "Caddy" },
    ],
  },
  {
    id: "mazda",
    name: "مازدا",
    en: "Mazda",
    monogram: "M",
    color: "#910A2D",
    origin: "اليابان",
    models: [
      { id: "mazda-3", name: "مازدا 3", en: "Mazda 3" },
      { id: "mazda-6", name: "مازدا 6", en: "Mazda 6" },
      { id: "cx-5", name: "CX-5", en: "CX-5" },
      { id: "cx-9", name: "CX-9", en: "CX-9" },
      { id: "mx-5", name: "MX-5", en: "MX-5" },
      { id: "bt-50", name: "شاحنة BT-50", en: "BT-50" },
      { id: "323", name: "323", en: "323" },
      { id: "626", name: "626", en: "626" },
    ],
  },
  {
    id: "nissan",
    name: "نيسان",
    en: "Nissan",
    monogram: "N",
    color: "#C3002F",
    origin: "اليابان",
    models: [
      { id: "sunny", name: "صني", en: "Sunny" },
      { id: "altima", name: "التيما", en: "Altima" },
      { id: "patrol", name: "باترول", en: "Patrol" },
      { id: "navara", name: "نافارا", en: "Navara" },
      { id: "x-trail", name: "إكس تريل", en: "X-Trail" },
      { id: "qashqai", name: "قشقاي", en: "Qashqai" },
      { id: "maxima", name: "ماكسيما", en: "Maxima" },
      { id: "tiida", name: "تيدا", en: "Tiida" },
      { id: "sentra", name: "سنترا", en: "Sentra" },
      { id: "urvan", name: "أورفان (فان)", en: "Urvan" },
    ],
  },
  {
    id: "skoda",
    name: "سكودا",
    en: "Škoda",
    monogram: "S",
    color: "#0E3A2F",
    origin: "التشيك",
    models: [
      { id: "octavia", name: "أوكتافيا", en: "Octavia" },
      { id: "superb", name: "سوبيرب", en: "Superb" },
      { id: "kodiaq", name: "كودياك", en: "Kodiaq" },
      { id: "fabia", name: "فابيا", en: "Fabia" },
      { id: "rapid", name: "رابيد", en: "Rapid" },
      { id: "scala", name: "سكالا", en: "Scala" },
      { id: "karok", name: "كاروك", en: "Karoq" },
    ],
  },
  {
    id: "sham",
    name: "شام",
    en: "Sham",
    monogram: "ش",
    color: "#0F172A",
    origin: "سوريا",
    models: [
      { id: "sham-1", name: "شام 1", en: "Sham 1" },
      { id: "sham-2", name: "شام 2", en: "Sham 2" },
      { id: "sham-3", name: "شام 3", en: "Sham 3" },
      { id: "sham-pickup", name: "شام بيك أب", en: "Sham Pickup" },
      { id: "sham-van", name: "شام فان", en: "Sham Van" },
    ],
  },
  {
    id: "peugeot",
    name: "بيجو",
    en: "Peugeot",
    monogram: "P",
    color: "#002F6C",
    origin: "فرنسا",
    models: [
      { id: "301", name: "301", en: "301" },
      { id: "206", name: "206", en: "206" },
      { id: "207", name: "207", en: "207" },
      { id: "307", name: "307", en: "307" },
      { id: "308", name: "308", en: "308" },
      { id: "405", name: "405", en: "405" },
      { id: "508", name: "508", en: "508" },
      { id: "2008", name: "2008", en: "2008" },
      { id: "3008", name: "3008", en: "3008" },
      { id: "5008", name: "5008", en: "5008" },
      { id: "partner", name: "شاحنة بارتنر", en: "Partner" },
    ],
  },
  {
    id: "renault",
    name: "رينو",
    en: "Renault",
    monogram: "R",
    color: "#111111",
    origin: "فرنسا",
    models: [
      { id: "clio", name: "كليو", en: "Clio" },
      { id: "megane", name: "ميغان", en: "Megane" },
      { id: "duster", name: "داستر", en: "Duster" },
      { id: "kangoo", name: "كانغو", en: "Kangoo" },
      { id: "logan", name: "لوجان", en: "Logan" },
      { id: "symbol", name: "سيمبول", en: "Symbol" },
      { id: "fluence", name: "فلوانس", en: "Fluence" },
      { id: "master", name: "شاحنة ماستر", en: "Master" },
      { id: "captur", name: "كابتور", en: "Captur" },
    ],
  },
  {
    id: "honda",
    name: "هوندا",
    en: "Honda",
    monogram: "H",
    color: "#CC0000",
    origin: "اليابان",
    models: [
      { id: "cb150", name: "دراجة CB 150", en: "CB 150" },
      { id: "civic", name: "سيفيك", en: "Civic" },
      { id: "accord", name: "أكورد", en: "Accord" },
      { id: "crv", name: "CR-V", en: "CR-V" },
      { id: "motorcycle-other", name: "دراجة أخرى", en: "Other" },
    ],
  },
];

/** ماركة غير مذكورة — كتابة يدوية */
export const OTHER_BRAND: Brand = {
  id: "other",
  name: "ماركة أخرى",
  en: "Other",
  monogram: "+",
  color: "#64748B",
  origin: "—",
  models: [],
};

export const ALL_BRANDS: Brand[] = [...BRANDS, OTHER_BRAND];

export const brandById = (id?: string) => ALL_BRANDS.find((b) => b.id === id);
export const brandName = (id?: string) => brandById(id)?.name ?? "";
export const brandModels = (id?: string) => brandById(id)?.models ?? [];
export const modelName = (brandId?: string, modelId?: string) =>
  brandModels(brandId).find((m) => m.id === modelId)?.name ?? "";

/** سنوات الصنع المتاحة للاختيار (من الأحدث للأقدم) */
export const VEHICLE_YEARS: number[] = Array.from(
  { length: 2026 - 1975 + 1 },
  (_, i) => 2026 - i
);

/** مجموعات سنوات سريعة للفرز */
export const YEAR_RANGES: { id: string; name: string; from: number; to: number }[] = [
  { id: "y-2020+", name: "2020 وأحدث", from: 2020, to: 2026 },
  { id: "y-2015-2019", name: "2015 - 2019", from: 2015, to: 2019 },
  { id: "y-2010-2014", name: "2010 - 2014", from: 2010, to: 2014 },
  { id: "y-2005-2009", name: "2005 - 2009", from: 2005, to: 2009 },
  { id: "y--2004", name: "2004 وأقدم", from: 1950, to: 2004 },
];

/** مطابقة ماركة مع نص البحث (الاسم أو الاسم الإنجليزي أو المرادفات) */
export const brandMatches = (brand: Brand, query: string) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  const haystack = [brand.name, brand.en, ...(brand.alt ?? [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};
