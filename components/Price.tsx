"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { compactMoney, formatNumber } from "@/lib/currency";
import type { Currency } from "@/lib/types";

/* ==========================================================================
   عرض السعر بالعملتين-  السعر الأساسي بعملة العرض المختارة،
   وتحته السعر المعادل بالعملة الأخرى (متطلب "كل إعلان يعرض السعرين").
   ========================================================================== */

export default function Price({
  priceUsd,
  priceSyp,
  size = "md",
  showBoth = true,
  suffix,
  className = "",
}: {
  priceUsd: number;
  priceSyp: number;
  size?: "sm" | "md" | "lg";
  showBoth?: boolean;
  suffix?: string; // مثال: / شهرياً
  className?: string;
}) {
  const { currency } = useStore();
  const primary: Currency = currency;
  const secondary: Currency = currency === "USD" ? "SYP" : "USD";

  const main = compactMoney(primary === "USD" ? priceUsd : priceSyp, primary);
  const alt = compactMoney(secondary === "USD" ? priceUsd : priceSyp, secondary);

  const sizeCls =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
        ? "text-sm"
        : "text-lg sm:text-xl";

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={`font-extrabold tracking-tight text-navy-900 dark:text-white ${sizeCls}`}>
          {main}
        </span>
        {suffix && (
          <span className="text-xs font-semibold text-navy-400 dark:text-navy-300">{suffix}</span>
        )}
      </div>
      {showBoth && (
        <span
          className="mt-0.5 text-[11px] font-semibold text-navy-400 dark:text-navy-400"
          title="السعر المعادل بالعملة الأخرى"
        >
          ≈ {alt}
        </span>
      )}
    </div>
  );
}

/** سعر مبسّط في سطر واحد — للجداول ولوحة التحكم */
export function InlinePrice({
  priceUsd,
  priceSyp,
  className = "",
}: {
  priceUsd: number;
  priceSyp: number;
  className?: string;
}) {
  const { currency } = useStore();
  return (
    <span className={className}>
      <span className="font-bold">
        {currency === "USD"
          ? `$ ${formatNumber(priceUsd)}`
          : `${formatNumber(priceSyp)} ل.س`}
      </span>
      <span className="mx-1 text-navy-300">|</span>
      <span className="text-xs text-navy-400">
        {currency === "USD"
          ? `${formatNumber(priceSyp)} ل.س`
          : `$ ${formatNumber(priceUsd)}`}
      </span>
    </span>
  );
}
