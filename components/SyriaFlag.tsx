import React from "react";

/* ==========================================================================
   علم سوريا (النسخة الحالية — ثلاث نجوم خضراء على خلفية بيضاء، أشرطة خضراء)
   مرسوم SVG داخل المشروع ليعمل بلا إنترنت وبأي حجم.
   ========================================================================== */

export default function SyriaFlag({
  size = 16,
  className = "",
  title = "سوريا",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const height = (size * 2) / 3; // نسبة العلم 3:2
  return (
    <svg
      viewBox="0 0 30 20"
      width={size}
      height={height}
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="30" height="20" fill="#FFFFFF" />
      <rect width="30" height="6.67" fill="#0E7A3C" />
      <rect y="13.33" width="30" height="6.67" fill="#0E7A3C" />
      {/* ثلاث نجوم خضراء في الوسط */}
      <g fill="#0E7A3C">
        {[9, 15, 21].map((cx) => (
          <Star key={cx} cx={cx} cy={10} r={2.3} />
        ))}
      </g>
    </svg>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.42;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
  return <polygon points={points} />;
}
