"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, PlusCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { displayPhone, supportWhatsapp, telLink } from "@/lib/currency";
import { contactNumbers } from "@/lib/contact";

/* ==========================================================================
   شريط تواصل سفلي (جوال فقط) — يُظهر رقم الدعم الحالي دائماً مع اتصال/واتساب
   يظهر في كل الصفحات عدا لوحة التحكم.
   ========================================================================== */

export default function ContactBar() {
  const pathname = usePathname();
  const { settings } = useStore();
  if (pathname?.startsWith("/admin")) return null;

  const phone = displayPhone(settings.contactPhone, settings.whatsappCountryCode);
  const tel = telLink(settings.contactPhone, settings.whatsappCountryCode);
  const wa = supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode);
  /* الرقم الثانوي (إن وُجد من اللوحة) — يظهر في سطر إضافي، ويختفي تماماً عند تركه فارغاً */
  const extraNumbers = contactNumbers(settings).slice(1);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 backdrop-blur-md sm:hidden dark:border-navy-800 dark:bg-navy-900/95 no-print">
      <div className="grid grid-cols-3 gap-1 p-2">
        <a
          href={tel}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-navy-900 py-2 text-white dark:bg-white dark:text-navy-900"
          title={`اتصل بالدعم: ${phone}`}
        >
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold">
            <Phone size={13} /> اتصال
          </span>
          <span className="text-[10.5px] font-bold opacity-90" dir="ltr">
            {phone}
          </span>
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-emeraldBrand-600 py-2 text-white"
          title="راسلنا على واتساب"
        >
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold">
            <MessageCircle size={13} /> واتساب
          </span>
          <span className="text-[10.5px] font-bold opacity-90">رد سريع</span>
        </a>
        <Link
          href="/post-ad"
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-amberBrand-400 bg-amberBrand-50 py-2 text-amberBrand-700 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
        >
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold">
            <PlusCircle size={13} /> أضف إعلانك
          </span>
          <span className="text-[10.5px] font-bold opacity-80">مجاناً</span>
        </Link>
      </div>

      {/* سطر الرقم الثانوي — لا يظهر إطلاقاً إن لم يُضف رقم ثانٍ من اللوحة */}
      {extraNumbers.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-t border-navy-100 px-2 pb-1.5 pt-1.5 text-[10.5px] dark:border-navy-800">
          <span className="text-navy-400">رقم ثانٍ:</span>
          {extraNumbers.map((p) => (
            <a
              key={p}
              href={telLink(p, settings.whatsappCountryCode)}
              className="font-bold text-navy-600 hover:text-amberBrand-600 dark:text-navy-200"
              dir="ltr"
            >
              {displayPhone(p, settings.whatsappCountryCode)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
