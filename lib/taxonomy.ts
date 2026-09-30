import type {
  Ad,
  AreaUnit,
  BodyCondition,
  Currency,
  DealType,
  FuelType,
  MainCategory,
  OwnershipType,
  PlateRegion,
  PropertyType,
  VehicleType,
} from "./types";

/* ==========================================================================
   مكتبة التصنيفات والخيارات — كل التسميات بالعربية.
   بنية قابلة للتوسّع: إضافة أنواع جديدة = إضافة عنصر واحد فقط هنا.
   ========================================================================== */

export const MAIN_CATEGORIES: {
  id: MainCategory;
  name: string;
  icon: string; // اسم أيقونة lucide
  color: string;
  tagline: string;
}[] = [
  {
    id: "real-estate",
    name: "عقارات",
    icon: "Building2",
    color: "emerald",
    tagline: "شقق، منازل عربية، أراضٍ، محلات ومستودعات",
  },
  {
    id: "vehicles",
    name: "سيارات ومركبات",
    icon: "Car",
    color: "amber",
    tagline: "سيارات، شاحنات، دراجات وآليات ثقيلة",
  },
];

export const PROPERTY_TYPES: { id: PropertyType; name: string; icon: string }[] = [
  { id: "apartment", name: "شقة سكنية", icon: "Building" },
  { id: "house", name: "منزل عربي", icon: "Home" },
  { id: "land-building", name: "أرض بناء", icon: "LandPlot" },
  { id: "land-agricultural", name: "أرض زراعية", icon: "Trees" },
  { id: "shop", name: "محل تجاري", icon: "Store" },
  { id: "warehouse", name: "مستودع", icon: "Warehouse" },
];

export const DEAL_TYPES: { id: DealType; name: string; hint: string }[] = [
  { id: "sale", name: "بيع", hint: "سعر نهائي أو قابل للتفاوض" },
  { id: "rent-monthly", name: "إيجار شهري", hint: "السعر مطلوب عن كل شهر" },
  { id: "rent-yearly", name: "إيجار سنوي", hint: "السعر مطلوب عن السنة كاملة" },
];

export const AREA_UNITS: { id: AreaUnit; name: string }[] = [
  { id: "m2", name: "متر مربع (م²)" },
  { id: "donum", name: "دونم" },
];

export const OWNERSHIP_TYPES: { id: OwnershipType; name: string; hint?: string }[] = [
  { id: "tabu-green", name: "طابو أخضر", hint: "سند ملكية نظامي" },
  { id: "court-ruling", name: "حكم محكمة", hint: "مع صك / قرار حكم" },
  { id: "real-estate-agency", name: "وكالة عقارية", hint: "بيع بالوكالة" },
  { id: "arqari-siyaq", name: "عرقاري - سياق", hint: "قيود وسجلات قديمة" },
];

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
];

export const PLATE_REGIONS: { id: PlateRegion; name: string }[] = [
  { id: "manbij", name: "نمرة منبج" },
  { id: "aleppo", name: "نمرة حلب" },
  { id: "idlib", name: "نمرة إدلب" },
  { id: "unregistered-european", name: "غير مجمرك / أوروبي" },
];

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

export const dealTypeName = (id?: DealType) =>
  DEAL_TYPES.find((t) => t.id === id)?.name ?? "";

export const ownershipName = (id?: OwnershipType) =>
  OWNERSHIP_TYPES.find((t) => t.id === id)?.name ?? "—";

export const bodyConditionName = (id?: BodyCondition) =>
  BODY_CONDITIONS.find((t) => t.id === id)?.name ?? "—";

export const fuelTypeName = (id?: FuelType) =>
  FUEL_TYPES.find((t) => t.id === id)?.name ?? "—";

export const plateRegionName = (id?: PlateRegion) =>
  PLATE_REGIONS.find((t) => t.id === id)?.name ?? "—";

export const areaUnitName = (id?: AreaUnit) =>
  AREA_UNITS.find((t) => t.id === id)?.name ?? "م²";

/** أنواع العقارات التي تقبل وحدة "دونم" */
export const DONUM_TYPES: PropertyType[] = ["land-agricultural", "land-building"];

/** أنواع المركبات التي تحتاج سنة صنع إلزامية */
export const YEAR_REQUIRED: VehicleType[] = ["passenger", "truck", "machinery"];
