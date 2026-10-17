"use client";

/* ==========================================================================
   components/SponsoredSlot.tsx — المساحة الإعلانية المأجورة (موجة 20)
   --------------------------------------------------------------------------
   الشريط الأعلى في هيرو الرئيسية (المساحة التي حددها صاحب المنصة):
   - توجد حملة حية اليوم ⇒ بانر المعلن: صورة اختيارية خلفية + نص + وجهة
     نقر (رابط خارجي أو اتصال هاتفي) مع وسم «إعلان ممول» بوضوح.
   - لا حملة حية ⇒ لافتة بيع المساحة: «مساحتك الإعلانية هنا» مع زر حجز
     عبر واتساب الدعم — فالمساحة لا تبقى ميتة أبداً، إما إيرادات أو دعوة.
   ========================================================================== */

import React from "react";
import { ExternalLink, Megaphone, Phone } from "lucide-react";
import { useStore } from "@/lib/store";
import { pickLiveSponsored } from "@/lib/sponsored";
import { supportWhatsapp, displayPhone } from "@/lib/currency";

export default function SponsoredSlot() {
  const { sponsored, remoteSponsored, settings } = useStore();
  /* المنشور في KV أولوية لكل الزوار؛ بلا KV تبقى القائمة المحلية */
  const live = pickLiveSponsored(remoteSponsored ?? sponsored);

  if (!live) {
    const wa = supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode);
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-dashed border-white/25 bg-white/5 p-4 text-center backdrop-blur-sm sm:p-5">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-white">
            <Megaphone size={16} className="text-amberBrand-400" />
            مساحتك الإعلانية هنا — شريط مأجور أعلى صفحة بديل أونلاين
          </span>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emeraldBrand-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-emeraldBrand-700"
          >
            احجز المساحة عبر واتساب
          </a>
        </div>
        <p className="mt-1.5 text-[11px] text-navy-300">
          ظهور دائم أمام كل زوار المنصة في منبج — لأسعار الرعاية راسلنا على{" "}
          <span dir="ltr">{displayPhone(settings.contactPhone, settings.whatsappCountryCode)}</span>
        </p>
      </div>
    );
  }

  const href = live.linkUrl?.trim()
    ? live.linkUrl.trim()
    : live.phone?.trim()
      ? `tel:${live.phone.trim()}`
      : undefined;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl ring-1 ring-amberBrand-400/40">
      {/* صورة الخلفية الاختيارية للمعلن */}
      {live.imageUrl?.trim() && (
        <img
          src={live.imageUrl.trim()}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
      )}
      <div
        className={`relative flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5 ${
          live.imageUrl?.trim() ? "bg-navy-950/80 backdrop-blur-[2px]" : "bg-gradient-to-l from-amberBrand-500/20 via-navy-800/90 to-emeraldBrand-500/15"
        }`}
      >
        <div className="min-w-0">
          <span className="mb-1 inline-block rounded bg-amberBrand-500 px-1.5 py-0.5 text-[10px] font-extrabold text-navy-900">
            إعلان ممول
          </span>
          <div className="truncate text-sm font-extrabold text-white sm:text-base">{live.title}</div>
          {live.subtitle?.trim() && (
            <div className="mt-0.5 truncate text-xs text-navy-200">{live.subtitle}</div>
          )}
          <div className="mt-0.5 text-[10px] text-navy-400">برعاية: {live.advertiser}</div>
        </div>
        {href && (
          <a
            href={href}
            {...(live.linkUrl?.trim() ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amberBrand-500 px-4 py-2 text-xs font-extrabold text-navy-900 hover:bg-amberBrand-400"
          >
            {live.linkUrl?.trim() ? (
              <>
                <ExternalLink size={14} /> التفاصيل
              </>
            ) : (
              <>
                <Phone size={14} /> اتصل الآن
              </>
            )}
          </a>
        )}
      </div>
    </div>
  );
}
