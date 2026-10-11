"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { BRANDS, brandMatches, brandModels } from "@/lib/brands";
import { cn } from "@/lib/currency";
import { normalizeArabic } from "@/lib/filters";
import BrandIcon from "./BrandIcon";

/* ==========================================================================
   اختيار ماركة السيارة وموديلها
   - شبكة أيقونات لكل الماركات (+ ماركة أخرى بكتابة يدوية)
   - بعد اختيار الماركة تظهر موديلاتها (منسدلة + شرائح)
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
  label = "الماركة *",
  showAllBrands = false,
}: {
  /** قائمة الماركات (سيارات افتراضياً، أو ماركات الهواتف) */
  brands?: typeof BRANDS;
  placeholder?: string;
  label?: string;
  brandId: string;
  modelId: string;
  customMake?: string;
  customModel?: string;
  onChange: (patch: { brandId?: string; modelId?: string; customMake?: string; customModel?: string }) => void;
  error?: string;
  /** عرض كل الماركات دفعة واحدة (بدون بحث) */
  showAllBrands?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(showAllBrands);

  const filtered = useMemo(() => {
    if (!query.trim()) return brands;
    const q = query.trim();
    const qn = normalizeArabic(q);
    return brands.filter(
      (b) =>
        brandMatches(b, q) ||
        normalizeArabic([b.name, b.en, ...(b.alt ?? [])].filter(Boolean).join(" ")).includes(qn)
    );
  }, [query, brands]);

  const models = brands.find((b) => b.id === brandId)?.models ?? brandModels(brandId);
  const isOther = brandId === "other" || brandId === "other-phone";
  const visibleBrands = expanded || query.trim() ? filtered : filtered.slice(0, 8);

  return (
    <div data-error={Boolean(error)}>
      <label className="label">{label}</label>

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

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {visibleBrands.map((b) => {
          const active = brandId === b.id;
          return (
            <button
              type="button"
              key={b.id}
              onClick={() => onChange({ brandId: b.id, modelId: "" })}
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

      {!expanded && !query && filtered.length > 8 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-[11.5px] font-bold text-amberBrand-600 hover:underline dark:text-amberBrand-400"
        >
          عرض كل الماركات ({filtered.length}) ↓
        </button>
      )}

      {error && <p className="error-text">{error}</p>}

      {/* ------------------------------ الموديلات ------------------------------ */}
      {brandId && !isOther && (
        <div className="mt-4 rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
          <div className="flex items-center gap-2">
            <BrandIcon brandId={brandId} size={26} />
            <p className="text-[12.5px] font-extrabold text-navy-800 dark:text-navy-50">
              موديلات {filtered.find((b) => b.id === brandId)?.name}
            </p>
            {modelId && (
              <span className="badge ms-auto bg-emeraldBrand-50 text-emeraldBrand-700 dark:bg-emeraldBrand-500/10 dark:text-emeraldBrand-400">
                <CheckCircle2 size={11} /> تم اختيار الموديل
              </span>
            )}
          </div>

          <div className="mt-3">
            <label className="label">الموديل *</label>
            <select
              value={modelId}
              onChange={(e) => onChange({ modelId: e.target.value })}
              className="select"
            >
              <option value="">— اختر الموديل —</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.en ? `(${m.en})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {models.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => onChange({ modelId: m.id })}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold transition",
                  modelId === m.id
                    ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                    : "border border-navy-200 text-navy-600 hover:border-amberBrand-400 dark:border-navy-700 dark:text-navy-200"
                )}
              >
                {m.name}
              </button>
            ))}
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
              placeholder="مثال: سوزوكي، شيري، فيات..."
              className="input"
            />
          </div>
          <div>
            <label className="label">اكتب الموديل *</label>
            <input
              value={customModel ?? ""}
              onChange={(e) => onChange({ customModel: e.target.value })}
              placeholder="مثال: سويفت، تيجو، 132..."
              className="input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
