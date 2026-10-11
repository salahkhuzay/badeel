import type {
  Ad,
  DealType,
  DistrictKind,
  EmploymentType,
  ItemCondition,
  ListingKind,
  MainCategory,
  PlateRegion,
  PropertyType,
  VehicleType,
} from "./types";
import { MAIN_CATEGORIES } from "./taxonomy";
import { guessDistrictKind } from "./geo";

/* ==========================================================================
   الفلترة والترتيب والتجميع والإحصاءات
   ========================================================================== */

export interface DistrictInfo {
  name: string;
  kind: DistrictKind;
}

export interface Filters {
  q: string;
  category: MainCategory | "all";
  propertyType: PropertyType | "all";
  vehicleType: VehicleType | "all";
  dealType: DealType | "all";
  districtId: string | "all";
  districtKind: DistrictKind | "all";
  /* المركبات */
  brandId: string | "all";
  modelId: string | "all";
  yearFrom: number | null;
  yearTo: number | null;
  plateRegion: PlateRegion | "all";
  /* التصنيفات الفرعية (أثاث/أجهزة/ملابس/وظائف) */
  subtype: string | "all";
  condition: ItemCondition | "all";
  jobKind: ListingKind | "all";
  employmentType: EmploymentType | "all";
  minPriceUsd: number | null; // الفلترة على أساس الدولار (العملة المرجعية)
  maxPriceUsd: number | null;
  featuredOnly: boolean;
  sort: SortKey;
}

export type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "views"
  | "district"
  | "year-desc"
  | "year-asc";

export const SORT_OPTIONS: { id: SortKey; name: string }[] = [
  { id: "newest", name: "الأحدث إضافةً" },
  { id: "price-asc", name: "الأرخص أولاً" },
  { id: "price-desc", name: "الأغلى أولاً" },
  { id: "year-desc", name: "الأحدث صنعاً (السنة)" },
  { id: "year-asc", name: "الأقدم صنعاً (السنة)" },
  { id: "views", name: "الأكثر مشاهدة" },
  { id: "district", name: "حسب المنطقة (أبجدي)" },
];

/** خيارات الفرز المتاحة لكل تصنيف */
export const sortOptionsFor = (c: MainCategory | "all") =>
  c === "vehicles"
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((o) => o.id !== "year-desc" && o.id !== "year-asc");

export const EMPTY_FILTERS: Filters = {
  q: "",
  category: "all",
  propertyType: "all",
  vehicleType: "all",
  dealType: "all",
  districtId: "all",
  districtKind: "all",
  brandId: "all",
  modelId: "all",
  yearFrom: null,
  yearTo: null,
  plateRegion: "all",
  subtype: "all",
  condition: "all",
  jobKind: "all",
  employmentType: "all",
  minPriceUsd: null,
  maxPriceUsd: null,
  featuredOnly: false,
  sort: "newest",
};

/** البحث النصي يشمل: العنوان، الوصف، الماركة، الموديل، رقم الإعلان، اسم المنطقة */
export function matchesQuery(ad: Ad, q: string, districtLabel = "") {
  if (!q.trim()) return true;
  const needle = normalizeArabic(q);
  const haystack = normalizeArabic(
    [
      ad.title,
      ad.description,
      ad.ref,
      ad.make ?? "",
      ad.model ?? "",
      ad.sellerName,
      districtLabel,
      String(ad.year ?? ""),
    ].join(" ")
  );
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

/** تطبيع النص العربي: إزالة التشكيل وتوحيد الألف والهمزة والتاء المربوطة */
export function normalizeArabic(input: string) {
  return (input || "")
    .replace(/[\u0617-\u061A\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function applyFilters(
  ads: Ad[],
  f: Filters,
  districtOf: (ad: Ad) => DistrictInfo
) {
  let out = ads.filter((ad) => {
    const info = districtOf(ad);
    if (f.category !== "all" && ad.category !== f.category) return false;
    if (f.propertyType !== "all" && ad.propertyType !== f.propertyType) return false;
    if (f.vehicleType !== "all" && ad.vehicleType !== f.vehicleType) return false;
    if (f.dealType !== "all" && ad.dealType !== f.dealType) return false;
    if (f.districtId !== "all" && ad.districtId !== f.districtId) return false;
    if (f.districtKind !== "all" && info.kind !== f.districtKind) return false;
    if (f.brandId !== "all" && ad.brandId !== f.brandId) return false;
    if (f.modelId !== "all" && ad.modelId !== f.modelId) return false;
    if (f.yearFrom != null && (ad.year ?? 0) < f.yearFrom) return false;
    if (f.yearTo != null && (ad.year ?? 9999) > f.yearTo) return false;
    if (f.plateRegion !== "all" && ad.plateRegion !== f.plateRegion) return false;
    if (f.subtype !== "all" && ad.subtypeId !== f.subtype) return false;
    if (f.condition !== "all" && ad.condition !== f.condition) return false;
    if (f.jobKind !== "all" && ad.jobKind !== f.jobKind) return false;
    if (f.employmentType !== "all" && ad.employmentType !== f.employmentType) return false;
    if (f.featuredOnly && !ad.featured) return false;
    if (f.minPriceUsd != null && ad.priceUsd < f.minPriceUsd) return false;
    if (f.maxPriceUsd != null && ad.priceUsd > f.maxPriceUsd) return false;
    if (!matchesQuery(ad, f.q, info.name)) return false;
    return true;
  });

  out = [...out].sort((a, b) => {
    switch (f.sort) {
      case "price-asc":
        return a.priceUsd - b.priceUsd;
      case "price-desc":
        return b.priceUsd - a.priceUsd;
      case "views":
        return b.views - a.views;
      case "year-desc":
        return (b.year ?? 0) - (a.year ?? 0);
      case "year-asc":
        return (a.year ?? 9999) - (b.year ?? 9999);
      case "district": {
        const da = districtOf(a).name;
        const db = districtOf(b).name;
        return (
          da.localeCompare(db, "ar") ||
          new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime()
        );
      }
      default:
        return (
          new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime()
        );
    }
  });

  return out;
}

/** تجميع الإعلانات تحت عناوين المناطق (أحياء / قرى / مناطق) */
export function groupByDistrict(ads: Ad[], districtOf: (ad: Ad) => DistrictInfo) {
  const map = new Map<string, { info: DistrictInfo; ads: Ad[] }>();
  ads.forEach((ad) => {
    const info = districtOf(ad);
    const key = `${info.kind}::${info.name}`;
    const prev = map.get(key);
    if (prev) prev.ads.push(ad);
    else map.set(key, { info, ads: [ad] });
  });
  return [...map.values()].sort((a, b) => a.info.name.localeCompare(b.info.name, "ar"));
}

/* ------------------------------ الإحصاءات ------------------------------ */

export interface AdminStats {
  total: number;
  pending: number;
  active: number;
  soldOrRented: number;
  rejected: number;
  featured: number;
  totalViews: number;
  byCategory: { id: MainCategory; name: string; count: number }[];
  byDistrictKind: { id: DistrictKind; name: string; count: number }[];
  topDistricts: { id: string; name: string; count: number; kind: DistrictKind }[];
  byDay: { label: string; count: number }[];
}

export function computeStats(
  ads: Ad[],
  districtOf: (ad: Ad) => DistrictInfo
): AdminStats {
  const byCategoryMap = new Map<string, number>();
  const byDistrictMap = new Map<string, { name: string; kind: DistrictKind; count: number }>();
  const byKind = { neighborhood: 0, village: 0, area: 0 } as Record<DistrictKind, number>;

  ads.forEach((a) => {
    byCategoryMap.set(a.category, (byCategoryMap.get(a.category) ?? 0) + 1);
    const info = districtOf(a);
    byKind[info.kind] = (byKind[info.kind] ?? 0) + 1;
    const key = `${info.kind}::${info.name}`;
    const prev = byDistrictMap.get(key);
    if (prev) prev.count += 1;
    else byDistrictMap.set(key, { name: info.name, kind: info.kind, count: 1 });
  });

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const label = new Intl.DateTimeFormat("ar-SY", { weekday: "short" }).format(d);
    const key = d.toISOString().slice(0, 10);
    const count = ads.filter((a) => (a.createdAt || "").slice(0, 10) === key).length;
    return { label, count };
  });

  return {
    total: ads.length,
    pending: ads.filter((a) => a.status === "pending").length,
    active: ads.filter((a) => a.status === "active").length,
    soldOrRented: ads.filter((a) => a.status === "sold" || a.status === "rented").length,
    rejected: ads.filter((a) => a.status === "rejected").length,
    featured: ads.filter((a) => a.featured).length,
    totalViews: ads.reduce((s, a) => s + a.views, 0),
    byCategory: MAIN_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      count: byCategoryMap.get(c.id) ?? 0,
    })),
    byDistrictKind: [
      { id: "neighborhood" as DistrictKind, name: "أحياء", count: byKind.neighborhood },
      { id: "village" as DistrictKind, name: "قرى", count: byKind.village },
      { id: "area" as DistrictKind, name: "مناطق وريف", count: byKind.area },
    ],
    topDistricts: [...byDistrictMap.values()]
      .map((d) => ({ id: d.name, name: d.name, count: d.count, kind: d.kind }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    byDay: days,
  };
}

/** عدّاد الإعلانات لكل خيار تصنيف — لعرضه قرب الفلاتر */
export function countBy<T extends string>(ads: Ad[], key: (ad: Ad) => T | undefined) {
  const map = new Map<T, number>();
  ads.forEach((a) => {
    const k = key(a);
    if (!k) return;
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return map;
}

/** نوع المنطقة المتوقع لاسم مكتوب يدوياً (لاستخدامه في الواجهات) */
export const kindOfName = (name: string) => guessDistrictKind(name);
