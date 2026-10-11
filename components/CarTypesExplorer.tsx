"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  ChevronLeft,
  Flame,
  Layers,
  Search,
  Sparkles,
  Warehouse,
  Zap,
} from "lucide-react";
import BrandIcon from "./BrandIcon";
import VehicleBodyIcon from "./VehicleBodyIcon";
import {
  BODY_TYPES,
  VEHICLE_MARKETS,
  bodyTypeCounts,
  catalogForBodyType,
  filterCatalogByMarket,
  marketStats,
  type BodyTypeId,
  type VehicleMarket,
} from "@/lib/vehicleBodies";
import { cn } from "@/lib/currency";

/* ==========================================================================
   مستكشف أنواع السيارات: نوع ← ماركات النوع ← طرازات كل ماركة
   - اختيار النوع من الشريط العلوي (أيقونة مرسومة لكل نوع)
   - ثم بطاقات الماركات بشعاراتها الرسمية + عدد الطرازات
   - ثم الطرازات كشرائح تنقل لسوق المركبات مفلترة بالموديل
   ========================================================================== */

export default function CarTypesExplorer({ initialType }: { initialType?: BodyTypeId }) {
  const [typeId, setTypeId] = useState<BodyTypeId>(initialType ?? "sedan");
  const [market, setMarket] = useState<VehicleMarket>("all");
  const [brandFilter, setBrandFilter] = useState("");
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const [onlyEv, setOnlyEv] = useState(false);

  /* دعم الرابط: /car-types?type=suv */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("type") as BodyTypeId | null;
    if (t && BODY_TYPES.some((x) => x.id === t)) setTypeId(t);
    const b = p.get("brand");
    if (b) setOpenBrand(b);
    const m = p.get("market") as VehicleMarket | null;
    if (m && VEHICLE_MARKETS.some((x) => x.id === m)) setMarket(m);
    if (p.get("fuel") === "ev") setOnlyEv(true);
  }, []);

  const syncUrl = (patch: { type?: BodyTypeId; market?: VehicleMarket }) => {
    const url = new URL(window.location.href);
    if (patch.type) url.searchParams.set("type", patch.type);
    if (patch.market) url.searchParams.set("market", patch.market);
    window.history.replaceState(null, "", url.toString());
  };

  const counts = useMemo(() => bodyTypeCounts(), []);
  const stats = useMemo(() => marketStats(), []);
  const fullCatalog = useMemo(() => catalogForBodyType(typeId), [typeId]);
  const catalog = useMemo(() => {
    const base = filterCatalogByMarket(fullCatalog, market);
    if (!onlyEv) return base;
    return base
      .map(({ brand, models }) => ({ brand, models: models.filter((m) => m.fuel === "ev") }))
      .filter((x) => x.models.length > 0);
  }, [fullCatalog, market, onlyEv]);
  const activeType = BODY_TYPES.find((t) => t.id === typeId)!;

  const brandsShown = useMemo(() => {
    const q = brandFilter.trim().toLowerCase();
    const list = catalog.filter(({ brand }) => {
      if (!q) return true;
      return [brand.name, brand.en, ...(brand.alt ?? [])].join(" ").toLowerCase().includes(q);
    });
    return list.sort((a, b) => b.models.length - a.models.length);
  }, [catalog, brandFilter]);

  const totalModels = catalog.reduce((s, c) => s + c.models.length, 0);
  const evModels = catalog.reduce(
    (s, c) => s + c.models.filter((m) => m.fuel === "ev" || m.fuel === "hybrid").length,
    0
  );

  return (
    <div className="container-page py-8">
      {/* ============================ الترويسة ============================ */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-navy-900 dark:text-white sm:text-2xl">
            <Car size={22} className="text-amberBrand-500" /> أنواع السيارات
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
            اختر نوع السيارة (بالأيقونة) ← تظهر <b>ماركات هذا النوع بشعاراتها الرسمية</b> (كل الماركات
            مدمجة في قائمة واحدة: صينية وأوروبية ويابانية وكورية) ← اضغط أي ماركة لترى <b>كل طرازاتها</b>،
            ومعها سوق الإعلانات المفلتر. القسم المستقل الوحيد هو <b>الكهربائية والهايبرد</b>.
          </p>
        </div>
        <Link href="/category/vehicles" className="btn-ghost btn-sm">
          <ArrowLeft size={15} /> كل إعلانات المركبات
        </Link>
      </div>

      {/* ============================ شريط الأنواع ============================ */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {BODY_TYPES.filter((t) => t.id !== "other").map((t) => {
          const active = t.id === typeId;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTypeId(t.id);
                setOpenBrand(null);
                setBrandFilter("");
                syncUrl({ type: t.id });
              }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 p-3 text-right transition",
                active
                  ? "border-amberBrand-500 bg-amberBrand-50 dark:border-amberBrand-500 dark:bg-amberBrand-500/10"
                  : "border-navy-100 bg-white hover:border-amberBrand-300 dark:border-navy-800 dark:bg-navy-900"
              )}
            >
              <span
                className={cn(
                  "shrink-0",
                  active ? "text-amberBrand-600 dark:text-amberBrand-400" : "text-navy-700 dark:text-navy-100"
                )}
              >
                <VehicleBodyIcon type={t.id} size={46} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-extrabold text-navy-900 dark:text-white">
                  {t.name}
                </span>
                <span className="block text-[10.5px] font-semibold text-navy-400">
                  {counts[t.id] ?? 0} طراز · {catalogForBody(t.id).length} ماركة
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================ تفاصيل النوع ============================ */}
      <div className="mt-7 overflow-hidden rounded-2xl border border-navy-100 dark:border-navy-800">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900 p-4 text-white dark:bg-navy-800">
          <div className="flex items-center gap-3">
            <span className="text-amberBrand-400">
              <VehicleBodyIcon type={typeId} size={54} />
            </span>
            <div>
              <h2 className="text-[15px] font-extrabold">{activeType.name}</h2>
              <p className="text-[11.5px] text-navy-300">{activeType.hint}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11.5px]">
            <span className="badge bg-white/10 text-white">{catalog.length} ماركة</span>
            <span className="badge bg-amberBrand-500/20 text-amberBrand-400">{totalModels} طراز</span>
            {evModels > 0 && (
              <span className="badge bg-emerald-500/20 text-emerald-300">
                <Zap size={11} /> {evModels} كهربائية/هايبرد
              </span>
            )}
            <Link
              href={`/category/vehicles?body=${typeId}`}
              className="btn-amber btn-sm"
            >
              <Sparkles size={13} /> إعلانات هذا النوع
            </Link>
          </div>
        </div>

        {/* مجموعات السوق: صينية · كهربائية · صغيرة رائجة */}
        <div className="border-b border-navy-100 bg-navy-50/70 p-3 dark:border-navy-800 dark:bg-navy-800/40">
          <div className="flex flex-wrap items-center gap-1.5">
            {VEHICLE_MARKETS.map((mk) => {
              const active = market === mk.id;
              const st = stats[mk.id];
              return (
                <button
                  key={mk.id}
                  title={mk.hint}
                  onClick={() => {
                    setMarket(mk.id);
                    setOnlyEv(false);
                    setOpenBrand(null);
                    syncUrl({ market: mk.id });
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-[11.5px] font-extrabold transition",
                    active
                      ? "border-amberBrand-500 bg-amberBrand-500 text-white"
                      : "border-navy-200 bg-white text-navy-700 hover:border-amberBrand-400 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                  )}
                >
                  {mk.id === "ev" && <Zap size={12} className={active ? "text-white" : "text-emerald-500"} />}
                  {mk.name}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-bold",
                      active ? "bg-white/25" : "bg-navy-100 dark:bg-navy-800"
                    )}
                  >
                    {st.models}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setOnlyEv((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-[11.5px] font-extrabold transition",
                onlyEv
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-navy-200 bg-white text-navy-700 hover:border-emerald-400 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
              )}
            >
              <Zap size={12} /> كهربائية فقط
            </button>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-navy-500 dark:text-navy-300">
            {market === "ev" && "كل الطرازات المعروضة تعمل بالكهرباء بالكامل أو هايبرد/مدى ممتد فقط."}
            {market === "all" &&
              `المجموع: ${stats.all.brands} ماركة و${stats.all.models} طرازاً — بينها ${stats.ev.models} طرازاً كهربائياً/هايبرد (قسم مستقل).`}
          </p>
        </div>

        {/* بحث الماركات */}
        <div className="border-b border-navy-100 bg-white p-3 dark:border-navy-800 dark:bg-navy-900">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
            />
            <input
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              placeholder={`ابحث عن ماركة داخل «${activeType.name}»...`}
              className="input pr-9"
            />
          </div>
        </div>

        {/* الماركات والطرازات */}
        {brandsShown.length === 0 ? (
          <div className="bg-white p-8 text-center dark:bg-navy-900">
            <Warehouse size={22} className="mx-auto text-navy-300" />
            <p className="mt-2 text-[13px] font-bold text-navy-700 dark:text-navy-100">
              لا توجد ماركات مطابقة في هذا النوع
            </p>
            <p className="mt-1 text-[12px] text-navy-400">
              جرّب نوعاً آخر أو امسح كلمة البحث.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-navy-100 bg-white dark:divide-navy-800 dark:bg-navy-900">
            {brandsShown.map(({ brand, models }) => {
              const open = openBrand === brand.id;
              return (
                <div key={brand.id}>
                  <button
                    onClick={() => setOpenBrand(open ? null : brand.id)}
                    className="flex w-full items-center gap-3 p-3.5 text-right transition hover:bg-navy-50/70 dark:hover:bg-navy-800/40"
                  >
                    <BrandIcon brandId={brand.id} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-extrabold text-navy-900 dark:text-white">
                          {brand.name}
                        </span>
                        <span className="text-[11px] font-semibold text-navy-400" dir="ltr">
                          {brand.en}
                        </span>
                        <span className="badge bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-300">
                          {models.length} طراز
                        </span>
                        {brand.origin !== "—" && (
                          <span className="text-[10.5px] text-navy-400">{brand.origin}</span>
                        )}
                      </span>
                      {!open && (
                        <span className="mt-1 line-clamp-1 block text-[11.5px] text-navy-400">
                          {models.map((m) => m.name).join(" · ")}
                        </span>
                      )}
                    </span>
                    <ChevronLeft
                      size={18}
                      className={cn("shrink-0 text-navy-400 transition", open && "-rotate-90")}
                    />
                  </button>

                  {open && (
                    <div className="bg-navy-50/50 px-3.5 pb-4 pt-1 dark:bg-navy-800/30">
                      <div className="flex flex-wrap gap-1.5">
                        {models.map((m) => (
                          <Link
                            key={m.id}
                            href={`/category/vehicles?brand=${brand.id}&model=${m.id}`}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-navy-700 transition hover:border-amberBrand-400 hover:text-amberBrand-600 dark:bg-navy-900 dark:text-navy-100",
                              m.fuel === "ev"
                                ? "border-emerald-300 dark:border-emerald-700"
                                : m.fuel === "hybrid"
                                  ? "border-teal-300 dark:border-teal-700"
                                  : "border-navy-200 dark:border-navy-700"
                            )}
                          >
                            {m.fuel === "ev" && <Zap size={11} className="text-emerald-500" />}
                            {m.hot && <Flame size={11} className="text-rose-500" />}
                            {m.name}
                            {m.en && (
                              <span className="text-[9.5px] text-navy-400" dir="ltr">
                                {m.en}
                              </span>
                            )}
                            {m.fuel === "hybrid" && <span className="text-[9px] text-teal-600">هايبرد</span>}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/category/vehicles?brand=${brand.id}`}
                          className="btn btn-sm bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                        >
                          <Layers size={13} /> كل إعلانات {brand.name}
                        </Link>
                        <Link href="/post-ad" className="btn-ghost btn-sm">
                          أضف إعلاناً من هذا الطراز
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-[11.5px] leading-relaxed text-navy-400">
        الشعارات الرسمية للماركات مضمّنة داخل المنصة وتُستخدم للتعريف بالمطابقة فقط.
        الأنواع الـ {BODY_TYPES.length - 1} والطرازات قابلة للتوسّع من ملفات البيانات.
      </p>
    </div>
  );
}

/* عدّ الماركات بسرعة داخل بطاقة النوع (لاستخدامها في الشريط) */
function catalogForBody(id: BodyTypeId) {
  return catalogForBodyType(id);
}
