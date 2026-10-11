"use client";

import React from "react";
import { ALL_BRANDS, brandById } from "@/lib/brands";
import { cn } from "@/lib/currency";

/* ==========================================================================
   أيقونة ماركة السيارة — شعار نصي (Monogram) بلون الماركة الرسمي.
   بدل ملفات الشعارات المحميّة بحقوق تجارية: أوضح للعربية، أخفّ حجماً،
   وتعمل بلا إنترنت ودون أي طلب خارجي.
   ========================================================================== */

export default function BrandIcon({
  brandId,
  size = 40,
  withName = false,
  className = "",
}: {
  brandId?: string;
  size?: number;
  withName?: boolean;
  className?: string;
}) {
  const brand = brandById(brandId) ?? ALL_BRANDS[ALL_BRANDS.length - 1];
  const fontSize = brand.monogram.length > 2 ? size * 0.32 : size * 0.44;

  return (
    <span className={cn("inline-flex flex-col items-center gap-1", className)}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-xl font-extrabold shadow-sm ring-1 ring-black/5"
        style={{
          width: size,
          height: size,
          background: brand.color,
          color: brand.text ?? "#FFFFFF",
          fontSize,
          letterSpacing: "-0.02em",
        }}
        title={`${brand.name} — ${brand.en}`}
        aria-label={brand.name}
      >
        {brand.monogram}
      </span>
      {withName && (
        <span className="text-[10.5px] font-bold leading-tight text-navy-600 dark:text-navy-200">
          {brand.name}
        </span>
      )}
    </span>
  );
}
