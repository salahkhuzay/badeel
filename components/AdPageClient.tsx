"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Eye,
  Fuel,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";
import { categoryIcon } from "@/components/CategoryIcon";
import type { MainCategory } from "@/lib/types";
import { InlinePrice } from "@/components/Price";
import Price from "@/components/Price";
import StatusBadge from "@/components/StatusBadge";
import { adSpecs, dealBadge } from "@/components/AdSpecs";
import AdCard from "@/components/AdCard";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { displayPhone, formatDate, normalizePhone, timeAgo } from "@/lib/currency";
import {
  BODY_CONDITIONS,
  DEAL_TYPES,
  FUEL_TYPES,
  OWNERSHIP_TYPES,
  PLATE_REGIONS,
  PROPERTY_TYPES,
  VEHICLE_TYPES,
  areaUnitName,
  bodyConditionName,
  categoryName,
  dealTypeName,
  fuelTypeName,
  ownershipName,
  plateRegionName,
  propertyTypeName,
  vehicleTypeName,
} from "@/lib/taxonomy";
import AdArtwork from "@/lib/artwork";

export default function AdDetailPage() {
  const params = useParams<{ ref: string }>();
  const ref = decodeURIComponent(String(params?.ref ?? ""));
  const { ads, publicAds, settings, incrementViews, cityById } = useStore();
  const toast = useToast();

  const ad = useMemo(() => ads.find((a) => a.ref === ref), [ads, ref]);
  const [imgIndex, setImgIndex] = useState(0);
  const counted = useRef(false);

  useEffect(() => {
    if (ad && !counted.current && ad.status === "active") {
      counted.current = true;
      incrementViews(ad.id);
    }
  }, [ad, incrementViews]);

  if (!ad) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<AlertTriangle size={26} />}
          title="الإعلان غير موجود"
          desc="قد يكون الرابط غير صحيح أو تم حذف الإعلان من قبل الإدارة."
          action={
            <Link href="/search" className="btn-primary mt-2">
              تصفّح الإعلانات المتاحة
            </Link>
          }
        />
      </div>
    );
  }

  const city = cityById(ad.cityId);
  const cc = settings.whatsappCountryCode;
  const wa = `https://wa.me/${normalizePhone(ad.sellerWhatsapp, cc)}?text=${encodeURIComponent(
    `مرحباً، أنا مهتم بإعلانك على منصة بديل أونلاين: ${ad.title} (رمز الإعلان: ${ad.ref})`
  )}`;
  const tel = `tel:+${normalizePhone(ad.sellerPhone, cc)}`;

  const specs = adSpecs(ad);

  const similar = publicAds
    .filter((a) => a.id !== ad.id && a.category === ad.category && a.status === "active")
    .slice(0, 4);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: ad.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ type: "success", title: "تم نسخ رابط الإعلان" });
      }
    } catch {
      toast({ type: "info", title: "انسخ الرابط يدوياً", desc: url });
    }
  };

  return (
    <div className="container-page py-6">
      {/* مسار التنقل */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-navy-400">
        <Link href="/" className="hover:text-amberBrand-600">
          الرئيسية
        </Link>
        <span>/</span>
        <Link href={`/category/${ad.category}`} className="hover:text-amberBrand-600">
          {categoryName(ad.category)}
          {ad.subtypeLabel ? ` · ${ad.subtypeLabel}` : ""}
        </Link>
        <span>/</span>
        <Link href={`/search?city=${ad.cityId}`} className="hover:text-amberBrand-600">
          {city?.name ?? "منبج"}
        </Link>
        <span>/</span>
        <span className="truncate font-semibold text-navy-600 dark:text-navy-200">{ad.ref}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* =========================== العمود الأيمن =========================== */}
        <div className="space-y-5">
          {/* المعرض */}
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10] bg-navy-100 dark:bg-navy-800">
              {ad.images?.length && !String(ad.images[imgIndex]).startsWith("art:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ad.images[imgIndex]}
                  alt={ad.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AdArtwork
                  ad={ad.images?.length ? { ...ad, images: [ad.images[imgIndex]] } : ad}
                  className="h-full w-full"
                />
              )}

              <div className="absolute right-3 top-3 flex gap-2">
                {ad.featured && (
                  <span className="badge bg-amberBrand-500 text-navy-900 shadow">
                    <Sparkles size={11} /> مميّز
                  </span>
                )}
                <StatusBadge status={ad.status} className="bg-white/95 dark:bg-navy-900/95" />
                {dealBadge(ad) && (
                  <span className={`badge ${dealBadge(ad)!.className} shadow`}>
                    {dealBadge(ad)!.label}
                  </span>
                )}
              </div>
            </div>

            {ad.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {ad.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === imgIndex ? "border-amberBrand-500" : "border-transparent opacity-70"
                    }`}
                  >
                    {src.startsWith("art:") ? (
                      <AdArtwork ad={{ ...ad, images: [src] }} className="h-full w-full" showSky={false} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* العنوان والمواصفات */}
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold leading-snug text-navy-900 dark:text-white sm:text-xl">
                  {ad.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-navy-500 dark:text-navy-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} className="text-amberBrand-500" /> {city?.name ?? "منبج"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye size={13} /> {ad.views} مشاهدة
                  </span>
                  <span>رقم الإعلان: {ad.ref}</span>
                  <span>نُشر {timeAgo(ad.publishedAt ?? ad.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={share} className="btn-icon" title="مشاركة">
                  <Share2 size={16} />
                </button>
                <button onClick={() => window.print()} className="btn-icon no-print" title="طباعة">
                  <Printer size={16} />
                </button>
              </div>
            </div>

            <div className="divider my-4" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-400">
                    {s.icon}
                    {s.label}
                  </p>
                  <p className="mt-1 text-[13.5px] font-bold text-navy-800 dark:text-navy-50">
                    {s.value}
                  </p>
                </div>
              ))}
              {ad.category === "real-estate" && (
                <div className="rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-400">
                    <Tag size={14} /> التفاوض
                  </p>
                  <p className="mt-1 text-[13.5px] font-bold text-navy-800 dark:text-navy-50">
                    {ad.negotiable ? "السعر قابل للتفاوض" : "السعر نهائي"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* الوصف */}
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-extrabold text-navy-900 dark:text-white">
              وصف الإعلان
            </h2>
            <p className="whitespace-pre-line text-[13.5px] leading-7 text-navy-600 dark:text-navy-200">
              {ad.description}
            </p>

            <div className="divider my-4" />
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoLine label="الوحدة السعرية" value={dealTypeName(ad.dealType) || "بيع"} />
              <InfoLine label="وحدة المساحة" value={areaUnitName(ad.areaUnit)} />
              <InfoLine
                label="السعر المعروض بالدولار"
                value={`$ ${ad.priceUsd.toLocaleString("en-US")}`}
              />
              <InfoLine
                label="السعر المعروض بالليرة"
                value={`${ad.priceSyp.toLocaleString("en-US")} ل.س`}
              />
              <InfoLine label="سعر الصرف المعتمد" value={`1 $ = ${settings.usdToSyp.toLocaleString("en-US")} ل.س`} />
              <InfoLine label="تاريخ الإضافة" value={formatDate(ad.createdAt)} />
            </div>
          </div>

          {/* نصائح الأمان */}
          <div className="card border-amberBrand-200 bg-amberBrand-50/60 p-5 dark:border-amberBrand-500/30 dark:bg-amberBrand-500/10">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-navy-900 dark:text-white">
              <ShieldCheck size={16} className="text-amberBrand-600" /> نصائح للتعامل الآمن
            </h2>
            <ul className="mt-3 space-y-1.5 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-200">
              <li>• عاين العقار أو المركبة على الطبيعة قبل دفع أي مبلغ.</li>
              <li>• تحقّق من أوراق الملكية (طابو / حكم محكمة) أو أوراق المركبة بنفسك.</li>
              <li>• لا ترسل أي دفعة مقدّمة لشخص لم تلتقِ به، ولا تشارك بياناتك المصرفية.</li>
              <li>• بديل منصة عرض وإعلان فقط ولا تتقاضى عمولة ولا تتدخل في عمليات الدفع.</li>
            </ul>
          </div>
        </div>

        {/* =========================== العمود الجانبي =========================== */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* بطاقة السعر والتواصل */}
          <div className="card p-5">
            <Price
              priceUsd={ad.priceUsd}
              priceSyp={ad.priceSyp}
              size="lg"
              suffix={
                ad.dealType === "rent-monthly"
                  ? "/ شهرياً"
                  : ad.dealType === "rent-yearly"
                    ? "/ سنوياً"
                    : undefined
              }
            />
            <p className="mt-2 text-[11.5px] font-semibold text-navy-400">
              السعر معروض بالعملتين: {`${ad.priceUsd.toLocaleString("en-US")} $`} و{" "}
              {`${ad.priceSyp.toLocaleString("en-US")} ل.س`}
            </p>

            {ad.negotiable && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emeraldBrand-50 px-2.5 py-1 text-[11.5px] font-bold text-emeraldBrand-700 dark:bg-emeraldBrand-500/10 dark:text-emeraldBrand-400">
                <CheckCircle2 size={13} /> السعر قابل للتفاوض
              </p>
            )}

            <div className="mt-4 space-y-2">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-emerald w-full justify-center py-3 text-[15px]"
              >
                <MessageCircle size={18} /> تواصل عبر واتساب
              </a>
              <a href={tel} className="btn-primary w-full justify-center py-3 text-[15px]">
                <Phone size={18} /> اتصال مباشر
              </a>
              <p className="text-center text-[11px] text-navy-400">
                رسالة واتساب جاهزة: «مرحباً، أنا مهتم بإعلانك على منصة بديل: {ad.title}»
              </p>
            </div>

            <div className="divider my-4" />

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white dark:bg-white dark:text-navy-900">
                <User size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-navy-900 dark:text-white">
                  {ad.sellerName}
                </p>
                <p className="text-[11.5px] text-navy-400">
                  المُعلن · {displayPhone(ad.sellerPhone, cc)}
                </p>
              </div>
              <span className="badge ms-auto bg-emeraldBrand-50 text-emeraldBrand-700 dark:bg-emeraldBrand-500/10 dark:text-emeraldBrand-400">
                <BadgeCheck size={11} /> موثّق بالمراجعة
              </span>
            </div>

            {ad.rejectionReason && (
              <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-[11.5px] text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                ملاحظة المراجعة: {ad.rejectionReason}
              </p>
            )}
          </div>

          {/* إعلان المُعلن السريع */}
          <div className="card p-4">
            <p className="text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
              هل أنت صاحب هذا الإعلان وتريد تعديله أو إغلاقه (تم البيع/التأجير)؟ تواصل مع فريق بديل
              على واتساب أو أرسل رقم الإعلان{" "}
              <span className="font-bold text-navy-700 dark:text-navy-100">{ad.ref}</span>.
            </p>
            <div className="mt-2 flex gap-2">
              <Link href="/how-it-works" className="btn-ghost btn-sm flex-1 justify-center">
                سياسة الإعلانات
              </Link>
              <Link href="/post-ad" className="btn-amber btn-sm flex-1 justify-center">
                أضف إعلانك
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* إعلانات مشابهة */}
      {similar.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-navy-900 dark:text-white">
              إعلانات مشابهة في {categoryName(ad.category)}
            </h2>
            <Link
              href={`/category/${ad.category}`}
              className="inline-flex items-center gap-1 text-[12.5px] font-bold text-amberBrand-600 hover:underline dark:text-amberBrand-400"
            >
              عرض الكل <ArrowRight size={14} className="flip-x" />
            </Link>
          </div>
          <div className="grid-ads">
            {similar.map((a) => (
              <AdCard key={a.id} ad={a} compact />
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-center text-[11.5px] text-navy-400">
        <InlinePrice priceUsd={ad.priceUsd} priceSyp={ad.priceSyp} />
      </p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-navy-50 px-3 py-2 dark:bg-navy-800/60">
      <span className="text-[11.5px] font-semibold text-navy-400">{label}</span>
      <span className="text-[12.5px] font-bold text-navy-700 dark:text-navy-100">{value}</span>
    </div>
  );
}

/* ملاحظة: تُستخدم ثوابت التصنيفات من lib/taxonomy مباشرة في المكوّنات الأخرى */

