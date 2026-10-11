"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Car,
  ChevronDown,
  Filter,
  Home,
  Layers,
  Loader2,
  Map,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trees,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { DealType, DistrictKind, MainCategory, PropertyType, VehicleType } from "@/lib/types";
import { CURRENCY_LABEL, DEAL_TYPES, MAIN_CATEGORIES, PROPERTY_TYPES, VEHICLE_TYPES } from "@/lib/taxonomy";
import { DISTRICT_KINDS, districtKindShort } from "@/lib/geo";
import {
  EMPTY_FILTERS,
  Filters,
  SORT_OPTIONS,
  applyFilters,
  groupByDistrict,
  type SortKey,
} from "@/lib/filters";
import { formatNumber } from "@/lib/currency";
import AdCard from "./AdCard";
import EmptyState from "./EmptyState";

/* ==========================================================================
   متصفّح الإعلانات الموحّد (/category/[slug] و /search)
   - الفلترة حسب المنطقة (حي / قرية / منطقة) مبنية ديناميكياً من الإعلانات
   - خيار "تجميع حسب المنطقة" لعرض النتائج مجمّعة تحت عنوان كل منطقة
   - ترتيب أبجدي حسب المنطقة
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
  const { publicAds, settings, currency, districtFacets, districtLabelOf } = useStore();

  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    category: categoryLock ?? "all",
  }));
  const [visible, setVisible] = useState(pageSize);
  const [grouped, setGrouped] = useState(false); // تجميع حسب المنطقة
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* قراءة معايير الرابط (بدون تعطيل التصدير الثابت) */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setGrouped(p.get("group") === "district");
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
        districtKind: (p.get("kind") as DistrictKind) || f.districtKind,
        featuredOnly: p.get("featured") === "1" || f.featuredOnly,
        minPriceUsd: p.get("min") ? Number(p.get("min")) : f.minPriceUsd,
        maxPriceUsd: p.get("max") ? Number(p.get("max")) : f.maxPriceUsd,
        sort: (p.get("sort") as SortKey) || f.sort,
      };
    });
    setVisible(pageSize);
  }, [categoryLock, pageSize]);

  const activeCategory = (categoryLock ?? filters.category) as MainCategory | "all";

  /* دالة استخراج معلومات المنطقة من أي إعلان */
  const districtOf = useMemo(
    () => (ad: Parameters<typeof districtLabelOf>[0]) => {
      const name = districtLabelOf(ad);
      const kind: DistrictKind = ad.districtKind ?? "area";
      return { name, kind };
    },
    [districtLabelOf]
  );

  /* المناطق المتاحة — مشتقة من الإعلانات المعروضة + الأسطول الإداري */
  const facets = useMemo(() => {
    const list = districtFacets("public");
    // إضافة أي منطقة يعرضها إعلان ولم تُسجَّل بعد (احتياط)
    const known = new Set(list.map((f) => `${f.cityId}::${f.id}`));
    publicAds.forEach((ad) => {
      const key = `${ad.cityId}::${ad.districtId}`;
      if (known.has(key)) return;
      known.add(key);
      list.push({
        id: ad.districtId,
        name: districtLabelOf(ad),
        kind: ad.districtKind ?? "area",
        cityId: ad.cityId,
        count: 1,
      });
    });
    return list;
  }, [districtFacets, publicAds, districtLabelOf]);

  const results = useMemo(
    () => applyFilters(publicAds, filters, districtOf),
    [publicAds, filters, districtOf]
  );

  const shown = results.slice(0, visible);
  const groups = useMemo(
    () => (grouped ? groupByDistrict(shown, districtOf) : []),
    [grouped, shown, districtOf]
  );

  const update = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(pageSize);
  };

  const reset = () => {
    setFilters({ ...EMPTY_FILTERS, category: categoryLock ?? "all" });
    setGrouped(false);
    setVisible(pageSize);
  };

  const districtLabel = (id: string) =>
    facets.find((f) => f.id === id)?.name ?? (id === "all" ? "كل المناطق" : "منطقة");

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
    if (filters.dealType !== "all")
      chips.push({
        label: DEAL_TYPES.find((d) => d.id === filters.dealType)?.name ?? "نوع التعامل",
        clear: () => update({ dealType: "all" }),
      });
    if (filters.districtId !== "all")
      chips.push({
        label: `المنطقة: ${districtLabel(filters.districtId)}`,
        clear: () => update({ districtId: "all" }),
      });
    if (filters.districtKind !== "all")
      chips.push({
        label: DISTRICT_KINDS.find((k) => k.id === filters.districtKind)?.name ?? "نوع المنطقة",
        clear: () => update({ districtKind: "all" }),
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
  }, [filters, facets]);

  /* عدّاد المناطق حسب النوع (لشرائح الفلترة) */
  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: results.length };
    DISTRICT_KINDS.forEach((k) => {
      c[k.id] = publicAds.filter((a) => (a.districtKind ?? "area") === k.id).length;
    });
    return c;
  }, [publicAds, results.length]);

  const kindIcon = (kind: DistrictKind) =>
    kind === "neighborhood" ? <Home size={14} /> : kind === "village" ? <Trees size={14} /> : <Map size={14} />;

  return (
    <div className={embedded ? "" : "container-page py-6"}>
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

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* ============================ الفلاتر ============================ */}
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
                  placeholder="شقة، أرض، كيا، اسم منطقة..."
                  className="input pr-9"
                />
              </div>
              <p className="hint">يشمل البحث أسماء المناطق كما كتبها المُعلنون.</p>
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

            {/* --------------------- الجغرافيا (ديناميكية) --------------------- */}
            <div className="mt-5 rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
              <h4 className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-navy-900 dark:text-white">
                <MapPin size={14} className="text-emeraldBrand-500" /> الفرز حسب المنطقة
              </h4>

              {/* نوع المنطقة */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <FilterChip
                  active={filters.districtKind === "all"}
                  onClick={() => update({ districtKind: "all" })}
                  label="الكل"
                />
                {DISTRICT_KINDS.map((k) => (
                  <FilterChip
                    key={k.id}
                    active={filters.districtKind === k.id}
                    onClick={() => update({ districtKind: k.id })}
                    label={`${k.short} (${kindCounts[k.id] ?? 0})`}
                  />
                ))}
              </div>

              {/* المنطقة المحددة */}
              <div className="mt-3">
                <label className="label">المنطقة المحدّدة</label>
                <select
                  value={filters.districtId}
                  onChange={(e) => update({ districtId: e.target.value })}
                  className="select"
                >
                  <option value="all">كل المناطق ({facets.reduce((s, f) => s + f.count, 0)})</option>
                  {facets.map((f) => (
                    <option key={f.cityId + f.id} value={f.id}>
                      {f.name} — {districtKindShort(f.kind)} ({f.count})
                    </option>
                  ))}
                </select>
                {facets.length === 0 && (
                  <p className="hint">
                    لا توجد مناطق مسجّلة بعد — تُنشأ المناطق تلقائياً عند إدخالها يدوياً في نموذج
                    إضافة الإعلان.
                  </p>
                )}
              </div>

              {/* أكثر المناطق نشاطاً */}
              {facets.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] font-bold text-navy-400">الأكثر إعلانات</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets.slice(0, 8).map((f) => (
                      <button
                        key={f.cityId + f.id}
                        onClick={() =>
                          update({ districtId: filters.districtId === f.id ? "all" : f.id })
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                          filters.districtId === f.id
                            ? "bg-emeraldBrand-500 text-white"
                            : "border border-navy-200 text-navy-600 hover:border-emeraldBrand-400 dark:border-navy-700 dark:text-navy-200"
                        }`}
                      >
                        {kindIcon(f.kind)}
                        {f.name}
                        <span className="opacity-70">{f.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* تجميع النتائج */}
              <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl bg-navy-50/70 p-2.5 dark:bg-navy-800/50">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-700 dark:text-navy-100">
                  <Layers size={13} className="text-amberBrand-500" /> تجميع النتائج حسب المنطقة
                </span>
                <input
                  type="checkbox"
                  checked={grouped}
                  onChange={(e) => setGrouped(e.target.checked)}
                  className="h-4 w-4 accent-amberBrand-500"
                />
              </label>
            </div>

            {/* نطاق السعر */}
            <div className="mt-4">
              <label className="label">نطاق السعر ({CURRENCY_LABEL[currency].short})</label>
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
              <p className="hint">تُحوَّل الأسعار داخلياً إلى الدولار للفلترة، وتُعرض بعملتك المختارة.</p>
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

            <button onClick={() => setPanelOpen(false)} className="btn-primary mt-4 w-full lg:hidden">
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
                {filters.districtId !== "all" && ` — منطقة ${districtLabel(filters.districtId)}`}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setGrouped((v) => !v)}
                className={`btn btn-sm ${
                  grouped
                    ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                    : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-200"
                }`}
                title="عرض النتائج مجمّعة تحت عنوان كل منطقة"
              >
                <Layers size={14} /> تجميع حسب المنطقة
              </button>

              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value as SortKey })}
                  className="select w-44 py-2 pl-8 text-[12.5px]"
                  aria-label="ترتيب النتائج"
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
              desc="جرّب توسيع نطاق السعر، أو اختيار منطقة أخرى، أو إزالة بعض الفلاتر. تذكّر أن المناطق تُبنى من إدخال المُعلنين، فإن لم تجد منطقتك فهي بانتظار أول إعلان فيها."
              action={
                <div className="mt-2 flex gap-2">
                  <button onClick={reset} className="btn-ghost">
                    <RotateCcw size={15} /> إعادة تعيين الفلاتر
                  </button>
                  <Link href="/post-ad" className="btn-amber">
                    أضف إعلانك في منطقتك
                  </Link>
                </div>
              }
            />
          ) : grouped ? (
            /* ---------------- العرض المجمّع حسب المنطقة ---------------- */
            <div className="space-y-7">
              {groups.map((g) => (
                <div key={`${g.info.kind}-${g.info.name}`}>
                  <div className="mb-3 flex flex-wrap items-center gap-2 border-b-2 border-amberBrand-200 pb-2 dark:border-amberBrand-500/30">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-amberBrand-400 dark:bg-white dark:text-navy-900">
                      {kindIcon(g.info.kind)}
                    </span>
                    <h3 className="text-[15px] font-extrabold text-navy-900 dark:text-white">
                      {g.info.name}
                    </h3>
                    <span className="badge bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
                      {districtKindShort(g.info.kind)}
                    </span>
                    <span className="text-[12px] font-bold text-navy-400">
                      {g.ads.length} إعلان
                    </span>
                    <button
                      onClick={() =>
                        update({
                          districtId: g.ads[0]?.districtId ?? "all",
                          districtKind: g.info.kind,
                        })
                      }
                      className="ms-auto text-[11.5px] font-bold text-amberBrand-600 hover:underline dark:text-amberBrand-400"
                    >
                      عرض هذه المنطقة فقط
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {g.ads.map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
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

export const CategoryIcons = { Building2, Car, MapPin };
