"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Car,
  Clock3,
  Facebook,
  MessageCircle,
  Phone,
  Plug,
  RefreshCw,
  Shirt,
  Smartphone,
  Sofa,
} from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store";
import { APP_RELEASE, purgeAndReload } from "@/lib/pwa";
import { displayPhone, supportWhatsapp, telLink } from "@/lib/currency";
import { contactNumbers } from "@/lib/contact";
import { mainCategoryLinks } from "@/lib/taxonomy";
import SyriaFlag from "./SyriaFlag";

export default function Footer() {
  const { cities, settings } = useStore();
  const tel = telLink(settings.contactPhone, settings.whatsappCountryCode);
  const wa = supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode);
  /* الأرقام الفعلية: الأساسي + الثانوي إن وُجد — يُدار كله من لوحة التحكم */
  const numbers = contactNumbers(settings);

  return (
    <footer className="mt-16 border-t border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-950">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo size={44} tagline />
          <p className="text-sm leading-relaxed text-navy-500 dark:text-navy-300">
            منصة إعلانات مبوبة محلية في مدينة منبج: عقارات، سيارات ومركبات، هواتف جديدة ومستعملة،
            أثاث منزلي، أدوات كهربائية، ملابس ووظائف — بأسعار بالدولار والليرة السورية، ومراجعة
            إدارية لكل إعلان قبل النشر.
          </p>
          <div className="flex gap-2">
            <a
              className="btn-icon text-navy-600 hover:bg-sky-50 hover:text-sky-700 dark:text-navy-200 dark:hover:bg-sky-500/10"
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="صفحة بديل على فيسبوك"
              aria-label="فيسبوك"
            >
              <Facebook size={16} />
            </a>
            <a
              className="btn-icon text-emeraldBrand-600 hover:bg-emeraldBrand-50 dark:hover:bg-emeraldBrand-500/10"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              title="تواصل عبر واتساب"
              aria-label="واتساب"
            >
              <MessageCircle size={16} />
            </a>
            <a
              className="btn-icon text-amberBrand-600 hover:bg-amberBrand-50 dark:hover:bg-amberBrand-500/10"
              href={tel}
              title="اتصل بنا"
              aria-label="اتصال"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-extrabold text-navy-900 dark:text-white">المنصة</h4>
          <ul className="space-y-2 text-sm text-navy-500 dark:text-navy-300">
            {mainCategoryLinks().map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="hover:text-amberBrand-600">
                  {c.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/post-ad" className="hover:text-amberBrand-600">
                أضف إعلانك مجاناً
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-amberBrand-600">
                كيف يعمل بديل؟
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-amberBrand-600">
                لوحة التحكم الإدارية
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-extrabold text-navy-900 dark:text-white">
            تواصل ودعم
          </h4>
          <ul className="space-y-2.5 text-sm text-navy-500 dark:text-navy-300">
            {numbers.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <Phone size={14} className="text-amberBrand-500" />
                <a
                  href={telLink(p, settings.whatsappCountryCode)}
                  className="font-bold hover:text-amberBrand-600"
                  dir="ltr"
                >
                  {displayPhone(p, settings.whatsappCountryCode)}
                </a>
                {i > 0 && <span className="text-[11px] text-navy-400">(رقم ثانٍ)</span>}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <MessageCircle size={14} className="text-emeraldBrand-500" />
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emeraldBrand-600"
              >
                واتساب — رد سريع
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Facebook size={14} className="text-sky-500" />
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-600"
              >
                صفحتنا على فيسبوك
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock3 size={14} className="text-navy-400" />
              <span>التواصل بالاتصال المباشر أو واتساب فقط</span>
            </li>
            <li className="text-[12px] leading-relaxed">
              منبج — حلب · يومياً من 9 صباحاً حتى 9 مساءً
            </li>
          </ul>

          {cities.filter((c) => !c.active).length > 0 && (
            <p className="mt-4 text-[11.5px] leading-relaxed text-navy-400">
              قريباً: {cities.filter((c) => !c.active).map((c) => c.name).join(" · ")}
            </p>
          )}
        </div>

      </div>

      <div className="border-t border-navy-100 py-5 dark:border-navy-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-center text-xs text-navy-400 sm:flex-row sm:text-right dark:text-navy-400">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p>© {new Date().getFullYear()} بديل — Badeel. جميع الحقوق محفوظة.</p>
            <p className="flex items-center gap-2 text-[10.5px] text-navy-400">
              <span>الإصدار {APP_RELEASE}</span>
              <button
                onClick={() => purgeAndReload()}
                className="inline-flex items-center gap-1 rounded-md border border-navy-200 px-1.5 py-0.5 font-bold text-navy-500 transition hover:border-amberBrand-400 hover:text-amberBrand-600 dark:border-navy-700 dark:text-navy-300"
                title="إذا ظهرت لك نسخة قديمة: اضغط هنا لحذف الكاش وتحديث الموقع"
              >
                <RefreshCw size={10} /> تحديث
              </button>
            </p>
          </div>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:justify-end">
            <Link href="/category/real-estate" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Building2 size={13} /> عقارات
            </Link>
            <Link href="/category/vehicles" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Car size={13} /> مركبات
            </Link>
            <Link href="/category/furniture" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Sofa size={13} /> أثاث
            </Link>
            <Link href="/category/appliances" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Plug size={13} /> أجهزة
            </Link>
            <Link href="/category/clothing" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Shirt size={13} /> ملابس
            </Link>
            <Link href="/category/phones" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Smartphone size={13} /> هواتف
            </Link>
            <Link href="/category/jobs" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Briefcase size={13} /> وظائف
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <SyriaFlag size={18} className="rounded-[2px] ring-1 ring-navy-200 dark:ring-navy-700" />
              سوريا
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
