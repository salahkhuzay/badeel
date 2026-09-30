"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  MessageCircle,
  Phone,
  ShieldX,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { displayPhone, formatDate, timeAgo } from "@/lib/currency";
import {
  bodyConditionName,
  dealTypeName,
  fuelTypeName,
  ownershipName,
  plateRegionName,
  propertyTypeName,
  vehicleTypeName,
} from "@/lib/taxonomy";
import type { Ad } from "@/lib/types";

/** طابور المراجعة: كل إعلان جديد يبدأ بحالة "قيد المراجعة" ولا يُنشر إلا بعد الموافقة */
export default function ModerationQueue() {
  const { pendingAds, moderate, settings, districtName, cityById } = useStore();
  const toast = useToast();
  const [rejecting, setRejecting] = useState<Ad | null>(null);
  const [reason, setReason] = useState("");

  const approve = (ad: Ad) => {
    moderate({ type: "APPROVE", id: ad.id });
    toast({
      type: "success",
      title: `تم نشر الإعلان ${ad.ref}`,
      desc: "أصبح الإعلان مرئياً للجمهور في منبج.",
    });
  };

  const confirmReject = () => {
    if (!rejecting) return;
    if (reason.trim().length < 10) {
      toast({
        type: "error",
        title: "سبب الرفض قصير جداً",
        desc: "اكتب سبباً واضحاً لا يقل عن 10 أحرف ليظهر للمُعلن.",
      });
      return;
    }
    moderate({ type: "REJECT", id: rejecting.id, reason: reason.trim() });
    toast({ type: "info", title: `تم رفض الإعلان ${rejecting.ref}` });
    setRejecting(null);
    setReason("");
  };

  if (pendingAds.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emeraldBrand-50 text-emeraldBrand-600 dark:bg-emeraldBrand-500/10">
          <CheckCircle2 size={28} />
        </span>
        <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
          لا توجد إعلانات بانتظار المراجعة
        </h3>
        <p className="max-w-md text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
          كل الإعلانات المُرسَلة تمت مراجعتها. أي إعلان جديد يُضاف من نموذج «أضف إعلانك» سيظهر هنا
          مباشرة بحالة «قيد المراجعة» ولن يُنشر قبل موافقتك.
        </p>
        <Link href="/post-ad" className="btn-ghost mt-1">
          تجربة إضافة إعلان جديد
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-bold text-navy-700 dark:text-navy-100">
          {pendingAds.length} إعلان بانتظار المراجعة
        </p>
        <span className="badge bg-amberBrand-100 text-amberBrand-700 dark:bg-amberBrand-500/15 dark:text-amberBrand-400">
          <Clock3 size={11} /> الموافقة المسبقة مُفعّلة
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {pendingAds.map((ad) => {
          const city = cityById(ad.cityId);
          return (
            <article key={ad.id} className="card overflow-hidden">
              <div className="flex gap-3 p-4">
                <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-navy-100 dark:bg-navy-800">
                  {ad.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-navy-400">
                      {ad.category === "real-estate" ? <Building2 size={26} /> : <Car size={26} />}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-[13.5px] font-extrabold leading-snug text-navy-900 dark:text-white">
                      {ad.title}
                    </h3>
                    <span className="badge shrink-0 bg-amberBrand-100 text-amberBrand-700 dark:bg-amberBrand-500/15 dark:text-amberBrand-400">
                      {ad.ref}
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-navy-500 dark:text-navy-300">
                    {ad.description}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Chip>{city?.name} — {districtName(ad.cityId, ad.districtId)}</Chip>
                    {ad.category === "real-estate" ? (
                      <>
                        <Chip>{propertyTypeName(ad.propertyType)}</Chip>
                        <Chip>{dealTypeName(ad.dealType)}</Chip>
                        <Chip>{ad.areaSize} {ad.areaUnit === "donum" ? "دونم" : "م²"}</Chip>
                        <Chip>{ownershipName(ad.ownership)}</Chip>
                      </>
                    ) : (
                      <>
                        <Chip>{vehicleTypeName(ad.vehicleType)}</Chip>
                        <Chip>{ad.make} {ad.model} {ad.year}</Chip>
                        <Chip>{bodyConditionName(ad.bodyCondition)}</Chip>
                        <Chip>{fuelTypeName(ad.fuelType)}</Chip>
                        <Chip>{plateRegionName(ad.plateRegion)}</Chip>
                      </>
                    )}
                    <Chip>
                      {ad.priceUsd.toLocaleString("en-US")} $ · {ad.priceSyp.toLocaleString("en-US")} ل.س
                    </Chip>
                    {ad.negotiable && <Chip>قابل للتفاوض</Chip>}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-navy-400">
                    <span className="inline-flex items-center gap-1">
                      <User size={11} /> {ad.sellerName}
                    </span>
                    <span className="inline-flex items-center gap-1" dir="ltr">
                      <Phone size={11} /> {displayPhone(ad.sellerPhone, settings.whatsappCountryCode)}
                    </span>
                    <span>أُرسل {timeAgo(ad.createdAt)}</span>
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-navy-100 bg-navy-50/60 p-3 dark:border-navy-800 dark:bg-navy-800/40">
                <button onClick={() => approve(ad)} className="btn-emerald btn-sm">
                  <CheckCircle2 size={14} /> موافقة ونشر
                </button>
                <button
                  onClick={() => {
                    setRejecting(ad);
                    setReason("");
                  }}
                  className="btn btn-sm bg-rose-600 text-white hover:bg-rose-700"
                >
                  <ShieldX size={14} /> رفض
                </button>
                <button
                  onClick={() => {
                    moderate({ type: "TOGGLE_FEATURED", id: ad.id });
                    toast({ type: "info", title: "تم تبديل حالة التمييز" });
                  }}
                  className="btn-ghost btn-sm"
                >
                  <Sparkles size={14} /> تمييز
                </button>
                <a
                  href={`/ad/${ad.ref}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost btn-sm"
                >
                  <ExternalLink size={14} /> معاينة
                </a>
                <a
                  href={`https://wa.me/${ad.sellerWhatsapp.replace(/^0/, "963")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost btn-sm ms-auto"
                  title="تواصل مع المُعلن للتحقّق"
                >
                  <MessageCircle size={14} /> تحقّق من المُعلن
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* نافذة سبب الرفض */}
      {rejecting && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg animate-scale-in p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-navy-900 dark:text-white">
                  <ShieldX size={17} className="text-rose-500" /> رفض الإعلان {rejecting.ref}
                </h3>
                <p className="mt-1 text-[12px] text-navy-500 dark:text-navy-300">
                  سيظهر سبب الرفض للمُعلن في صفحة الإعلان، وسجلّ المراجعة.
                </p>
              </div>
              <button
                onClick={() => setRejecting(null)}
                className="btn-icon"
                aria-label="إغلاق"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4">
              <label className="label">سبب الرفض *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="input leading-7"
                placeholder="مثال: معلومات ناقصة عن أوراق الملكية، أو صور غير مطابقة للوصف، أو إعلان مكرر."
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  "معلومات ناقصة أو غير واضحة",
                  "إعلان مكرر",
                  "صور غير مطابقة للوصف",
                  "بيانات تواصل غير صحيحة",
                  "سعر غير منطقي مقارنة بالسوق",
                ].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setReason(r)}
                    className="chip border border-navy-200 text-navy-600 hover:border-rose-400 hover:text-rose-600 dark:border-navy-700 dark:text-navy-200"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setRejecting(null)} className="btn-ghost">
                إلغاء
              </button>
              <button onClick={confirmReject} className="btn-danger">
                <ShieldX size={15} /> تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-navy-100 px-2 py-0.5 text-[10.5px] font-semibold text-navy-600 dark:bg-navy-800 dark:text-navy-200">
      {children}
    </span>
  );
}

export { BadgeCheck, Eye };
