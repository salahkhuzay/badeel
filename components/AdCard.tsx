"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Building,
  Building2,
  Car,
  Eye,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Plug,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
} from "lucide-react";
import type { Ad } from "@/lib/types";
import { useStore } from "@/lib/store";
import { compactMoney, timeAgo } from "@/lib/currency";
import { categoryName } from "@/lib/taxonomy";
import { themeOf } from "@/lib/theme";
import AdArtwork from "@/lib/artwork";
import { hasUploadedPhoto } from "@/lib/artwork";
import { adChips, dealBadge } from "./AdSpecs";
import Price from "./Price";
import StatusBadge from "./StatusBadge";

/* ==========================================================================
   بطاقة الإعلان — تعرض دائماً السعر بالعملتين، حالة الإعلان،
   وأزرار التواصل السريع (واتساب + اتصال مباشر).
   ========================================================================== */

export default function AdCard({ ad, compact = false }: { ad: Ad; compact?: boolean }) {
  const { settings, cityById } = useStore();
  const cityName = cityById(ad.cityId)?.name ?? "منبج";
  const isDone = ad.status === "sold" || ad.status === "rented";

  const waText = encodeURIComponent(
    `مرحباً، أنا مهتم بإعلانك على منصة بديل: ${ad.title}`
  );
  const wa = `https://wa.me/${normalize(ad.sellerWhatsapp, settings.whatsappCountryCode)}?text=${waText}`;
  const tel = `tel:+${normalize(ad.sellerPhone, settings.whatsappCountryCode)}`;

  const img = hasUploadedPhoto(ad) ? ad.images?.[0] : undefined;
  const deal = dealBadge(ad);
  const theme = themeOf(ad.category);

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      {/* الصورة */}
      <Link href={`/ad/${ad.ref}`} className="relative block aspect-[4/3] overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={ad.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <AdArtwork
            ad={ad}
            className="h-full w-full transition duration-500 group-hover:scale-[1.04]"
          />
        )}

        {/* شريط علوي */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            {ad.featured && (
              <span className="badge bg-amberBrand-500 text-navy-900 shadow-sm">
                <Sparkles size={11} /> مميّز
              </span>
            )}
            <span className="badge bg-white/90 text-navy-700 backdrop-blur dark:bg-navy-900/90 dark:text-navy-100">
              {ad.category === "vehicles" && ad.make
                ? `${ad.make}${ad.model ? ` ${ad.model}` : ""}`
                : categoryName(ad.category) + (ad.subtypeLabel ? ` · ${ad.subtypeLabel}` : "")}
            </span>
            {deal && (
              <span className={`badge ${deal.className} shadow-sm`}>{deal.label}</span>
            )}
          </div>
        </div>

        {/* حالة منتهية */}
        {isDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-950/60 backdrop-blur-[1px]">
            <span className="rounded-xl border-2 border-white/70 px-4 py-1.5 text-base font-extrabold text-white">
              {ad.status === "sold" ? "تم البيع" : "تم التأجير"}
            </span>
          </div>
        )}
      </Link>

      {/* المحتوى */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/ad/${ad.ref}`}
            className="line-clamp-2 text-[15px] font-bold leading-snug text-navy-900 transition hover:text-amberBrand-600 dark:text-white"
          >
            {ad.title}
          </Link>
          <StatusBadge status={ad.status} className="shrink-0" />
        </div>

        {!compact && (
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
            {ad.description}
          </p>
        )}

        {/* المواصفات السريعة */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {adChips(ad).map((c) => (
            <Spec key={c.label} icon={c.icon} text={c.value} />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 text-[11.5px] text-navy-400 dark:text-navy-400">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} className="text-amberBrand-500" /> {cityName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={12} /> {ad.views}
          </span>
          <span className="ms-auto" suppressHydrationWarning>
            {timeAgo(ad.publishedAt ?? ad.createdAt)}
          </span>
        </div>

        <div className="divider my-3" />

        {ad.category === "jobs" && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="badge bg-navy-900 text-white dark:bg-white dark:text-navy-900">
              {ad.jobKind === "seek" ? "باحث عن عمل" : "صاحب عمل"}
            </span>
            {(ad.employmentType || ad.experienceYears != null) && (
              <span className="text-[11px] font-semibold text-navy-400">
                {[ad.employmentType === "full-time" ? "دوام كامل" : "", ad.experienceYears != null ? `خبرة ${ad.experienceYears} سنة` : ""]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          {ad.priceOnRequest || (ad.category === "jobs" && !ad.price) ? (
            <span className="text-[15px] font-extrabold text-navy-700 dark:text-navy-100">
              الأجر: يُتفق عليه
            </span>
          ) : (
          <Price
            priceUsd={ad.priceUsd}
            priceSyp={ad.priceSyp}
            size="md"
            suffix={
              ad.dealType === "rent-daily"
                ? "/ يومياً"
                : ad.dealType === "rent-monthly"
                  ? "/ شهرياً"
                  : ad.dealType === "rent-yearly"
                    ? "/ سنوياً"
                    : undefined
            }
          />
          )}
          <div className="flex shrink-0 gap-1.5">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm bg-emeraldBrand-500 text-white hover:bg-emeraldBrand-600 px-2.5"
              title="تواصل عبر واتساب"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">واتساب</span>
            </a>
            <a
              href={tel}
              className="btn btn-sm border border-navy-200 text-navy-700 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-100 dark:hover:bg-navy-800 px-2.5"
              title="اتصال مباشر"
            >
              <Phone size={15} />
            </a>
          </div>
        </div>

        {ad.negotiable && (
          <p className="mt-2 text-[11px] font-semibold text-emeraldBrand-600 dark:text-emeraldBrand-400">
            ✓ السعر قابل للتفاوض
          </p>
        )}
        {ad.status === "rejected" && ad.rejectionReason && (
          <p className="mt-2 rounded-lg bg-rose-50 p-2 text-[11px] text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            سبب الرفض: {ad.rejectionReason}
          </p>
        )}
      </div>
    </article>
  );
}

function Spec({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2 py-1 text-[11px] font-semibold text-navy-600 dark:bg-navy-800 dark:text-navy-200">
      {icon}
      {text}
    </span>
  );
}

function normalize(raw: string, cc = "963") {
  let d = (raw || "").replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = cc + d.slice(1);
  else if (!d.startsWith(cc)) d = cc + d;
  return d;
}

export { normalize as normalizePhoneClient };

/** مبلغ مختصر جاهز للاستخدام في الشرائح */
export const shortPrice = (ad: Ad, currency: "USD" | "SYP") =>
  compactMoney(currency === "USD" ? ad.priceUsd : ad.priceSyp, currency);

/** أيقونة افتراضية لكل تصنيف (عند عدم وجود صورة) */
const CATEGORY_FALLBACK_ICON: Record<string, React.ReactNode> = {
  "real-estate": <Building size={44} />,
  vehicles: <Car size={44} />,
  furniture: <Sofa size={44} />,
  appliances: <Plug size={44} />,
  clothing: <Shirt size={44} />,
  phones: <Smartphone size={44} />,
  jobs: <Briefcase size={44} />,
};

