"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarDays,
  Car,
  ChevronDown,
  Filter,
  Home,
  Smartphone,
  Loader2,
  Plug,
  RotateCcw,
  Search,
  Shirt,
  SlidersHorizontal,
  Sofa,
  Sparkles,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type {
  DealType,
  EmploymentType,
  ItemCondition,
  ListingKind,
  MainCategory,
  PlateRegion,
  PropertyType,
  VehicleType,
} from "@/lib/types";
import {
  CONDITION_CATEGORIES,
  CONDITIONS,
  DEAL_TYPES,
  CURRENCY_LABEL,
  EMPLOYMENT_TYPES,
  JOB_KINDS,
  MAIN_CATEGORIES,
  PLATE_REGIONS,
  PROPERTY_TYPES,
  SUBTYPES,
  VEHICLE_TYPES,
  categoryName,
  dealTypesFor,
} from "@/lib/taxonomy";
import {
  BRANDS,
  PHONE_BRANDS,
  YEAR_RANGES,
  brandMatches,
  brandModels,
  brandName,
  modelName,
} from "@/lib/brands";
import {
  EMPTY_FILTERS,
  Filters,
  applyFilters,
  sortOptionsFor,
  type SortKey,
} from "@/lib/filters";
import { cn, formatNumber } from "@/lib/currency";
import AdCard from "./AdCard";
import BrandIcon from "./BrandIcon";
import VehicleBodyIcon from "./VehicleBodyIcon";
import { BODY_TYPES, bodyTypeOfAd, type BodyTypeId } from "@/lib/vehicleBodies";
import { FUEL_TYPES } from "@/lib/taxonomy";
import EmptyState from "./EmptyState";

/* ==========================================================================
   متصفّح الإعلانات الموحّد — يدعم التصنيفات الستّة
   لكل تصنيف فلاتره الخاصة: ماركة/موديل/سنة/نمرة للمركبات، أنواع فرعية وحالة
   للأثاث والأجهزة والملابس، عرض/طلب ومجال ودوام للوظائف، وعقاري كالسابق.
   ========================================================================== */

const CATEGORY_ICON: Record<MainCategory, React.ReactNode> = {
  "real-estate": <Home size={13} />,
  vehicles: <Car size={13} />,
  furniture: <Sofa size={13} />,
  appliances: <Plug size={13} />,
  clothing: <Shirt size={13} />,
  phones: <Smartphone size={13} />,
  jobs: <Briefcase size={13} />,
};

export default function ListingsBrowser({
  categoryLock,
  embedded = false,
  pageSize = 12,
}: {
  categoryLock?: MainCategory;
  embedded?: boolean;
  pageSize?: number;
}) {
  const { publicAds, settings, currency, cities } = useStore();

  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    category: categoryLock ?? "all",
  }));
  const [visible, setVisible] = useState(pageSize);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");

  /* قراءة معايير الرابط */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if ([...p.keys()].length === 0) return;
    setFilters((f) => {
      const type = p.get("type");
      return {
        ...f,
        q: p.get("q") ?? f.q,
        category: categoryLock ?? ((p.get("category") as MainCategory) || f.category),
        propertyType: !categoryLock || categoryLock === "real-estate" ? ((type as PropertyType) || f.propertyType) : f.propertyType,
        vehicleType:
          categoryLock === "vehicles" || !categoryLock ? ((type as VehicleType) || f.vehicleType) : f.vehicleType,
        dealType: (p.get("deal") as DealType) || f.dealType,
        brandId: p.get("brand") ?? f.brandId,
        modelId: p.get("model") ?? f.modelId,
        yearFrom: p.get("from") ? Number(p.get("from")) : f.yearFrom,
        yearTo: p.get("to") ? Number(p.get("to")) : f.yearTo,
        plateRegion: (p.get("plate") as PlateRegion) || f.plateRegion,
        cityId: p.get("city") ?? f.cityId,
        bodyType: p.get("body") ?? f.bodyType,
        fuelType: p.get("fuel") ?? f.fuelType,
        subtype: p.get("subtype") ?? f.subtype,
        condition: (p.get("condition") as ItemCondition) || f.condition,
        jobKind: (p.get("jobkind") as ListingKind) || f.jobKind,
        employmentType: (p.get("employ") as EmploymentType) || f.employmentType,
        featuredOnly: p.get("featured") === "1" || f.featuredOnly,
        minPriceUsd: p.get("min") ? Number(p.get("min")) : f.minPriceUsd,
        maxPriceUsd: p.get("max") ? Number(p.get("max")) : f.maxPriceUsd,
        sort: (p.get("sort") as SortKey) || f.sort,
      };
    });
    setVisible(pageSize);
  }, [categoryLock, pageSize]);

  const activeCategory = (categoryLock ?? filters.category) as MainCategory | "all";

  const results = useMemo(
    () => applyFilters(publicAds, filters),
    [publicAds, filters]
  );

  const shown = results.slice(0, visible);
  const update = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(pageSize);
  };

  const reset = () => {
    setFilters({ ...EMPTY_FILTERS, category: categoryLock ?? "all" });
    setVisible(pageSize);
  };

  /* عدّادات الماركات المتاحة (للمركبات) */
  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    publicAds
      .filter((a) => a.category === "vehicles")
      .forEach((a) => {
        const key = a.brandId ?? "other";
        m.set(key, (m.get(key) ?? 0) + 1);
      });
    return m;
  }, [publicAds]);

  const brandList = useMemo(() => {
    const q = brandQuery.trim();
    const list = BRANDS.filter((b) => (brandCounts.get(b.id) ?? 0) > 0);
    if (!q) return list;
    return list.filter((b) => brandMatches(b, q));
  }, [brandQuery, brandCounts]);

  const modelsOfBrand = brandModels(filters.brandId === "all" ? "" : filters.brandId);

  /* عدّادات ماركات الهواتف المتوفرة */
  const phoneBrandCounts = useMemo(() => {
    const m: Record<string, number> = {};
    publicAds
      .filter((a) => a.category === "phones")
      .forEach((a) => {
        const key = a.subtypeId ?? a.brandId ?? "other-phone";
        m[key] = (m[key] ?? 0) + 1;
      });
    return m;
  }, [publicAds]);

  const subtypeList = activeCategory !== "all" ? SUBTYPES[activeCategory] : [];
  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (filters.q) chips.push({ label: `بحث: ${filters.q}`, clear: () => update({ q: "" }) });
    if (filters.propertyType !== "all")
      chips.push({
        label: PROPERTY_TYPES.find((t) => t.id === filters.propertyType)?.name ?? "نوع العقار",
        clear: () => update({ propertyType: "all" }),
      });
    if (filters.vehicleType !== "all")
      chips.push({
        label: VEHICLE_TYPES.find((t) => t.id === filters.vehicleType)?.name ?? "نوع المركبة",
        clear: () => update({ vehicleType: "all" }),
      });
    if (filters.brandId !== "all")
      chips.push({
        label: `الماركة: ${brandName(filters.brandId)}`,
        clear: () => update({ brandId: "all", modelId: "all" }),
      });
    if (filters.modelId !== "all")
      chips.push({
        label: `الموديل: ${modelName(filters.brandId === "all" ? "" : filters.brandId, filters.modelId)}`,
        clear: () => update({ modelId: "all" }),
      });
    if (filters.yearFrom != null || filters.yearTo != null)
      chips.push({
        label: `سنة الصنع: ${filters.yearFrom ?? "…"} - ${filters.yearTo ?? "…"}`,
        clear: () => update({ yearFrom: null, yearTo: null }),
      });
    if (filters.plateRegion !== "all")
      chips.push({
        label: `النمرة: ${PLATE_REGIONS.find((p) => p.id === filters.plateRegion)?.name}`,
        clear: () => update({ plateRegion: "all" }),
      });
    if (filters.fuelType !== "all")
      chips.push({
        label: `الوقود: ${FUEL_TYPES.find((t) => t.id === filters.fuelType)?.name ?? ""}`,
        clear: () => update({ fuelType: "all" }),
      });
    if (filters.bodyType !== "all")
      chips.push({
        label: `النوع: ${BODY_TYPES.find((t) => t.id === filters.bodyType)?.name ?? ""}`,
        clear: () => update({ bodyType: "all" }),
      });
    if (filters.subtype !== "all")
      chips.push({
        label: subtypeList.find((s) => s.id === filters.subtype)?.name ?? "النوع",
        clear: () => update({ subtype: "all" }),
      });
    if (filters.condition !== "all")
      chips.push({
        label: CONDITIONS.find((c) => c.id === filters.condition)?.name ?? "الحالة",
        clear: () => update({ condition: "all" }),
      });
    if (filters.jobKind !== "all")
      chips.push({
        label: JOB_KINDS.find((k) => k.id === filters.jobKind)?.name ?? "عرض/طلب",
        clear: () => update({ jobKind: "all" }),
      });
    if (filters.employmentType !== "all")
      chips.push({
        label: EMPLOYMENT_TYPES.find((e) => e.id === filters.employmentType)?.name ?? "نوع الدوام",
        clear: () => update({ employmentType: "all" }),
      });
    if (filters.dealType !== "all")
      chips.push({
        label: DEAL_TYPES.find((d) => d.id === filters.dealType)?.name ?? "نوع التعامل",
        clear: () => update({ dealType: "all" }),
      });
    if (filters.minPriceUsd != null || filters.maxPriceUsd != null)
      chips.push({
        label: "نطاق السعر",
        clear: () => update({ minPriceUsd: null, maxPriceUsd: null }),
      });
    if (filters.featuredOnly)
      chips.push({ label: "المميّزة فقط", clear: () => update({ featuredOnly: false }) });
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, subtypeList]);

  const dealOptions = activeCategory !== "all" ? dealTypesFor(activeCategory) : [];
  const isRentable = activeCategory === "real-estate" || activeCategory === "vehicles";

  return (
    <div className={embedded ? "" : "container-page py-6"}>
      {!embedded && (
        <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-navy-400">
          <Link href="/" className="hover:text-amberBrand-600">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="font-semibold text-navy-600 dark:text-navy-200">
            {activeCategory === "all" ? "جميع الإعلانات" : categoryName(activeCategory)}
          </span>
        </nav>
      )}

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* ============================== الفلاتر ============================== */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="btn-ghost mb-3 w-full justify-between lg:hidden"
            aria-expanded={panelOpen}
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal size={16} /> الفلاتر والفرز
            </span>
            <span className="badge bg-amberBrand-100 text-amberBrand-700">{activeChips.length}</span>
          </button>

          <div className={`card p-4 ${panelOpen ? "" : "hidden lg:block"}`}>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-navy-900 dark:text-white">
                <Filter size={15} className="text-amberBrand-500" /> تصفية النتائج
              </h3>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-navy-400 hover:text-rose-500"
              >
                <RotateCcw size={12} /> إعادة تعيين
              </button>
            </div>

            {/* البحث */}
            <div className="mt-4">
              <label className="label">كلمة البحث</label>
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                />
                <input
                  value={filters.q}
                  onChange={(e) => update({ q: e.target.value })}
                  placeholder="شقة، كيا، غرفة نوم، معلم، اسم منطقة..."
                  className="input pr-9"
                />
              </div>
            </div>

            {/* التصنيف */}
            {!categoryLock && (
              <div className="mt-4">
                <label className="label">التصنيف</label>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() =>
                      update({
                        category: "all",
                        propertyType: "all",
                        vehicleType: "all",
                        subtype: "all",
                        condition: "all",
                        jobKind: "all",
                      })
                    }
                    className={cn("option-card py-2", filters.category === "all" && "option-card-active")}
                  >
                    <span className="text-[13px] font-bold text-navy-800 dark:text-navy-100">
                      كل التصنيفات
                    </span>
                    <span className="ms-auto text-[11px] text-navy-400">{publicAds.length}</span>
                  </button>
                  {MAIN_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        update({
                          category: c.id,
                          propertyType: "all",
                          vehicleType: "all",
                          subtype: "all",
                          condition: "all",
                          jobKind: "all",
                          dealType: "all",
                          brandId: "all",
                          modelId: "all",
                        })
                      }
                      className={cn(
                        "option-card py-2",
                        filters.category === c.id && "option-card-active"
                      )}
                    >
                      <span className="flex items-center gap-1.5 text-[13px] font-bold text-navy-800 dark:text-navy-100">
                        {CATEGORY_ICON[c.id]}
                        {c.name}
                      </span>
                      <span className="ms-auto text-[11px] text-navy-400">
                        {publicAds.filter((a) => a.category === c.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------- عقارات ----------------------------- */}
            {activeCategory === "real-estate" && (
              <>
                <div className="mt-4">
                  <label className="label">نوع العقار</label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      active={filters.propertyType === "all"}
                      onClick={() => update({ propertyType: "all" })}
                      label="الكل"
                    />
                    {PROPERTY_TYPES.map((p) => (
                      <FilterChip
                        key={p.id}
                        active={filters.propertyType === p.id}
                        onClick={() => update({ propertyType: p.id })}
                        label={p.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ----------------------------- مركبات ----------------------------- */}
            {activeCategory === "vehicles" && (
              <>
                {/* الماركة بالأيقونات */}
                <div className="mt-4 rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                  <h4 className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-navy-900 dark:text-white">
                    <Car size={14} className="text-amberBrand-500" /> الفرز حسب ماركة السيارة
                  </h4>

                  <div className="relative mt-2.5">
                    <Search
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                    />
                    <input
                      value={brandQuery}
                      onChange={(e) => setBrandQuery(e.target.value)}
                      placeholder="ابحث عن ماركة..."
                      className="input py-2 pr-9 text-[12.5px]"
                    />
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => update({ brandId: "all", modelId: "all" })}
                      className={cn(
                        "col-span-3 rounded-lg px-2 py-1.5 text-[11.5px] font-bold transition",
                        filters.brandId === "all"
                          ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                          : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-200"
                      )}
                    >
                      كل الماركات ({brandCounts.size ? [...brandCounts.values()].reduce((a, b) => a + b, 0) : 0})
                    </button>
                    {brandList.map((b) => {
                      const active = filters.brandId === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => update({ brandId: b.id, modelId: "all" })}
                          title={`${b.name} — ${brandCounts.get(b.id) ?? 0} إعلان`}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition",
                            active
                              ? "border-amberBrand-500 bg-amberBrand-50 dark:border-amberBrand-500 dark:bg-amberBrand-500/10"
                              : "border-navy-100 hover:border-amberBrand-300 dark:border-navy-800"
                          )}
                        >
                          <BrandIcon brandId={b.id} size={30} />
                          <span className="line-clamp-1 text-[10px] font-bold text-navy-600 dark:text-navy-200">
                            {b.name}
                          </span>
                          <span className="text-[9.5px] font-bold text-amberBrand-600 dark:text-amberBrand-400">
                            {brandCounts.get(b.id) ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {brandList.length === 0 && (
                    <p className="mt-2 text-[11px] text-navy-400">
                      لا توجد إعلانات بهذه الماركة حالياً.
                    </p>
                  )}
                </div>

                {/* الموديل */}
                {filters.brandId !== "all" && modelsOfBrand.length > 0 && (
                  <div className="mt-4">
                    <label className="label">موديل {brandName(filters.brandId)}</label>
                    <select
                      value={filters.modelId}
                      onChange={(e) => update({ modelId: e.target.value })}
                      className="select"
                    >
                      <option value="all">كل الموديلات</option>
                      {modelsOfBrand.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* سنة الصنع */}
                <div className="mt-4 rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                  <h4 className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-navy-900 dark:text-white">
                    <CalendarDays size={14} className="text-amberBrand-500" /> الفرز حسب سنة الصنع
                  </h4>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {YEAR_RANGES.map((r) => {
                      const active = filters.yearFrom === r.from && filters.yearTo === r.to;
                      return (
                        <button
                          key={r.id}
                          onClick={() =>
                            update(
                              active
                                ? { yearFrom: null, yearTo: null }
                                : { yearFrom: r.from, yearTo: r.to }
                            )
                          }
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold transition",
                            active
                              ? "bg-amberBrand-500 text-navy-900"
                              : "border border-navy-200 text-navy-600 hover:border-amberBrand-400 dark:border-navy-700 dark:text-navy-200"
                          )}
                        >
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="من سنة"
                      value={filters.yearFrom ?? ""}
                      onChange={(e) =>
                        update({ yearFrom: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      className="input py-2 text-[12.5px]"
                    />
                    <span className="text-navy-300">—</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="إلى سنة"
                      value={filters.yearTo ?? ""}
                      onChange={(e) =>
                        update({ yearTo: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      className="input py-2 text-[12.5px]"
                    />
                  </div>
                </div>

                {/* نوع المركبة */}
                <div className="mt-4">
                  <label className="label">نوع المركبة</label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      active={filters.vehicleType === "all"}
                      onClick={() => update({ vehicleType: "all" })}
                      label="الكل"
                    />
                    {VEHICLE_TYPES.map((v) => (
                      <FilterChip
                        key={v.id}
                        active={filters.vehicleType === v.id}
                        onClick={() => update({ vehicleType: v.id })}
                        label={v.name}
                      />
                    ))}
                  </div>
                </div>

                {/* الوقود: بنزين / مازوت / كهرباء / هايبرد */}
                <div className="mt-4">
                  <label className="label">الوقود</label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      active={filters.fuelType === "all"}
                      onClick={() => update({ fuelType: "all" })}
                      label="الكل"
                    />
                    {FUEL_TYPES.map((ft) => (
                      <FilterChip
                        key={ft.id}
                        active={filters.fuelType === ft.id}
                        onClick={() => update({ fuelType: ft.id })}
                        label={ft.id === "electric" ? "⚡ كهرباء" : ft.id === "hybrid" ? "هايبرد" : ft.name}
                      />
                    ))}
                  </div>
                  <p className="hint">
                    اختر «كهرباء» لعرض السيارات الكهربائية بالكامل، و«هايبرد» للمحركين.
                  </p>
                </div>

                {/* نوع السيارة (الهيكل) — بأيقونات مرسومة لكل نوع */}
                <div className="mt-4">
                  <label className="label">نوع السيارة (الهيكل)</label>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    <button
                      onClick={() => update({ bodyType: "all" })}
                      className={cn(
                        "rounded-xl border-2 px-2 py-2 text-[11.5px] font-bold transition",
                        filters.bodyType === "all"
                          ? "border-navy-900 bg-navy-900 text-white dark:border-white dark:bg-white dark:text-navy-900"
                          : "border-navy-100 text-navy-600 hover:border-navy-300 dark:border-navy-800 dark:text-navy-200"
                      )}
                    >
                      كل الأنواع
                    </button>
                    {BODY_TYPES.filter((t) => t.id !== "other").map((t) => {
                      const active = filters.bodyType === t.id;
                      const count = publicAds.filter(
                        (a) => a.category === "vehicles" && bodyTypeOfAd(a) === t.id
                      ).length;
                      return (
                        <button
                          key={t.id}
                          onClick={() => update({ bodyType: active ? "all" : t.id })}
                          title={t.hint}
                          className={cn(
                            "flex flex-col items-center gap-0.5 rounded-xl border-2 p-1.5 transition",
                            active
                              ? "border-amberBrand-500 bg-amberBrand-50 dark:border-amberBrand-500 dark:bg-amberBrand-500/10"
                              : "border-navy-100 hover:border-amberBrand-300 dark:border-navy-800"
                          )}
                        >
                          <span
                            className={cn(
                              active ? "text-amberBrand-600 dark:text-amberBrand-400" : "text-navy-700 dark:text-navy-100"
                            )}
                          >
                            <VehicleBodyIcon type={t.id as BodyTypeId} size={34} />
                          </span>
                          <span className="text-[10.5px] font-bold text-navy-700 dark:text-navy-100">
                            {t.name}
                          </span>
                          <span className="text-[9.5px] font-semibold text-navy-400">
                            {count} إعلان
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="hint">
                    تصنيف تلقائي: كل طراز يُصنَّف من ماركته وموديله — وإن اخترت نوعاً لن تظهر إلا
                    إعلاناته.
                  </p>
                </div>

                {/* نمرة التسجيل */}
                <div className="mt-4">
                  <label className="label">نمرة التسجيل</label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      active={filters.plateRegion === "all"}
                      onClick={() => update({ plateRegion: "all" })}
                      label="الكل"
                    />
                    {PLATE_REGIONS.map((p) => (
                      <FilterChip
                        key={p.id}
                        active={filters.plateRegion === p.id}
                        onClick={() => update({ plateRegion: p.id })}
                        label={p.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ------------------------- هواتف: ماركات بالأيقونات الرسمية ------------------------- */}
            {activeCategory === "phones" && (
              <div className="mt-4 rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                <h4 className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-navy-900 dark:text-white">
                  <Smartphone size={14} className="text-indigo-500" /> الفرز حسب ماركة الهاتف
                </h4>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => update({ subtype: "all", brandId: "all", modelId: "all" })}
                    className={cn(
                      "col-span-3 rounded-lg px-2 py-1.5 text-[11.5px] font-bold transition",
                      filters.subtype === "all"
                        ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                        : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-200"
                    )}
                  >
                    كل الماركات
                  </button>
                  {PHONE_BRANDS.filter((b) => (phoneBrandCounts[b.id] ?? 0) > 0).map((b) => (
                    <button
                      key={b.id}
                      onClick={() =>
                        update({ subtype: filters.subtype === b.id ? "all" : b.id, brandId: "all", modelId: "all" })
                      }
                      title={`${b.name} — ${phoneBrandCounts[b.id] ?? 0} إعلان`}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition",
                        filters.subtype === b.id
                          ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10"
                          : "border-navy-100 hover:border-indigo-300 dark:border-navy-800"
                      )}
                    >
                      <BrandIcon brandId={b.id} size={30} />
                      <span className="line-clamp-1 text-[10px] font-bold text-navy-600 dark:text-navy-200">
                        {b.name}
                      </span>
                      <span className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400">
                        {phoneBrandCounts[b.id] ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- أنواع فرعية: أثاث/أجهزة/ملابس/وظائف -------------------- */}
            {subtypeList.length > 0 && (
              <div className="mt-4">
                <label className="label">
                  {activeCategory === "jobs" ? "مجال العمل" : "النوع"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.subtype === "all"}
                    onClick={() => update({ subtype: "all" })}
                    label="الكل"
                  />
                  {subtypeList.map((s) => (
                    <FilterChip
                      key={s.id}
                      active={filters.subtype === s.id}
                      onClick={() => update({ subtype: s.id })}
                      label={s.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* الحالة (أثاث/أجهزة/ملابس) */}
            {activeCategory !== "all" && CONDITION_CATEGORIES.includes(activeCategory) && (
              <div className="mt-4">
                <label className="label">الحالة</label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.condition === "all"}
                    onClick={() => update({ condition: "all" })}
                    label="الكل"
                  />
                  {CONDITIONS.map((c) => (
                    <FilterChip
                      key={c.id}
                      active={filters.condition === c.id}
                      onClick={() => update({ condition: c.id })}
                      label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* وظائف: عرض/طلب + نوع الدوام */}
            {activeCategory === "jobs" && (
              <>
                <div className="mt-4">
                  <label className="label">عرض أم طلب؟</label>
                  <div className="grid gap-1.5">
                    {JOB_KINDS.map((k) => (
                      <button
                        key={k.id}
                        onClick={() => update({ jobKind: filters.jobKind === k.id ? "all" : k.id })}
                        className={cn(
                          "option-card py-2",
                          filters.jobKind === k.id && "option-card-active"
                        )}
                      >
                        <span className="text-[12.5px] font-bold text-navy-800 dark:text-navy-100">
                          {k.name}
                        </span>
                        <span className="ms-auto text-[10.5px] text-navy-400">{k.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="label">نوع الدوام</label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      active={filters.employmentType === "all"}
                      onClick={() => update({ employmentType: "all" })}
                      label="الكل"
                    />
                    {EMPLOYMENT_TYPES.map((e) => (
                      <FilterChip
                        key={e.id}
                        active={filters.employmentType === e.id}
                        onClick={() => update({ employmentType: e.id })}
                        label={e.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* نوع التعامل (بيع/إيجار) */}
            {isRentable && (
              <div className="mt-4">
                <label className="label">بيع أم إيجار؟</label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.dealType === "all"}
                    onClick={() => update({ dealType: "all" })}
                    label="الكل"
                  />
                  {dealOptions.map((d) => (
                    <FilterChip
                      key={d.id}
                      active={filters.dealType === d.id}
                      onClick={() => update({ dealType: d.id })}
                      label={d.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------ المدينة ------------------------------ */}
            <div className="mt-4">
              <label className="label">المدينة</label>
              <select
                value={filters.cityId}
                onChange={(e) => update({ cityId: e.target.value })}
                className="select"
              >
                <option value="all">كل المدن</option>
                {cities
                  .filter((c) => c.active)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.governorate}
                    </option>
                  ))}
              </select>
            </div>

            {/* رابط مستكشف الأنواع */}
            {activeCategory === "vehicles" && (
              <Link
                href="/car-types"
                className="mt-4 flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-amberBrand-400 bg-amberBrand-50/60 p-3 text-[12px] font-extrabold text-amberBrand-700 transition hover:bg-amberBrand-50 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
              >
                <span>تصفّح الأنواع: نوع ← ماركات ← طرازات (بالصور)</span>
                <span aria-hidden>←</span>
              </Link>
            )}

            {/* نطاق السعر */}
            <div className="mt-4">
              <label className="label">
                {activeCategory === "jobs" ? "نطاق الأجر" : "نطاق السعر"} (
                {CURRENCY_LABEL[currency].short})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="من"
                  className="input"
                  value={
                    filters.minPriceUsd == null
                      ? ""
                      : currency === "USD"
                        ? filters.minPriceUsd
                        : Math.round(filters.minPriceUsd * settings.usdToSyp)
                  }
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : Number(e.target.value);
                    update({
                      minPriceUsd:
                        v == null ? null : currency === "USD" ? v : Math.round(v / settings.usdToSyp),
                    });
                  }}
                />
                <span className="text-navy-300">—</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="إلى"
                  className="input"
                  value={
                    filters.maxPriceUsd == null
                      ? ""
                      : currency === "USD"
                        ? filters.maxPriceUsd
                        : Math.round(filters.maxPriceUsd * settings.usdToSyp)
                  }
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : Number(e.target.value);
                    update({
                      maxPriceUsd:
                        v == null ? null : currency === "USD" ? v : Math.round(v / settings.usdToSyp),
                    });
                  }}
                />
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-navy-100 p-3 dark:border-navy-800">
              <span className="inline-flex items-center gap-2 text-[13px] font-bold text-navy-700 dark:text-navy-100">
                <Sparkles size={14} className="text-amberBrand-500" /> الإعلانات المميّزة فقط
              </span>
              <input
                type="checkbox"
                checked={filters.featuredOnly}
                onChange={(e) => update({ featuredOnly: e.target.checked })}
                className="h-4 w-4 accent-amberBrand-500"
              />
            </label>

            <button onClick={() => setPanelOpen(false)} className="btn-primary mt-4 w-full lg:hidden">
              عرض {results.length} نتيجة
            </button>
          </div>
        </aside>

        {/* ============================== النتائج ============================== */}
        <section>
          <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-3.5">
            <p className="text-[13px] font-bold text-navy-700 dark:text-navy-100">
              {formatNumber(results.length)} إعلان
              <span className="mx-1.5 font-normal text-navy-400">
                {activeCategory === "all"
                  ? "في جميع التصنيفات"
                  : `في ${categoryName(activeCategory)}`}
                {filters.brandId !== "all" && ` — ${brandName(filters.brandId)}`}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value as SortKey })}
                  className="select w-48 py-2 pl-8 text-[12.5px]"
                  aria-label="ترتيب النتائج"
                >
                  {sortOptionsFor(activeCategory).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
                />
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeChips.map((c, i) => (
                <button
                  key={i}
                  onClick={c.clear}
                  className="chip border border-amberBrand-300 bg-amberBrand-50 text-amberBrand-700 transition hover:bg-amberBrand-100 dark:border-amberBrand-500/40 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
                >
                  {c.label}
                  <X size={12} />
                </button>
              ))}
              <button
                onClick={reset}
                className="text-[11.5px] font-bold text-navy-400 hover:text-rose-500"
              >
                مسح الكل
              </button>
            </div>
          )}

          {shown.length === 0 ? (
            <EmptyState
              icon={<Search size={26} />}
              title="لا توجد نتائج مطابقة"
              desc="جرّب توسيع نطاق السعر أو تغيير الماركة أو سنة الصنع، أو اختيار منطقة أخرى. وإن لم تجد ما تبحث عنه يمكنك إضافة إعلانك مجاناً."
              action={
                <div className="mt-2 flex gap-2">
                  <button onClick={reset} className="btn-ghost">
                    <RotateCcw size={15} /> إعادة تعيين الفلاتر
                  </button>
                  <Link href="/post-ad" className="btn-amber">
                    أضف إعلانك
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}

          {visible < results.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setVisible((v) => v + pageSize);
                    setLoading(false);
                  }, 260);
                }}
                className="btn-ghost px-6"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> جار التحميل...
                  </>
                ) : (
                  <>عرض المزيد ({results.length - visible} إعلان)</>
                )}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition",
        active
          ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
          : "border border-navy-200 text-navy-600 hover:border-amberBrand-400 hover:text-amberBrand-600 dark:border-navy-700 dark:text-navy-200"
      )}
    >
      {label}
    </button>
  );
}

