"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { MAIN_CATEGORIES, dealTypesFor, JOB_KINDS, RENTABLE } from "@/lib/taxonomy";
import { themeOf } from "@/lib/theme";
import type { MainCategory } from "@/lib/types";
import CategoryTile from "./CategoryIcon";
import { cn } from "@/lib/currency";

/** رأس صفحة التصنيف — يعمل للتصنيفات الستّة كلها */
export default function CategoryHeader({ slug }: { slug: MainCategory }) {
  const { publicAds } = useStore();
  const meta = MAIN_CATEGORIES.find((c) => c.id === slug)!;
  const theme = themeOf(slug);

  const ads = publicAds.filter((a) => a.category === slug);
  const rentable = RENTABLE.includes(slug);
  const sale = ads.filter((a) => !a.dealType || a.dealType === "sale").length;
  const rent = ads.filter((a) => a.dealType?.startsWith("rent")).length;

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
            <CategoryTile id={slug} size={56} iconSize={26} />
            <div>
              <h1 className="text-xl font-extrabold text-navy-900 dark:text-white sm:text-2xl">
                {meta.name} في منبج
              </h1>
              <p className="mt-0.5 text-[12.5px] text-navy-500 dark:text-navy-300">{meta.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Stat label="إجمالي الإعلانات" value={ads.length} />
            {rentable && (
              <>
                <Stat label="للبيع" value={sale} tone="emerald" />
                <Stat label="للإيجار" value={rent} tone="amber" />
              </>
            )}
            {slug === "jobs" && (
              <>
                <Stat
                  label={JOB_KINDS[0].name}
                  value={ads.filter((a) => a.jobKind !== "seek").length}
                  tone="emerald"
                />
                <Stat
                  label={JOB_KINDS[1].name}
                  value={ads.filter((a) => a.jobKind === "seek").length}
                  tone="amber"
                />
              </>
            )}
          </div>
        </div>

        {/* اختصارات سريعة لكل تصنيف */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Link
            href={`/category/${slug}`}
            className={cn("chip border", theme.border, theme.soft, "font-bold")}
          >
            كل {meta.name}
          </Link>
          {rentable &&
            dealTypesFor(slug).map((d) => (
              <Link
                key={d.id}
                href={`/category/${slug}?deal=${d.id}`}
                className="chip border border-navy-200 font-bold text-navy-600 transition hover:border-amberBrand-400 dark:border-navy-700 dark:text-navy-200"
              >
                {d.name}
              </Link>
            ))}
          {slug === "vehicles" && (
            <Link
              href="/category/vehicles?sort=year-desc"
              className="chip border border-navy-200 font-bold text-navy-600 transition hover:border-amberBrand-400 dark:border-navy-700 dark:text-navy-200"
            >
              الأحدث صنعاً
            </Link>
          )}
          {slug === "jobs" &&
            JOB_KINDS.map((k) => (
              <Link
                key={k.id}
                href={`/category/jobs?jobkind=${k.id}`}
                className="chip border border-navy-200 font-bold text-navy-600 transition hover:border-amberBrand-400 dark:border-navy-700 dark:text-navy-200"
              >
                {k.name}
              </Link>
            ))}
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
