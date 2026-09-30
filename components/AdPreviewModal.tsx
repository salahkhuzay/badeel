"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Edit3,
  Eye,
  Fuel,
  MapPin,
  MessageCircle,
  MessageSquareQuote,
  Phone,
  Ruler,
  Send,
  ShieldCheck,
  Tag,
  User,
  X,
} from "lucide-react";
import type { Ad } from "@/lib/types";
import { useStore } from "@/lib/store";
import { displayPhone, formatDate, normalizePhone } from "@/lib/currency";
import {
  areaUnitName,
  bodyConditionName,
  dealTypeName,
  fuelTypeName,
  ownershipName,
  plateRegionName,
  propertyTypeName,
  vehicleTypeName,
} from "@/lib/taxonomy";
import StatusBadge from "./StatusBadge";
import Price from "./Price";

/* ==========================================================================
   شاشة المعاينة الكاملة — تعرض الإعلان بنفس شكل صفحة النشر النهائية
   قبل إرساله للمراجعة، مع خطوة تأكيد نهائية.
   ========================================================================== */

export default function AdPreviewModal({
  ad,
  open,
  onClose,
  onConfirm,
  summaryCount,
}: {
  ad: Ad;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** عدد الحقول المعبّأة (يظهر في الملخّص) */
  summaryCount?: number;
}) {
  const { districtName, cityById, settings } = useStore();
  const [imgIndex, setImgIndex] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);

  /* إغلاق بمفتاح ESC + منع تمرير الخلفية */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [open, onClose]);

  useEffect(() => {
    setImgIndex(0);
    setAcknowledged(false);
  }, [open]);

  if (!open) return null;

  const district = districtName(ad.cityId, ad.districtId);
  const city = cityById(ad.cityId);
  const cc = settings.whatsappCountryCode;
  const isRealEstate = ad.category === "real-estate";
  const waMessage = `مرحباً، أنا مهتم بإعلانك على منصة بديل: ${ad.title}`;

  const specs: { label: string; value: string; icon: React.ReactNode }[] = isRealEstate
    ? [
        { label: "نوع العقار", value: propertyTypeName(ad.propertyType), icon: <Building2 size={14} /> },
        { label: "نوع التعامل", value: dealTypeName(ad.dealType), icon: <CalendarDays size={14} /> },
        {
          label: "المساحة",
          value: `${ad.areaSize ?? "—"} ${ad.areaUnit === "donum" ? "دونم" : "متر مربع"}`,
          icon: <Ruler size={14} />,
        },
        { label: "أوراق الملكية", value: ownershipName(ad.ownership), icon: <BadgeCheck size={14} /> },
      ]
    : [
        { label: "نوع المركبة", value: vehicleTypeName(ad.vehicleType), icon: <Car size={14} /> },
        {
          label: "الماركة والموديل",
          value: `${ad.make ?? "—"} ${ad.model ?? ""}`.trim(),
          icon: <Tag size={14} />,
        },
        { label: "سنة الصنع", value: String(ad.year ?? "—"), icon: <CalendarDays size={14} /> },
        { label: "حالة الجسم", value: bodyConditionName(ad.bodyCondition), icon: <CheckCircle2 size={14} /> },
        { label: "نوع الوقود", value: fuelTypeName(ad.fuelType), icon: <Fuel size={14} /> },
        { label: "نمرة التسجيل", value: plateRegionName(ad.plateRegion), icon: <BadgeCheck size={14} /> },
      ];

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-navy-950/70 backdrop-blur-sm">
      {/* ------------------------------- الترويسة ------------------------------- */}
      <header className="border-b border-white/10 bg-navy-900 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amberBrand-500 text-navy-900">
              <Eye size={19} />
            </span>
            <div>
              <h2 className="text-[15px] font-extrabold">معاينة الإعلان قبل الإرسال</h2>
              <p className="text-[11.5px] text-navy-300">
                هذه ليست الصفحة المنشورة — راجع البيانات بدقة، ويمكنك التعديل في أي لحظة قبل التأكيد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge bg-white/10 text-white">
              <ShieldCheck size={11} className="text-amberBrand-400" /> الموافقة المسبقة مُفعّلة
            </span>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10"
              aria-label="إغلاق المعاينة"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* شريط بطاقة الإعلان كما ستظهر في النتائج */}
        <div className="border-t border-white/10 bg-navy-950/40">
          <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2 text-[11.5px] text-navy-300">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} className="text-amberBrand-400" /> {city?.name} — {district}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {isRealEstate ? <Building2 size={12} /> : <Car size={12} />}
              {isRealEstate ? "عقارات" : "سيارات ومركبات"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              رقم مقترح للإعلان: <b className="text-white">{ad.ref}</b>
            </span>
            {summaryCount != null && <span>حقلاً معبّأ: {summaryCount}</span>}
          </div>
        </div>
      </header>

      {/* -------------------------------- المحتوى -------------------------------- */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-navy-950">
        <div className="container-page py-6 pb-32">
          {/* تنبيه المراجعة */}
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amberBrand-300 bg-amberBrand-50 p-4 dark:border-amberBrand-500/40 dark:bg-amberBrand-500/10">
            <AlertTriangle size={18} className="shrink-0 text-amberBrand-600" />
            <p className="text-[12.5px] leading-relaxed text-navy-700 dark:text-navy-100">
              <b>معاينة خاصة بك فقط.</b> لن يظهر هذا الإعلان للعموم حتى ترسله ويوافق عليه فريق بديل.
              بعد الإرسال ستجده في لوحة التحكم بحالة «قيد المراجعة» مع إمكانية تعديله أو إغلاقه.
            </p>
            <StatusBadge status="pending" className="ms-auto" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* العمود الرئيسي */}
            <div className="space-y-5">
              {/* المعرض */}
              <div className="card overflow-hidden">
                <div className="relative aspect-[16/10] bg-navy-100 dark:bg-navy-800">
                  {ad.images?.length ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.images[imgIndex]} alt={ad.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-navy-400">
                      {isRealEstate ? <Building2 size={54} /> : <Car size={54} />}
                      <p className="text-xs font-semibold">
                        لم تختر أي صورة — يمكنك إضافة صور من مكتبة بديل قبل الإرسال
                      </p>
                    </div>
                  )}
                  <div className="absolute right-3 top-3 flex gap-2">
                    <span className="badge bg-white/95 text-navy-700 dark:bg-navy-900/95 dark:text-navy-100">
                      معاينة
                    </span>
                    <StatusBadge status="pending" className="bg-white/95 dark:bg-navy-900/95" />
                  </div>
                </div>

                {ad.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {ad.images.map((src, i) => (
                      <button
                        key={src + i}
                        onClick={() => setImgIndex(i)}
                        className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                          i === imgIndex ? "border-amberBrand-500" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* العنوان والمواصفات */}
              <div className="card p-5">
                <h1 className="text-lg font-extrabold leading-snug text-navy-900 dark:text-white sm:text-xl">
                  {ad.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-navy-500 dark:text-navy-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} className="text-amberBrand-500" /> {district} — {city?.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Tag size={13} /> {isRealEstate ? "عقارات" : "سيارات ومركبات"}
                  </span>
                  <span suppressHydrationWarning>تاريخ المعاينة: {formatDate(new Date().toISOString())}</span>
                </div>

                <div className="divider my-4" />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {specs.map((s) => (
                    <div key={s.label} className="rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-400">
                        {s.icon}
                        {s.label}
                      </p>
                      <p className="mt-1 text-[13.5px] font-bold text-navy-800 dark:text-navy-50">{s.value}</p>
                    </div>
                  ))}
                  {isRealEstate && (
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
                <h2 className="mb-3 text-sm font-extrabold text-navy-900 dark:text-white">وصف الإعلان</h2>
                <p className="whitespace-pre-line text-[13.5px] leading-7 text-navy-600 dark:text-navy-200">
                  {ad.description}
                </p>

                <div className="divider my-4" />
                <h3 className="mb-2 text-[12.5px] font-extrabold text-navy-900 dark:text-white">
                  تفاصيل الأسعار التي ستُعرض للجمهور
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoLine label="الوحدة السعرية" value={dealTypeName(ad.dealType) || "بيع"} />
                  <InfoLine label="وحدة المساحة" value={areaUnitName(ad.areaUnit)} />
                  <InfoLine
                    label="السعر بالدولار"
                    value={`$ ${ad.priceUsd.toLocaleString("en-US")}`}
                  />
                  <InfoLine
                    label="السعر بالليرة"
                    value={`${ad.priceSyp.toLocaleString("en-US")} ل.س`}
                  />
                  <InfoLine
                    label="سعر الصرف المعتمد"
                    value={`1 $ = ${settings.usdToSyp.toLocaleString("en-US")} ل.س`}
                  />
                  <InfoLine label="حالة الإعلان بعد الإرسال" value="قيد المراجعة (لا يُنشر تلقائياً)" />
                </div>
              </div>

              {/* رسالة واتساب */}
              <div className="card p-5">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-navy-900 dark:text-white">
                  <MessageSquareQuote size={16} className="text-emeraldBrand-600" /> الرسالة التي ستُرسل
                  إليك من المشتري
                </h2>
                <div className="mt-3 rounded-2xl rounded-tr-sm border border-emeraldBrand-200 bg-emeraldBrand-50 p-3.5 text-[12.5px] leading-relaxed text-navy-700 dark:border-emeraldBrand-500/30 dark:bg-emeraldBrand-500/10 dark:text-navy-100">
                  {waMessage}
                </div>
                <p className="mt-2 text-[11.5px] text-navy-400">
                  رقم واتساب المُعلن: <b dir="ltr">+{normalizePhone(ad.sellerWhatsapp, cc)}</b> — يُفعَّل
                  زر الواتساب مباشرةً بعد نشر الإعلان.
                </p>
              </div>

              {/* نصائح */}
              <div className="card border-amberBrand-200 bg-amberBrand-50/60 p-5 dark:border-amberBrand-500/30 dark:bg-amberBrand-500/10">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-navy-900 dark:text-white">
                  <ShieldCheck size={16} className="text-amberBrand-600" /> تذكير قبل الإرسال
                </h2>
                <ul className="mt-3 space-y-1.5 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-200">
                  <li>• تأكد من أن السعر المكتوب هو السعر النهائي أو المبدئي الذي تريده فعلاً.</li>
                  <li>• لا تذكر أي بيانات مصرفية في الوصف، فبديل لا يتعامل مع الدفع.</li>
                  <li>• صور واضحة للعقار أو المركبة ترفع فرص البيع بشكل كبير.</li>
                </ul>
              </div>
            </div>

            {/* العمود الجانبي — مثل صفحة الإعلان المنشور تماماً */}
            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
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
                  سيُعرض السعر بالعملتين دائماً: {ad.priceUsd.toLocaleString("en-US")} $ و{" "}
                  {ad.priceSyp.toLocaleString("en-US")} ل.س
                </p>

                {ad.negotiable && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emeraldBrand-50 px-2.5 py-1 text-[11.5px] font-bold text-emeraldBrand-700 dark:bg-emeraldBrand-500/10 dark:text-emeraldBrand-400">
                    <CheckCircle2 size={13} /> السعر قابل للتفاوض
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    disabled
                    className="btn-emerald w-full cursor-not-allowed justify-center py-3 text-[15px] opacity-60"
                    title="يعمل بعد نشر الإعلان"
                  >
                    <MessageCircle size={18} /> تواصل عبر واتساب
                  </button>
                  <button
                    type="button"
                    disabled
                    className="btn-primary w-full cursor-not-allowed justify-center py-3 text-[15px] opacity-60"
                    title="يعمل بعد نشر الإعلان"
                  >
                    <Phone size={18} /> اتصال مباشر
                  </button>
                  <p className="text-center text-[11px] text-navy-400">
                    أزرار التواصل معطّلة في المعاينة — تعمل تلقائياً بعد الموافقة على الإعلان.
                  </p>
                </div>

                <div className="divider my-4" />

                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white dark:bg-white dark:text-navy-900">
                    <User size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-extrabold text-navy-900 dark:text-white">
                      {ad.sellerName}
                    </p>
                    <p className="text-[11.5px] text-navy-400" dir="ltr">
                      {displayPhone(ad.sellerPhone, cc)}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ------------------------------ شريط التأكيد ------------------------------ */}
      <footer className="border-t border-navy-100 bg-white px-4 py-3 dark:border-navy-800 dark:bg-navy-900">
        <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-amberBrand-500"
            />
            <span className="text-[12px] leading-relaxed text-navy-600 dark:text-navy-200">
              راجعتُ كل البيانات (العنوان، الموقع، السعر بالعملتين، ورقم التواصل) وأؤكّد أنها صحيحة.
            </span>
          </label>

          <div className="flex shrink-0 gap-2">
            <button onClick={onClose} className="btn-ghost">
              <Edit3 size={16} /> رجوع للتعديل
            </button>
            <button
              onClick={onConfirm}
              disabled={!acknowledged}
              className="btn-amber px-5"
              title={acknowledged ? "إرسال الإعلان للمراجعة" : "يجب تأكيد صحة البيانات أولاً"}
            >
              <Send size={16} /> إرسال الإعلان للمراجعة
              <ArrowRight size={15} className="flip-x" />
            </button>
          </div>
        </div>
      </footer>
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
