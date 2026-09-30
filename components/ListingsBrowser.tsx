"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Car,
  ChevronDown,
  Filter,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Rows3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { AdStatus, DealType, MainCategory, PropertyType, VehicleType } from "@/lib/types";
import {
  DEAL_TYPES,
  MAIN_CATEGORIES,
  PROPERTY_TYPES,
  VEHICLE_TYPES,
} from "@/lib/taxonomy";
import { CURRENCY_LABEL } from "@/lib/taxonomy";
import {
  EMPTY_FILTERS,
  Filters,
  SORT_OPTIONS,
  applyFilters,
  type SortKey,
} from "@/lib/filters";
import { formatNumber } from "@/lib/currency";
import AdCard from "./AdCard";
import EmptyState from "./EmptyState";

/* ==========================================================================
   متصفّح الإعلانات الموحّد (يُستخدم في /category/[slug] و /search)
   ========================================================================== */

export default function ListingsBrowser({
  categoryLock,
  embedded = false,
  pageSize = 12,
}: {
  categoryLock?: MainCategory | "all";
  embedded?: boolean;
  pageSize?: number;
}) {
  const { publicAds, cities, districtName, settings, currency } = useStore();

  /* الحالة الابتدائية تُبنى من التصنيف المثبّت (SSG) — ثم تُطبَّق معايير الرابط بعد التحميل */
  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    category: categoryLock ?? "all",
  }));
  const [visible, setVisible] = useState(pageSize);
  const [lgOpen, setLgOpen] = useState(false); // لوحة الفلاتر على الجوال
  const [loading, setLoading] = useState(false);

  /* قراءة معايير الرابط عند التحميل (بدون تعطيل التصدير الثابت أو إخفاء المحتوى عن محركات البحث) */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if ([...p.keys()].length === 0) return;
    setFilters((f) => {
      const type = p.get("type");
      const isVehicleParam = categoryLock === "vehicles";
      return {
        ...f,
        q: p.get("q") ?? f.q,
        category: categoryLock ?? ((p.get("category") as MainCategory) || f.category),
        propertyType: !isVehicleParam && type ? (type as PropertyType) : f.propertyType,
        vehicleType: isVehicleParam && type ? (type as VehicleType) : f.vehicleType,
        dealType: (p.get("deal") as DealType) || f.dealType,
        districtId: p.get("district") ?? f.districtId,
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
    () =>
      applyFilters(publicAds, filters, (ad) => districtName(ad.cityId, ad.districtId)),
    [publicAds, filters, districtName]
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

  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (filters.q) chips.push({ label: `بحث: ${filters.q}`, clear: () => update({ q: "" }) });
    if (filters.propertyType !== "all")
      chips.push({
        label:
          PROPERTY_TYPES.find((t) => t.id === filters.propertyType)?.name ?? "نوع العقار",
        clear: () => update({ propertyType: "all" }),
      });
    if (filters.vehicleType !== "all")
      chips.push({
        label: VEHICLE_TYPES.find((t) => t.id === filters.vehicleType)?.name ?? "نوع المركبة",
        clear: () => update({ vehicleType: "all" }),
      });
    if (filters.dealType !== "all")
      chips.push({
        label: DEAL_TYPES.find((d) => d.id === filters.dealType)?.name ?? "نوع التعامل",
        clear: () => update({ dealType: "all" }),
      });
    if (filters.districtId !== "all")
      chips.push({
        label:
          cities.flatMap((c) => c.districts).find((d) => d.id === filters.districtId)?.name ??
          "الحي",
        clear: () => update({ districtId: "all" }),
      });
    if (filters.minPriceUsd != null || filters.maxPriceUsd != null)
      chips.push({
        label: "نطاق السعر",
        clear: () => update({ minPriceUsd: null, maxPriceUsd: null }),
      });
    if (filters.featuredOnly)
      chips.push({ label: "المميّزة فقط", clear: () => update({ featuredOnly: false }) });
    return chips;
  }, [filters, cities]);

  const districtList = cities
    .filter((c) => c.active)
    .flatMap((c) => c.districts.map((d) => ({ ...d, cityName: c.name })));

  return (
    <div className={embedded ? "" : "container-page py-6"}>
      {/* رأس الصفحة */}
      {!embedded && (
        <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-navy-400">
          <Link href="/" className="hover:text-amberBrand-600">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="font-semibold text-navy-600 dark:text-navy-200">
            {activeCategory === "all"
              ? "جميع الإعلانات"
              : MAIN_CATEGORIES.find((c) => c.id === activeCategory)?.name}
          </span>
        </nav>
      )}

      <div className="grid gap-5 lg:grid-cols-[290px_1fr]">
        {/* ============================ الفلاتر ============================ */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <button
            onClick={() => setLgOpen((v) => !v)}
            className="btn-ghost mb-3 w-full justify-between lg:hidden"
            aria-expanded={lgOpen}
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal size={16} /> الفلاتر والترتيب
            </span>
            <span className="badge bg-amberBrand-100 text-amberBrand-700">
              {activeChips.length}
            </span>
          </button>

          <div className={`card p-4 ${lgOpen ? "" : "hidden lg:block"}`}>
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
                  placeholder="شقة، أرض، كيا، منزل..."
                  className="input pr-9"
                />
              </div>
            </div>

            {/* التصنيف */}
            {!categoryLock && (
              <div className="mt-4">
                <label className="label">التصنيف</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[{ id: "all", name: "كل التصنيفات" }, ...MAIN_CATEGORIES].map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        update({
                          category: c.id as MainCategory | "all",
                          propertyType: "all",
                          vehicleType: "all",
                        })
                      }
                      className={`option-card py-2 ${filters.category === c.id ? "option-card-active" : ""}`}
                    >
                      <span className="text-[13px] font-bold text-navy-800 dark:text-navy-100">
                        {c.name}
                      </span>
                      <span className="ms-auto text-[11px] text-navy-400">
                        {c.id === "all"
                          ? publicAds.length
                          : publicAds.filter((a) => a.category === c.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* نوع العقار / المركبة */}
            {activeCategory === "real-estate" && (
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
                <label className="label mt-4">نوع التعامل</label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.dealType === "all"}
                    onClick={() => update({ dealType: "all" })}
                    label="الكل"
                  />
                  {DEAL_TYPES.map((d) => (
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

            {activeCategory === "vehicles" && (
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
            )}

            {/* الحي */}
            <div className="mt-4">
              <label className="label">الحي / المنطقة</label>
              <select
                value={filters.districtId}
                onChange={(e) => update({ districtId: e.target.value })}
                className="select"
              >
                <option value="all">كل الأحياء والريف</option>
                {districtList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* نطاق السعر */}
            <div className="mt-4">
              <label className="label">
                نطاق السعر ({CURRENCY_LABEL[currency].short})
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
              <p className="hint">
                تُحوَّل الأسعار داخلياً إلى الدولار للفلترة، وتُعرض بعملتك المختارة.
              </p>
            </div>

            {/* خيارات */}
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

            <button
              onClick={() => setLgOpen(false)}
              className="btn-primary mt-4 w-full lg:hidden"
            >
              عرض {results.length} نتيجة
            </button>
          </div>
        </aside>

        {/* ============================ النتائج ============================ */}
        <section>
          <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-3.5">
            <p className="text-[13px] font-bold text-navy-700 dark:text-navy-100">
              {formatNumber(results.length)} إعلان
              <span className="mx-1.5 font-normal text-navy-400">
                {activeCategory === "all"
                  ? "في جميع التصنيفات"
                  : `في ${MAIN_CATEGORIES.find((c) => c.id === activeCategory)?.name}`}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <span className="hidden text-[12px] text-navy-400 sm:inline">ترتيب حسب</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value as SortKey })}
                  className="select w-40 py-2 pl-8 text-[12.5px]"
                >
                  {SORT_OPTIONS.map((s) => (
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
              <button onClick={reset} className="text-[11.5px] font-bold text-navy-400 hover:text-rose-500">
                مسح الكل
              </button>
            </div>
          )}

          {shown.length === 0 ? (
            <EmptyState
              icon={<Search size={26} />}
              title="لا توجد نتائج مطابقة"
              desc="جرّب توسيع نطاق السعر، أو اختيار حي آخر، أو إزالة بعض الفلاتر. يمكنك أيضاً إضافة إعلانك إن لم تجد ما تبحث عنه."
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
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>

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
            </>
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
      className={`rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition ${
        active
          ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
          : "border border-navy-200 text-navy-600 hover:border-amberBrand-400 hover:text-amberBrand-600 dark:border-navy-700 dark:text-navy-200"
      }`}
    >
      {label}
    </button>
  );
}

/* أيقونات مساعدة للاستخدام الخارجي */
export const CategoryIcons = { Building2, Car, LayoutGrid, Rows3 };
