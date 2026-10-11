import type {
  Ad,
  BodyCondition,
  Currency,
  DealType,
  EmploymentType,
  FuelType,
  ItemCondition,
  ListingKind,
  MainCategory,
  OwnershipType,
  PlateRegion,
  PropertyType,
  VehicleType,
} from "./types";

/* ==========================================================================
   مكتبة التصنيفات والخيارات — بديل | Badeel
   كل التسميات بالعربية، والبنية قابلة للتوسّع بإضافة عنصر واحد فقط.
   ========================================================================== */

export const MAIN_CATEGORIES: {
  id: MainCategory;
  name: string;
  icon: string; // اسم أيقونة lucide
  tagline: string;
  accent: "emerald" | "amber" | "rose" | "sky" | "violet" | "navy";
}[] = [
  {
    id: "real-estate",
    name: "عقارات",
    icon: "Building2",
    tagline: "شقق، منازل عربية، أراضٍ، محلات ومستودعات — للبيع والإيجار",
    accent: "emerald",
  },
  {
    id: "vehicles",
    name: "سيارات ومركبات",
    icon: "Car",
    tagline: "سيارات بالماركة والموديل وسنة الصنع، شاحنات، دراجات وآليات — للبيع والإيجار",
    accent: "amber",
  },
  {
    id: "furniture",
    name: "أثاث منزلي",
    icon: "Sofa",
    tagline: "غرف نوم، كنبات، طاولات، خزائن وأطقم مطبخ",
    accent: "rose",
  },
  {
    id: "appliances",
    name: "أدوات كهربائية",
    icon: "Plug",
    tagline: "ثلاجات، غسالات، مكيفات، تلفزيونات ومولّدات",
    accent: "sky",
  },
  {
    id: "clothing",
    name: "ملابس وأزياء",
    icon: "Shirt",
    tagline: "ملابس رجالية ونسائية وأطفال، أحذية وحقائب وإكسسوارات",
    accent: "violet",
  },
  {
    id: "jobs",
    name: "وظائف",
    icon: "Briefcase",
    tagline: "عرض وظائف وطلب عمل — دوام كامل، جزئي، مؤقت أو باليومية",
    accent: "navy",
  },
];

export const categoryName = (id: MainCategory) =>
  MAIN_CATEGORIES.find((c) => c.id === id)?.name ?? "";

/** التصنيفات التي تقبل الإيجار/التأجير */
export const RENTABLE: MainCategory[] = ["real-estate", "vehicles"];

/* ------------------------------ العقارات ------------------------------ */
export const PROPERTY_TYPES: { id: PropertyType; name: string; icon: string }[] = [
  { id: "apartment", name: "شقة سكنية", icon: "Building" },
  { id: "house", name: "منزل عربي", icon: "Home" },
  { id: "land-building", name: "أرض بناء", icon: "LandPlot" },
  { id: "land-agricultural", name: "أرض زراعية", icon: "Trees" },
  { id: "shop", name: "محل تجاري", icon: "Store" },
  { id: "warehouse", name: "مستودع", icon: "Warehouse" },
];

/* ------------------------------ المركبات ------------------------------ */
export const VEHICLE_TYPES: { id: VehicleType; name: string; icon: string }[] = [
  { id: "passenger", name: "سيارة سياحية", icon: "CarFront" },
  { id: "truck", name: "شاحنة / بيك أب", icon: "Truck" },
  { id: "motorcycle", name: "دراجة نارية", icon: "Bike" },
  { id: "machinery", name: "آليات ثقيلة / جرار زراعي", icon: "Tractor" },
];

export const BODY_CONDITIONS: { id: BodyCondition; name: string }[] = [
  { id: "original", name: "خالية العلام أورجينال" },
  { id: "partial-damage", name: "قص وبخ جزئي" },
  { id: "needs-service", name: "تحتاج صيانة" },
];

export const FUEL_TYPES: { id: FuelType; name: string }[] = [
  { id: "petrol", name: "بنزين" },
  { id: "diesel", name: "مازوت" },
  { id: "electric", name: "كهرباء" },
  { id: "hybrid", name: "هايبرد" },
];

/* --------------------- نمر السيارات (القائمة المحدثة) --------------------- */
export const PLATE_REGIONS: { id: PlateRegion; name: string; hint?: string }[] = [
  { id: "registered", name: "مجمرك", hint: "نمرة نظامية جاهزة للفراغ" },
  { id: "new-import", name: "إدخال جديد", hint: "سيارة حديثة الإدخال" },
  { id: "idlib", name: "نمرة إدلب" },
  { id: "north", name: "نمرة الشمال" },
  { id: "democratic", name: "نمرة الديمقراطي" },
  { id: "regime", name: "نمرة النظام" },
];

/* --------------------------- أنواع فرعية بحسب التصنيف --------------------------- */
export const SUBTYPES: Record<MainCategory, { id: string; name: string }[]> = {
  "real-estate": [], // يُستخدم PROPERTY_TYPES
  vehicles: [], // يُستخدم VEHICLE_TYPES
  furniture: [
    { id: "bedroom", name: "غرفة نوم" },
    { id: "living", name: "غرفة جلوس" },
    { id: "sofa", name: "كنبات / جلسات" },
    { id: "dining", name: "طاولات وكراسي" },
    { id: "kitchen-set", name: "طقم مطبخ" },
    { id: "wardrobe", name: "خزائن ودواليب" },
    { id: "kids", name: "أثاث أطفال" },
    { id: "decor", name: "ديكور ومفروشات" },
    { id: "office", name: "أثاث مكتبي" },
    { id: "other-furniture", name: "أثاث آخر" },
  ],
  appliances: [
    { id: "fridge", name: "ثلاجة / فريزر" },
    { id: "washer", name: "غسالة" },
    { id: "ac", name: "مكيف / سبليت" },
    { id: "tv", name: "تلفزيون / شاشة" },
    { id: "oven", name: "فرن / ميكروويف" },
    { id: "heater", name: "سخان / مدفأة" },
    { id: "generator", name: "مولّد كهرباء / موتور" },
    { id: "fan", name: "مراوح وشفاطات" },
    { id: "small-appliance", name: "أدوات مطبخ كهربائية" },
    { id: "other-appliance", name: "أجهزة أخرى" },
  ],
  clothing: [
    { id: "men", name: "ملابس رجالية" },
    { id: "women", name: "ملابس نسائية" },
    { id: "kids-clothes", name: "ملابس أطفال" },
    { id: "wedding", name: "فساتين أعراس ومناسبات" },
    { id: "shoes", name: "أحذية" },
    { id: "bags", name: "حقائب" },
    { id: "perfume", name: "عطور ومستحضرات" },
    { id: "accessories", name: "ساعات وإكسسوارات" },
    { id: "other-clothing", name: "أخرى" },
  ],
  jobs: [
    { id: "education", name: "تعليم وتدريس" },
    { id: "health", name: "صحة وتمريض" },
    { id: "construction", name: "بناء ومقاولات" },
    { id: "hospitality", name: "مطاعم وضيافة" },
    { id: "transport", name: "نقل وتوصيل" },
    { id: "sales", name: "تجارة ومبيعات" },
    { id: "admin", name: "إدارة ومحاسبة" },
    { id: "it", name: "حاسوب وتصميم" },
    { id: "security", name: "حراسة وأمن" },
    { id: "agriculture", name: "زراعة وثروة حيوانية" },
    { id: "crafts", name: "مهن وحرف (كهرباء، صيانة، خياطة)" },
    { id: "other-job", name: "مجالات أخرى" },
  ],
};

export const subtypeName = (category: MainCategory, id?: string) =>
  SUBTYPES[category].find((s) => s.id === id)?.name ?? "";

/* --------------------------- الحالة (أثاث/أجهزة/ملابس) --------------------------- */
export const CONDITIONS: { id: ItemCondition; name: string; tone: string }[] = [
  { id: "new", name: "جديد بالكامل", tone: "emerald" },
  { id: "like-new", name: "مستعمل بحالة ممتازة", tone: "sky" },
  { id: "good", name: "مستعمل بحالة جيدة", tone: "navy" },
  { id: "needs-repair", name: "يحتاج صيانة", tone: "amber" },
];

export const conditionName = (id?: ItemCondition) =>
  CONDITIONS.find((c) => c.id === id)?.name ?? "";

/* -------------------------------- الوظائف -------------------------------- */
export const JOB_KINDS: { id: ListingKind; name: string; hint: string }[] = [
  { id: "offer", name: "عرض وظيفة", hint: "أبحث عن موظف / عامل" },
  { id: "seek", name: "طلب عمل", hint: "أبحث عن عمل" },
];

export const EMPLOYMENT_TYPES: { id: EmploymentType; name: string }[] = [
  { id: "full-time", name: "دوام كامل" },
  { id: "part-time", name: "دوام جزئي" },
  { id: "temporary", name: "عمل مؤقت / موسمي" },
  { id: "daily", name: "باليومية" },
  { id: "remote", name: "عن بُعد" },
];

export const employmentName = (id?: EmploymentType) =>
  EMPLOYMENT_TYPES.find((e) => e.id === id)?.name ?? "";

export const jobKindName = (id?: ListingKind) =>
  JOB_KINDS.find((k) => k.id === id)?.name ?? "";

/* -------------------------------- العقارات -------------------------------- */
export const OWNERSHIP_TYPES: { id: OwnershipType; name: string; hint?: string }[] = [
  { id: "tabu-green", name: "طابو أخضر", hint: "سند ملكية نظامي" },
  { id: "court-ruling", name: "حكم محكمة", hint: "مع صك / قرار حكم" },
  { id: "real-estate-agency", name: "وكالة عقارية", hint: "بيع بالوكالة" },
  { id: "arqari-siyaq", name: "عرقاري - سياق", hint: "قيود وسجلات قديمة" },
];

export const AREA_UNITS = [
  { id: "m2" as const, name: "متر مربع (م²)" },
  { id: "donum" as const, name: "دونم" },
];

/* --------------------------- نوع التعامل حسب التصنيف --------------------------- */
export const DEAL_TYPES: { id: DealType; name: string; hint: string }[] = [
  { id: "sale", name: "بيع", hint: "سعر نهائي أو قابل للتفاوض" },
  { id: "rent-daily", name: "إيجار يومي", hint: "السعر مطلوب عن كل يوم" },
  { id: "rent-monthly", name: "إيجار شهري", hint: "السعر مطلوب عن كل شهر" },
  { id: "rent-yearly", name: "إيجار سنوي", hint: "السعر مطلوب عن السنة كاملة" },
];

/** أنواع التعامل المتاحة لكل تصنيف */
export const DEAL_TYPES_BY_CATEGORY: Record<MainCategory, DealType[]> = {
  "real-estate": ["sale", "rent-monthly", "rent-yearly"],
  vehicles: ["sale", "rent-daily", "rent-monthly", "rent-yearly"],
  furniture: ["sale"],
  appliances: ["sale"],
  clothing: ["sale"],
  jobs: ["sale"], // الراتب — يُعرض كقيمة دورية حسب نوع الدوام
};

export const dealTypesFor = (c: MainCategory) =>
  DEAL_TYPES.filter((d) => DEAL_TYPES_BY_CATEGORY[c].includes(d.id));

export const dealTypeName = (id?: DealType) => DEAL_TYPES.find((t) => t.id === id)?.name ?? "";

/** لاحقة السعر حسب نوع التعامل */
export const dealSuffix = (id?: DealType) => {
  switch (id) {
    case "rent-daily":
      return "/ يومياً";
    case "rent-monthly":
      return "/ شهرياً";
    case "rent-yearly":
      return "/ سنوياً";
    default:
      return undefined;
  }
};

/** بادئة السعر للوظائف */
export const isJob = (c: MainCategory) => c === "jobs";

/* ------------------------------ حالة الإعلان ------------------------------ */
export const STATUS_META: Record<
  Ad["status"],
  { name: string; className: string; dot: string }
> = {
  pending: {
    name: "قيد المراجعة",
    className:
      "bg-amberBrand-100 text-amberBrand-700 dark:bg-amberBrand-500/15 dark:text-amberBrand-400",
    dot: "bg-amberBrand-500",
  },
  active: {
    name: "منشور",
    className:
      "bg-emeraldBrand-100 text-emeraldBrand-700 dark:bg-emeraldBrand-500/15 dark:text-emeraldBrand-400",
    dot: "bg-emeraldBrand-500",
  },
  rejected: {
    name: "مرفوض",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  sold: {
    name: "تم البيع",
    className: "bg-navy-100 text-navy-700 dark:bg-navy-700 dark:text-navy-200",
    dot: "bg-navy-600",
  },
  rented: {
    name: "تم التأجير",
    className: "bg-navy-100 text-navy-700 dark:bg-navy-700 dark:text-navy-200",
    dot: "bg-navy-600",
  },
};

export const CURRENCY_LABEL: Record<Currency, { short: string; long: string }> = {
  USD: { short: "$", long: "دولار أمريكي" },
  SYP: { short: "ل.س", long: "ليرة سورية" },
};

/* ------------------------------ أدوات مساعدة ------------------------------ */

export const propertyTypeName = (id?: PropertyType) =>
  PROPERTY_TYPES.find((t) => t.id === id)?.name ?? "عقار";

export const vehicleTypeName = (id?: VehicleType) =>
  VEHICLE_TYPES.find((t) => t.id === id)?.name ?? "مركبة";

export const ownershipName = (id?: OwnershipType) =>
  OWNERSHIP_TYPES.find((t) => t.id === id)?.name ?? "—";

export const bodyConditionName = (id?: BodyCondition) =>
  BODY_CONDITIONS.find((t) => t.id === id)?.name ?? "—";

export const fuelTypeName = (id?: FuelType) => FUEL_TYPES.find((t) => t.id === id)?.name ?? "—";

export const plateRegionName = (id?: PlateRegion) =>
  PLATE_REGIONS.find((t) => t.id === id)?.name ?? "—";

export const areaUnitName = (id?: "m2" | "donum") =>
  AREA_UNITS.find((t) => t.id === id)?.name ?? "م²";

/** أنواع العقارات التي تقبل وحدة "دونم" */
export const DONUM_TYPES: PropertyType[] = ["land-agricultural", "land-building"];

/** أنواع المركبات التي تحتاج سنة صنع إلزامية */
export const YEAR_REQUIRED: VehicleType[] = ["passenger", "truck", "machinery"];

/** التصنيفات التي تُستخدم فيها الحالة */
export const CONDITION_CATEGORIES: MainCategory[] = ["furniture", "appliances", "clothing"];

/** التصنيفات ذات الأنواع الفرعية العامة */
export const SUBTYPE_CATEGORIES: MainCategory[] = [
  "furniture",
  "appliances",
  "clothing",
  "jobs",
];

/** روابط التصنيفات للقوائم (التذييل/الخرائط) */
export const mainCategoryLinks = () =>
  MAIN_CATEGORIES.map((c) => ({ href: `/category/${c.id}`, label: c.name, id: c.id }));

/** وصف مختصر لكل تصنيف — يُستخدم في الشرائح وبطاقات المعاينة */
export const categoryShort = (c: MainCategory) => {
  switch (c) {
    case "real-estate":
      return "عقار";
    case "vehicles":
      return "مركبة";
    case "furniture":
      return "أثاث";
    case "appliances":
      return "جهاز";
    case "clothing":
      return "ملابس";
    case "jobs":
      return "وظيفة";
  }
};
