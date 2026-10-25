"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { BRANDS, PHONE_BRANDS, brandMatches } from "@/lib/brands";
import { bodyTypeOfModel, type BodyTypeId } from "@/lib/vehicleBodies";
import { cn } from "@/lib/currency";
import { normalizeArabic } from "@/lib/filters";
import BrandIcon from "./BrandIcon";

/* ==========================================================================
   اختيار ماركة السيارة/الهاتف مع طي بقية الاختيارات فور التحديد
   - شبكة أيقونات لكل الماركات (+ ماركة أخرى بكتابة يدوية)
   - الأكثر طلباً: هيونداي ، كيا ، مرسيدس ، تويوتا ، جي أم سي ، شيفروليه ، مازدا ، جيب ، سكودا
   - عند الاختيار: تنطوي الماركات وتظهر في شريط أنيق مع زر "تغيير الماركة ↻"
   - يليه مباشرة حقل كتابة الموديل يدوياً
   ========================================================================== */

export default function BrandSelector({
  brands = BRANDS,
  brandId,
  modelId,
  customMake,
  customModel,
  onChange,
  error,
  placeholder = "ابحث عن الماركة: هيونداي، كيا، تويوتا...",
  modelPlaceholder,
  label = "الماركة *",
  showAllBrands = false,
  bodyFilter = "all",
}: {
  /** قائمة الماركات (سيارات افتراضياً، أو ماركات الهواتف) */
  brands?: typeof BRANDS;
  placeholder?: string;
  modelPlaceholder?: string;
  label?: string;
  brandId: string;
  modelId: string;
  customMake?: string;
  customModel?: string;
  onChange: (patch: { brandId?: string; modelId?: string; customMake?: string; customModel?: string }) => void;
  error?: string;
  /** عرض كل الماركات دفعة واحدة (بدون بحث) */
  showAllBrands?: boolean;
  /** حصر الماركات والطرازات في نوع هيكل محدد (سيارات) */
  bodyFilter?: BodyTypeId | "all";
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(showAllBrands);
  const [collapsed, setCollapsed] = useState(Boolean(brandId));

  useEffect(() => {
    if (!brandId) {
      setCollapsed(false);
    }
  }, [brandId]);

  /* الماركات التي لها طرازات في نوع الهيكل المختار */
  const scoped = useMemo(() => {
    if (bodyFilter === "all") return brands;
    const withModels = brands.filter((b) =>
      b.models.some((m) => bodyTypeOfModel(b.id, m) === bodyFilter)
    );
    return withModels.length ? withModels : brands;
  }, [brands, bodyFilter]);

  const filtered = useMemo(() => {
    if (!query.trim()) return scoped;
    const q = query.trim();
    const qn = normalizeArabic(q);
    return scoped.filter(
      (b) =>
        brandMatches(b, q) ||
        normalizeArabic([b.name, b.en, ...(b.alt ?? [])].filter(Boolean).join(" ")).includes(qn)
    );
  }, [query, scoped]);

  const isOther = brandId === "other" || brandId === "other-phone";

  /* الماركات الأكثر طلباً — للمركبات: هيونداي ، كيا ، مرسيدس ، تويوتا ، جي أم سي ، شيفروليه ، مازدا ، جيب ، سكودا */
  const popular = useMemo(() => {
    if (brands === PHONE_BRANDS) {
      return scoped
        .filter((b) => b.models.some((m) => m.hot))
        .sort((a, b) => b.models.filter((m) => m.hot).length - a.models.filter((m) => m.hot).length)
        .slice(0, 7);
    }
    const popularIds = [
      "hyundai",
      "kia",
      "mercedes",
      "toyota",
      "gmc",
      "chevrolet",
      "mazda",
      "jeep",
      "skoda",
    ];
    return popularIds
      .map((id) => brands.find((b) => b.id === id))
      .filter((b): b is NonNullable<typeof b> => Boolean(b));
  }, [brands, scoped]);

  const visibleBrands =
    expanded || query.trim() || brands.length <= 24 ? filtered : filtered.slice(0, 12);

  const selectedBrandObj = brands.find((b) => b.id === brandId);
  const selectedBrandName = isOther
    ? customMake || (brands === PHONE_BRANDS ? "ماركة هاتف أخرى" : "ماركة أخرى")
    : selectedBrandObj?.name || brandId;

  return (
    <div data-error={Boolean(error)}>
      <label className="label">{label}</label>

      {/* نظام طي بقية الاختيارات عند تحديد الماركة */}
      {collapsed && brandId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amberBrand-500/30 bg-amberBrand-50/50 p-3.5 dark:border-amberBrand-500/20 dark:bg-amberBrand-950/20">
          <div className="flex items-center gap-3">
            <BrandIcon brandId={brandId} size={38} />
            <div>
              <span className="text-[11px] font-bold text-amberBrand-700 dark:text-amberBrand-400">
                ✓ الماركة المختارة
              </span>
              <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                {selectedBrandName}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="btn-ghost btn-sm text-navy-700 hover:bg-white dark:text-navy-200 dark:hover:bg-navy-800"
          >
            تغيير الماركة ↻
          </button>
        </div>
      ) : (
        <>
          {/* بحث سريع عن الماركة */}
          <div className="relative mb-3">
            <Search
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="input pr-9"
            />
          </div>

          {/* اختصارات: الأكثر طلباً */}
          {!query.trim() && !expanded && popular.length > 1 && (
            <div className="mb-3 rounded-xl border-2 border-dashed border-amberBrand-300 p-2.5 dark:border-amberBrand-500/40">
              <p className="mb-1.5 text-[11px] font-extrabold text-amberBrand-700 dark:text-amberBrand-400">
                🔥 الأكثر طلباً
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popular.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => {
                      onChange({ brandId: b.id, modelId: "" });
                      setCollapsed(true);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 text-[11.5px] font-bold transition",
                      brandId === b.id
                        ? "border-amberBrand-500 bg-amberBrand-50 text-amberBrand-700 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
                        : "border-navy-200 bg-white text-navy-700 hover:border-amberBrand-400 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                    )}
                  >
                    <BrandIcon brandId={b.id} size={20} plain />
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {visibleBrands.map((b) => {
              const active = brandId === b.id;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => {
                    onChange({ brandId: b.id, modelId: "" });
                    setCollapsed(true);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-2.5 transition",
                    active
                      ? "border-amberBrand-500 bg-amberBrand-50 dark:border-amberBrand-500 dark:bg-amberBrand-500/10"
                      : "border-navy-100 hover:border-amberBrand-300 dark:border-navy-800 dark:hover:border-amberBrand-500/40"
                  )}
                >
                  <BrandIcon brandId={b.id} size={38} />
                  <span className="line-clamp-1 text-[11px] font-bold text-navy-700 dark:text-navy-100">
                    {b.name}
                  </span>
                </button>
              );
            })}
          </div>

          {!expanded && !query && filtered.length > 24 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 text-[11.5px] font-bold text-amberBrand-600 hover:underline dark:text-amberBrand-400"
            >
              عرض كل الماركات ({filtered.length}) ↓
            </button>
          )}
        </>
      )}

      {error && <p className="error-text">{error}</p>}

      {/* ------------------------------ كتابة الموديل يدوياً ------------------------------ */}
      {brandId && !isOther && (
        <div className="mt-4 rounded-2xl border border-navy-100 bg-navy-50/40 p-3.5 dark:border-navy-800 dark:bg-navy-900/50">
          <div className="mb-2 flex items-center gap-2">
            <BrandIcon brandId={brandId} size={26} />
            <p className="text-[12.5px] font-extrabold text-navy-800 dark:text-navy-50">
              موديل {selectedBrandName}
            </p>
            {(customModel || modelId) && (
              <span className="badge ms-auto bg-emeraldBrand-50 text-emeraldBrand-700 dark:bg-emeraldBrand-500/10 dark:text-emeraldBrand-400">
                <CheckCircle2 size={11} /> تم إدخال الموديل
              </span>
            )}
          </div>

          <div>
            <label className="label">اكتب اسم الموديل يدوياً *</label>
            <input
              type="text"
              value={customModel || modelId || ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ customModel: val, modelId: val });
              }}
              placeholder={
                modelPlaceholder ||
                (brands === PHONE_BRANDS
                  ? "مثال: 15 برو ماكس، S24 ألترا، نوت 13 برو، رينو 11..."
                  : "مثال: أفانتي، توسان، سنتافي، كورولا، كيا سيراتو، لانسر...")
              }
              className="input bg-white dark:bg-navy-900"
            />
            <p className="mt-1 text-[11px] text-navy-400">
              أدخل الموديل كتابةً بحرية كما هو متعارف عليه في السوق المحلي.
            </p>
          </div>
        </div>
      )}

      {/* ماركة أخرى — كتابة يدوية */}
      {isOther && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-navy-100 p-3 sm:grid-cols-2 dark:border-navy-800">
          <div>
            <label className="label">اكتب اسم الماركة *</label>
            <input
              value={customMake ?? ""}
              onChange={(e) => onChange({ customMake: e.target.value })}
              placeholder={
                brands === PHONE_BRANDS
                  ? "مثال: تكنو، ون بلس، جوجل بكسل..."
                  : "اكتب اسم الماركة (مثال: شيري، فوتون، جيتور...)"
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">اكتب الموديل *</label>
            <input
              value={customModel || modelId || ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ customModel: val, modelId: val });
              }}
              placeholder={
                modelPlaceholder ||
                (brands === PHONE_BRANDS ? "مثال: سبارك 20، بكسل 8..." : "اكتب الموديل...")
              }
              className="input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
