"use client";

import React from "react";
import { brandById } from "@/lib/brands";
import { LOGOS } from "@/lib/logos";
import { cn } from "@/lib/currency";

/* ==========================================================================
   أيقونة الماركة — تُستخدم أيقونة/شعار الماركة الرسمي (SVG مضمّن بدقة 24×24)
   وإن لم يتوفر شعار رسمي تُستخدم أيقونة حرفية (Monogram) بلون الماركة.
   ========================================================================== */

export default function BrandIcon({
  brandId,
  size = 40,
  withName = false,
  className = "",
  plain = false,
}: {
  brandId?: string;
  size?: number;
  withName?: boolean;
  className?: string;
  /** بدون إطار مربّع — الشعار فقط بلونه الرسمي */
  plain?: boolean;
}) {
  const brand = brandById(brandId);
  const logo = brand?.logo ? LOGOS[brand.logo] : undefined;
  const color = brand?.logoColor ?? brand?.color ?? "#334155";

  if (plain && logo) {
    return (
      <span className={cn("inline-flex flex-col items-center gap-1", className)}>
        <span
          style={{ width: size, height: size, color }}
          className="inline-flex items-center justify-center"
          role="img"
          aria-label={brand?.name}
          title={`${brand?.name} — ${brand?.en}`}
        >
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
            <g dangerouslySetInnerHTML={{ __html: logo.body }} />
          </svg>
        </span>
        {withName && (
          <span className="text-[10.5px] font-bold leading-tight text-navy-600 dark:text-navy-200">
            {brand?.name}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-center gap-1", className)}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5"
        style={{
          width: size,
          height: size,
          background: logo ? "#FFFFFF" : color,
          color: logo ? color : brand?.text ?? "#FFFFFF",
        }}
        role="img"
        aria-label={brand?.name}
        title={`${brand?.name} — ${brand?.en}`}
      >
        {logo ? (
          <svg
            viewBox="0 0 24 24"
            width={size * 0.68}
            height={size * 0.68}
            fill="currentColor"
            aria-hidden="true"
          >
            <g dangerouslySetInnerHTML={{ __html: logo.body }} />
          </svg>
        ) : (
          <span
            className="font-extrabold"
            style={{
              fontSize: (brand?.monogram.length ?? 1) > 2 ? size * 0.3 : size * 0.42,
              letterSpacing: "-0.02em",
            }}
          >
            {brand?.monogram ?? "؟"}
          </span>
        )}
      </span>
      {withName && (
        <span className="text-[10.5px] font-bold leading-tight text-navy-600 dark:text-navy-200">
          {brand?.name}
        </span>
      )}
    </span>
  );
}
