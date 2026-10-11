import React from "react";

/* ==========================================================================
   أيقونات أنواع السيارات — مرسومة داخل المشروع (SVG) بمنظر جانبي واضح
   لكل نوع شكل مميّز: سيدان، هاتشباك، SUV، كوبيه، بيك أب، فان، باص، شاحنة،
   دراجة، سكوتر، جرار، آليات ثقيلة.
   ========================================================================== */

export type BodyIconKey =
  | "sedan" | "hatchback" | "suv" | "coupe" | "pickup" | "van"
  | "bus" | "truck" | "motorcycle" | "scooter" | "tractor" | "machinery" | "other";

const S = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    {/* الخط الأرضي */}
    <line x1="2" y1="21.6" x2="46" y2="21.6" stroke="currentColor" strokeWidth="0.8" opacity="0.35" strokeLinecap="round" />
  </>
);

/** عجلة: إطار + جنط */
const Wheel = ({ cx, cy, r = 3 }: { cx: number; cy: number; r?: number }) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill="currentColor" />
    <circle cx={cx} cy={cy} r={r * 0.42} className="body-icon-hub" />
  </>
);

const icons: Record<BodyIconKey, React.ReactNode> = {
  /* سيدان: ثلاثة صناديق (محرك — مقصورة — صندوق) */
  sedan: (
    <S>
      <path d="M3 16.4c0-2 1.6-3.3 4.4-3.7l4.3-3.5c1.6-1.3 3.2-1.9 5.4-1.9h4.2c2 0 3.3.6 4.4 1.9l2.9 3.4c2.5.5 4.4 1.8 4.4 3.8v1.4c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6Z" />
      <path d="M11.4 10.2c1.1-.9 2.2-1.3 3.9-1.3h2.3c1.5 0 2.4.4 3.2 1.3l1.6 1.9h-12Z" className="body-icon-glass" />
      <Wheel cx={12} cy={19.6} r={3.1} />
      <Wheel cx={35} cy={19.6} r={3.1} />
    </S>
  ),
  /* هاتشباك: خلفية منحدرة بلا صندوق */
  hatchback: (
    <S>
      <path d="M3 16.2c0-2 1.5-3.3 4.2-3.8l3.7-4c1.8-1.9 3.8-2.7 6.6-2.7h6.2c2.8 0 4.6 1 5.6 2.6l3.2 4.6c2.3.5 3.5 1.7 3.5 3.5v1.6c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6Z" />
      <path d="M11.6 9.6c1.4-1.3 2.8-1.8 4.8-1.8h3.6c1.5 0 2.5.5 3.2 1.6l2 2.9H9.4Z" className="body-icon-glass" />
      <Wheel cx={12} cy={19.4} r={3.1} />
      <Wheel cx={34.6} cy={19.4} r={3.1} />
    </S>
  ),
  /* رباعية الدفع: مرتفعة، سقف مستوٍ، عجلات كبيرة */
  suv: (
    <S>
      <path d="M3 15.6V13c0-1.7 1.3-3 2.8-3.2l2-3.6c1.2-2 3-3 5.4-3h11.6c2.4 0 4.2 1 5.4 3l1.5 2.8c1.7.2 2.9 1.4 2.9 3v3.2c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6Z" />
      <path d="M9.4 9.4c.9-1.4 2-2 3.6-2h9c1.4 0 2.4.5 3.2 1.6l1.8 2.6H8.2Z" className="body-icon-glass" />
      <path d="M10.6 5.4h13" stroke="#fff" strokeWidth="0.9" opacity="0.5" strokeLinecap="round" className="body-icon-glass" />
      <Wheel cx={12.5} cy={19.4} r={3.5} />
      <Wheel cx={35.5} cy={19.4} r={3.5} />
    </S>
  ),
  /* كوبيه: خط سقف منخفض منساب */
  coupe: (
    <S>
      <path d="M3 16.8c0-2 1.7-3.3 4.6-3.6l7.4-3.9c2.1-1.1 3.9-1.6 6.2-1.6 2.6 0 4.4.7 5.8 2.1l2.4 2.5c2.2.4 4.6 1.6 4.6 3.4v1.2c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6Z" />
      <path d="M13.2 10.1c1.8-.9 3.3-1.3 5.3-1.3 1.9 0 3.2.5 4.3 1.6l1.6 1.7H11.6Z" className="body-icon-glass" />
      <Wheel cx={12.4} cy={19.8} r={2.9} />
      <Wheel cx={35.2} cy={19.8} r={2.9} />
    </S>
  ),
  /* بيك أب: مقصورة + صندوق مفتوح */
  pickup: (
    <S>
      <path d="M3 15.8c0-1.9 1.5-3.1 3.9-3.5l1.6-3.1c1-1.9 2.6-2.9 4.8-2.9h6.4c1.7 0 2.7.7 3.4 2.1l.9 1.9h14.4c1.7 0 2.6.9 2.6 2.5v3.6c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6Z" />
      <path d="M9.6 9.9c.7-1.2 1.5-1.7 2.9-1.7h5.2c1 0 1.6.4 2 1.2l1 1.9H8.9Z" className="body-icon-glass" />
      <path d="M24 9.3h16.5" stroke="#fff" strokeWidth="1" opacity="0.45" strokeLinecap="round" className="body-icon-glass" />
      <Wheel cx={11.6} cy={19.6} r={3.3} />
      <Wheel cx={35.6} cy={19.6} r={3.3} />
    </S>
  ),
  /* فان: صندوقي مرتفع بنوافذ جانبية */
  van: (
    <S>
      <path d="M2.6 15.4V8.6c0-2.2 1.5-3.8 3.7-3.8h25.4c3 0 5.2.9 7.1 2.9l4.2 4.4c1.6 1.6 2.4 3 2.4 4.6v1.3c0 .9-.7 1.6-1.6 1.6H4.2c-.9 0-1.6-.7-1.6-1.6Z" />
      <path d="M6.6 7.3h9.2v5.5H6.6Z" className="body-icon-glass" />
      <path d="M18.2 7.3h9.4c1.6 0 2.9.5 4 1.6l1.9 2H18.2Z" className="body-icon-glass" />
      <Wheel cx={11.5} cy={19.4} r={3.3} />
      <Wheel cx={35.5} cy={19.4} r={3.3} />
    </S>
  ),
  /* باص: طويل بنوافذ متعددة */
  bus: (
    <S>
      <path d="M2.4 15.6V8.2c0-2.4 1.7-4 4.2-4h30.8c2.5 0 4.2 1.6 4.2 4v7.4c0 .9-.7 1.6-1.6 1.6H4c-.9 0-1.6-.7-1.6-1.6Z" />
      <g className="body-icon-glass">
        <rect x="4.4" y="6.4" width="6.4" height="4.6" rx="0.8" />
        <rect x="12.6" y="6.4" width="6.4" height="4.6" rx="0.8" />
        <rect x="20.8" y="6.4" width="6.4" height="4.6" rx="0.8" />
        <rect x="29" y="6.4" width="6.4" height="4.6" rx="0.8" />
      </g>
      <Wheel cx={10.5} cy={19.4} r={3.2} />
      <Wheel cx={36.5} cy={19.4} r={3.2} />
    </S>
  ),
  /* شاحنة: مقصورة + صندوق نقل */
  truck: (
    <S>
      <path d="M2.6 15.8v-3c0-1.6 1.1-2.8 2.7-3l2.2-3.8c1-1.7 2.5-2.6 4.6-2.6h4.4c1.6 0 2.6.7 3.2 2l1.1 2.1h.9c1.9 0 3.2 1.2 3.2 3.1v4.2c0 .9-.7 1.6-1.6 1.6H4.2c-.9 0-1.6-.7-1.6-1.6Z" />
      <path d="M9.6 7.9h4.3c1 0 1.6.4 2 1.2l1.4 2.6H8.5Z" className="body-icon-glass" />
      <rect x="27" y="4.6" width="18.4" height="12.6" rx="1.4" className="body-icon-cargo" />
      <Wheel cx={10.6} cy={19.4} r={3.3} />
      <Wheel cx={22.4} cy={19.4} r={3.3} />
      <Wheel cx={38} cy={19.4} r={3.3} />
    </S>
  ),
  /* دراجة نارية */
  motorcycle: (
    <S>
      <circle cx="9.4" cy="17.4" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="38.6" cy="17.4" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.4 17.4h6.2l4.2-5.6h7.6M22.6 17.4h16" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M19.8 11.8h6.8c1.6 0 2.8 1 3.6 2.6l1.6 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M27.4 8.6h5.4l2.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12.6 12.6c1.4-1.1 3-1.6 4.8-1.6h3.4l-2 3.4" />
    </S>
  ),
  /* سكوتر / دراجة كهربائية */
  scooter: (
    <S>
      <circle cx="11" cy="18.6" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="37" cy="18.6" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 18.6h7.6l3-6.4h9.6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M21.6 18.6h15.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M25.4 8.2h6.2c1.2 0 2 .8 2 2v2.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M33.6 5.4l2.6 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.6 12.4h5.4l1.2 2.6" />
    </S>
  ),
  /* جرار زراعي: عجلة خلفية كبيرة */
  tractor: (
    <S>
      <circle cx="33.4" cy="14.6" r="6.6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="33.4" cy="14.6" r="2.2" />
      <circle cx="11.4" cy="18.2" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9.6 13.4h6.6l1.6-3.2h7.6v6.4h6.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.6 6.6h6.2v3.6h-6.2Z" className="body-icon-glass" />
      <path d="M24.8 7.8h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M31.4 9.4v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </S>
  ),
  /* آليات ثقيلة: حفارة بجنزير وذراع */
  machinery: (
    <S>
      <rect x="4" y="16.4" width="20" height="4.4" rx="2.2" fill="currentColor" />
      <circle cx="9" cy="18.6" r="1.1" className="body-icon-hub" />
      <circle cx="15" cy="18.6" r="1.1" className="body-icon-hub" />
      <circle cx="20.6" cy="18.6" r="1.1" className="body-icon-hub" />
      <path d="M7.4 16.2v-3.6c0-1.2.9-2.2 2.2-2.2h8.2c1.2 0 2.2 1 2.2 2.2v3.6Z" />
      <path d="M9.4 11.2h7.4v3.4H9.4Z" className="body-icon-glass" />
      <path d="M18.6 11.4l7.6-4.6c.9-.6 2 .4 1.5 1.3l-4 6.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M24.4 8.4l9.2 2.6c1 .3 1 1.7-.1 1.9l-6.4 1.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M39.4 9.4c1.6.4 2.6 1.6 2.6 3.2 0 1.7-1.2 3-3 3.2l-3.6.4 1.4-7.2Z" />
    </S>
  ),
  /* أخرى */
  other: (
    <S>
      <path d="M3 16.4c0-2 1.6-3.3 4.4-3.7l4.3-3.5c1.6-1.3 3.2-1.9 5.4-1.9h4.2c2 0 3.3.6 4.4 1.9l2.9 3.4c2.5.5 4.4 1.8 4.4 3.8v1.4c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6Z" opacity="0.55" />
      <text x="24" y="13.4" textAnchor="middle" fontSize="7" fontWeight="800" fill="currentColor" opacity="0.75">؟</text>
      <Wheel cx={12} cy={19.6} r={3.1} />
      <Wheel cx={35} cy={19.6} r={3.1} />
    </S>
  ),
};

export default function VehicleBodyIcon({
  type,
  size = 48,
  className = "",
  title,
}: {
  type: BodyIconKey;
  size?: number;
  className?: string;
  title?: string;
}) {
  const height = size / 2;
  return (
    <svg
      viewBox="0 0 48 24"
      width={size}
      height={height}
      className={className}
      role="img"
      aria-label={title ?? type}
    >
      {title ? <title>{title}</title> : null}
      {icons[type] ?? icons.other}
    </svg>
  );
}
