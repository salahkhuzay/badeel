"use client";

import React from "react";
import Link from "next/link";
import { Building2, Car, Facebook, Mail, Map, MapPin, Phone, Trees } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store";
import { displayPhone } from "@/lib/currency";

export default function Footer() {
  const { cities, settings, districtFacets } = useStore();
  const manbij = cities.find((c) => c.id === "manbij");
  /* المناطق مشتقة من إعلانات المستخدمين — لا قائمة ثابتة */
  const areas = districtFacets("public").slice(0, 8);

  return (
    <footer className="mt-16 border-t border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-950">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo size={44} tagline />
          <p className="text-sm leading-relaxed text-navy-500 dark:text-navy-300">
            منصة إعلانات مبوبة محلية متخصصة بالعقارات والمركبات في مدينة منبج وريفها، مع عرض
            الأسعار بالدولار والليرة السورية ومراجعة إدارية لكل إعلان قبل النشر.
          </p>
          <div className="flex gap-2">
            <span className="btn-icon" title="فيسبوك">
              <Facebook size={16} />
            </span>
            <a
              className="btn-icon"
              href={`mailto:info@badeel.sy`}
              title="راسلنا"
            >
              <Mail size={16} />
            </a>
            <a className="btn-icon" href={`tel:+${settings.whatsappCountryCode}${settings.contactPhone.replace(/^0/, "")}`} title="اتصل بنا">
              <Phone size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-extrabold text-navy-900 dark:text-white">المنصة</h4>
          <ul className="space-y-2 text-sm text-navy-500 dark:text-navy-300">
            <li>
              <Link href="/category/real-estate" className="hover:text-amberBrand-600">
                عقارات منبج
              </Link>
            </li>
            <li>
              <Link href="/category/vehicles" className="hover:text-amberBrand-600">
                سيارات ومركبات
              </Link>
            </li>
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
          <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/60 p-3 text-[12px] leading-relaxed text-navy-500 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-300">
            <span className="font-bold text-navy-700 dark:text-navy-100">التواصل والدعم:</span>
            <br />
            {displayPhone(settings.contactPhone, settings.whatsappCountryCode)} — منبج، حلب
          </div>
        </div>
      </div>

      <div className="border-t border-navy-100 py-5 dark:border-navy-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-center text-xs text-navy-400 sm:flex-row sm:text-right dark:text-navy-400">
          <p>© {new Date().getFullYear()} بديل — Badeel. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={13} /> عقارات
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Car size={13} /> مركبات
            </span>
            <span>صُنع في منبج 🇸🇾</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
