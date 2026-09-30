import type { Ad, DealType, MainCategory, PropertyType, VehicleType } from "./types";

/* ==========================================================================
   الفلترة والترتيب والإحصاءات
   ========================================================================== */

export interface Filters {
  q: string;
  category: MainCategory | "all";
  propertyType: PropertyType | "all";
  vehicleType: VehicleType | "all";
  dealType: DealType | "all";
  districtId: string | "all";
  minPriceUsd: number | null; // الفلترة على أساس الدولار (العملة المرجعية)
  maxPriceUsd: number | null;
  featuredOnly: boolean;
  sort: SortKey;
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "views";

export const SORT_OPTIONS: { id: SortKey; name: string }[] = [
  { id: "newest", name: "الأحدث أولاً" },
  { id: "price-asc", name: "الأرخص أولاً" },
  { id: "price-desc", name: "الأغلى أولاً" },
  { id: "views", name: "الأكثر مشاهدة" },
];

export const EMPTY_FILTERS: Filters = {
  q: "",
  category: "all",
  propertyType: "all",
  vehicleType: "all",
  dealType: "all",
  districtId: "all",
  minPriceUsd: null,
  maxPriceUsd: null,
  featuredOnly: false,
  sort: "newest",
};

/** البحث النصي يشمل: العنوان، الوصف، الماركة، الموديل، رقم الإعلان، اسم الحي */
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

export function applyFilters(ads: Ad[], f: Filters, districtLabel: (ad: Ad) => string) {
  let out = ads.filter((ad) => {
    if (f.category !== "all" && ad.category !== f.category) return false;
    if (f.propertyType !== "all" && ad.propertyType !== f.propertyType) return false;
    if (f.vehicleType !== "all" && ad.vehicleType !== f.vehicleType) return false;
    if (f.dealType !== "all" && ad.dealType !== f.dealType) return false;
    if (f.districtId !== "all" && ad.districtId !== f.districtId) return false;
    if (f.featuredOnly && !ad.featured) return false;
    if (f.minPriceUsd != null && ad.priceUsd < f.minPriceUsd) return false;
    if (f.maxPriceUsd != null && ad.priceUsd > f.maxPriceUsd) return false;
    if (!matchesQuery(ad, f.q, districtLabel(ad))) return false;
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
      default:
        return (
          new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime()
        );
    }
  });

  return out;
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
  topDistricts: { id: string; name: string; count: number }[];
  byDay: { label: string; count: number }[];
}

export function computeStats(ads: Ad[], districtName: (ad: Ad) => string): AdminStats {
  const byCategoryMap = new Map<string, number>();
  const byDistrictMap = new Map<string, number>();
  ads.forEach((a) => {
    byCategoryMap.set(a.category, (byCategoryMap.get(a.category) ?? 0) + 1);
    const d = districtName(a);
    byDistrictMap.set(d, (byDistrictMap.get(d) ?? 0) + 1);
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
    byCategory: [
      { id: "real-estate" as MainCategory, name: "عقارات", count: byCategoryMap.get("real-estate") ?? 0 },
      { id: "vehicles" as MainCategory, name: "سيارات ومركبات", count: byCategoryMap.get("vehicles") ?? 0 },
    ],
    topDistricts: [...byDistrictMap.entries()]
      .map(([name, count]) => ({ id: name, name, count }))
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
