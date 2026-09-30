"use client";

import React from "react";
import Link from "next/link";
import { Building2, Car, ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";

/** رأس صفحة التصنيف — صورة/تدرّج + عدّادات سريعة */
export default function CategoryHeader({
  slug,
}: {
  slug: "real-estate" | "vehicles";
}) {
  const { publicAds } = useStore();
  const meta = MAIN_CATEGORIES.find((c) => c.id === slug)!;
  const isRe = slug === "real-estate";
  const Icon = isRe ? Building2 : Car;

  const ads = publicAds.filter((a) => a.category === slug);
  const sale = ads.filter((a) => !a.dealType || a.dealType === "sale").length;
  const rent = ads.filter((a) => a.dealType === "rent-monthly" || a.dealType === "rent-yearly").length;

  return (
    <div className="border-b border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-950">
      <div className="container-page py-6">
        <nav className="mb-3 flex items-center gap-1.5 text-[12px] text-navy-400">
          <Link href="/" className="hover:text-amberBrand-600">
            الرئيسية
          </Link>
          <ChevronLeft size={13} />
          <span className="font-semibold text-navy-600 dark:text-navy-200">{meta.name}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm ${
                isRe ? "from-emeraldBrand-500 to-emeraldBrand-700" : "from-amberBrand-500 to-amberBrand-700"
              }`}
            >
              <Icon size={26} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-navy-900 dark:text-white sm:text-2xl">
                {meta.name} في منبج
              </h1>
              <p className="mt-0.5 text-[12.5px] text-navy-500 dark:text-navy-300">{meta.tagline}</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Stat label="إجمالي الإعلانات" value={ads.length} />
            <Stat label={isRe ? "للبيع" : "معروضة"} value={sale} tone="emerald" />
            {isRe && <Stat label="للإيجار" value={rent} tone="amber" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: number;
  tone?: "navy" | "emerald" | "amber";
}) {
  const cls =
    tone === "emerald"
      ? "border-emeraldBrand-200 bg-emeraldBrand-50 text-emeraldBrand-700 dark:border-emeraldBrand-500/30 dark:bg-emeraldBrand-500/10 dark:text-emeraldBrand-400"
      : tone === "amber"
        ? "border-amberBrand-200 bg-amberBrand-50 text-amberBrand-700 dark:border-amberBrand-500/30 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
        : "border-navy-100 bg-navy-50 text-navy-700 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-100";
  return (
    <div className={`rounded-xl border px-3.5 py-2 text-center ${cls}`}>
      <p className="text-base font-extrabold">{value}</p>
      <p className="text-[10.5px] font-semibold opacity-80">{label}</p>
    </div>
  );
}
