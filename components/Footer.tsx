"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Car,
  Facebook,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  Phone,
  Plug,
  Shirt,
  Sofa,
  Trees,
} from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store";
import { displayPhone, supportWhatsapp, telLink } from "@/lib/currency";
import { mainCategoryLinks } from "@/lib/taxonomy";

export default function Footer() {
  const { cities, settings, districtFacets } = useStore();
  const supportPhone = displayPhone(settings.contactPhone, settings.whatsappCountryCode);
  const tel = telLink(settings.contactPhone, settings.whatsappCountryCode);
  const wa = supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode);
  const manbij = cities.find((c) => c.id === "manbij");
  /* المناطق مشتقة من إعلانات المستخدمين — لا قائمة ثابتة */
  const areas = districtFacets("public").slice(0, 8);

  return (
    <footer className="mt-16 border-t border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-950">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo size={44} tagline />
          <p className="text-sm leading-relaxed text-navy-500 dark:text-navy-300">
            منصة إعلانات مبوبة محلية في مدينة منبج وريفها: عقارات، سيارات ومركبات، أثاث منزلي،
            أدوات كهربائية، ملابس ووظائف — بأسعار بالدولار والليرة السورية، ومراجعة إدارية لكل
            إعلان قبل النشر.
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
            <a
              className="btn-icon"
              href={`mailto:info@badeel.sy`}
              title="راسلنا بالبريد"
              aria-label="البريد"
            >
              <Mail size={16} />
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
            مناطق وأحياء منبج
          </h4>
          {areas.length === 0 ? (
            <p className="text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
              تُبنى المناطق من إعلانات المستخدمين — كن أول من ينشر إعلاناً في منطقتك.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-1.5 text-[13px] text-navy-500 dark:text-navy-300">
              {areas.map((d) => (
                <li key={d.cityId + d.id}>
                  <Link
                    href={`/search?district=${d.id}`}
                    className="inline-flex items-center gap-1 hover:text-amberBrand-600"
                  >
                    {d.kind === "neighborhood" ? (
                      <MapPin size={11} className="text-amberBrand-500" />
                    ) : d.kind === "village" ? (
                      <Trees size={11} className="text-emeraldBrand-500" />
                    ) : (
                      <Map size={11} className="text-navy-400" />
                    )}
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/search?sort=district"
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-amberBrand-600 hover:underline dark:text-amberBrand-400"
          >
            فرز كل الإعلانات حسب المنطقة →
          </Link>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-extrabold text-navy-900 dark:text-white">
            قادم قريباً
          </h4>
          <ul className="space-y-2 text-sm text-navy-500 dark:text-navy-300">
            {cities
              .filter((c) => !c.active)
              .map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <MapPin size={14} className="text-amberBrand-500" />
                  {c.name} — {c.governorate}
                  <span className="badge bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-300">
                    قريباً
                  </span>
                </li>
              ))}
          </ul>
          <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/60 p-3.5 dark:border-navy-800 dark:bg-navy-900">
            <p className="text-[12.5px] font-extrabold text-navy-800 dark:text-navy-50">
              التواصل والدعم
            </p>
            <p className="mt-1 text-[12px] text-navy-500 dark:text-navy-300">
              منبج — حلب · يومياً 9 صباحاً حتى 9 مساءً
            </p>

            <p className="mt-2.5 flex items-center gap-2 text-[13px] font-extrabold text-navy-800 dark:text-navy-50" dir="ltr">
              <Phone size={14} className="text-amberBrand-500" /> {supportPhone}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={tel}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-navy-800 dark:bg-white dark:text-navy-900"
              >
                <Phone size={14} /> اتصال
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emeraldBrand-500 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-emeraldBrand-600"
              >
                <MessageCircle size={14} /> واتساب
              </a>
            </div>

            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-sky-300 px-3 py-2 text-[12px] font-bold text-sky-700 transition hover:bg-sky-50 dark:border-sky-500/40 dark:text-sky-400 dark:hover:bg-sky-500/10"
            >
              <Facebook size={14} /> تابعنا على فيسبوك
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-100 py-5 dark:border-navy-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-center text-xs text-navy-400 sm:flex-row sm:text-right dark:text-navy-400">
          <p>© {new Date().getFullYear()} بديل — Badeel. جميع الحقوق محفوظة.</p>
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
            <Link href="/category/jobs" className="inline-flex items-center gap-1.5 hover:text-amberBrand-600">
              <Briefcase size={13} /> وظائف
            </Link>
            <span>صُنع في منبج 🇸🇾</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
