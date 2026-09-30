import React from "react";

/** شعار بديل — رسم SVG خفيف (لا يحتاج أي ملف خارجي) */
export default function Logo({
  size = 40,
  showText = true,
  tagline = false,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="shrink-0 drop-shadow-sm"
      >
        <rect width="64" height="64" rx="15" fill="#0F172A" />
        <path
          d="M20 24h18l-4.6-4.6 3.2-3.2 9.4 9.3-9.4 9.3-3.2-3.2L38 27H20z"
          fill="#F59E0B"
        />
        <path
          d="M44 40H26l4.6 4.6-3.2 3.2L18 38.5l9.4-9.3 3.2 3.2L26 37h18z"
          fill="#059669"
        />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-navy-900 dark:text-white">
            بديل
          </span>
          {tagline ? (
            <span className="mt-1 text-[11px] font-medium text-navy-400 dark:text-navy-300">
              خيارك الأفضل للبيع والشراء في منبج
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-amberBrand-500">
              Badeel
            </span>
          )}
        </span>
      )}
    </span>
  );
}
