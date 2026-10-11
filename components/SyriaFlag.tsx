import React from "react";

/* ==========================================================================
   علم سوريا (النسخة الحالية المعتمدة):
   شريط أخضر أعلى — شريط أبيض في الوسط فيه ثلاث نجمات حمراء خماسية — شريط أسود أسفل.
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
      {/* الأشرطة: أخضر أعلى — أبيض وسط — أسود أسفل */}
      <rect width="30" height="6.67" fill="#0E7A3C" />
      <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
      <rect y="13.33" width="30" height="6.67" fill="#000000" />
      {/* ثلاث نجمات حمراء خماسية في وسط الشريط الأبيض */}
      <g fill="#CE1126">
        {[9, 15, 21].map((cx) => (
          <Star key={cx} cx={cx} cy={10} r={2.3} />
        ))}
      </g>
    </svg>
  );
}

/** نجمة خماسية (خمسة رؤوس) — تُبنى من 10 نقاط بالتبديل بين نصف القطر الخارجي والداخلي */
function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.42;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
  return <polygon points={points} />;
}
