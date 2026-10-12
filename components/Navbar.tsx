"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  Car,
  Home,
  Facebook,
  MessageCircle,
  Phone,
  Plug,
  RefreshCw,
  Shirt,
  Smartphone,
  Sofa,
  LayoutDashboard,
  Menu,
  PlusCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import Logo from "./Logo";
import CurrencySwitch from "./CurrencySwitch";
import ThemeToggle from "./ThemeToggle";
import { useStore } from "@/lib/store";
import { contactNumbers } from "@/lib/contact";
import { APP_VERSION, purgeAndReload } from "@/lib/pwa";
import { cn, displayPhone, supportWhatsapp, telLink } from "@/lib/currency";

const NAV = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/category/real-estate", label: "عقارات", icon: Building2 },
  { href: "/category/vehicles", label: "سيارات ومركبات", icon: Car },
  { href: "/category/furniture", label: "أثاث منزلي", icon: Sofa },
  { href: "/category/appliances", label: "أدوات كهربائية", icon: Plug },
  { href: "/category/clothing", label: "ملابس وأزياء", icon: Shirt },
  { href: "/category/phones", label: "هواتف", icon: Smartphone },
  { href: "/category/jobs", label: "وظائف", icon: Briefcase },
];

/* قائمة الجوال تضم «كيف يعمل بديل؟» إضافةً إلى التصنيفات */
const MOBILE_NAV = [
  ...NAV,
  { href: "/car-types", label: "أنواع السيارات", icon: Car },
  { href: "/how-it-works", label: "كيف يعمل بديل؟", icon: ShieldCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { pendingAds, auth, settings } = useStore();
  const tel = telLink(settings.contactPhone, settings.whatsappCountryCode);
  const wa = supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode);
  const fb = settings.facebookUrl;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur-lg dark:border-navy-800 dark:bg-navy-950/85">
      {/* شريط تنبيهي علوي */}
      <div className="bg-navy-900 py-1.5 text-navy-100 dark:bg-navy-800">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] font-semibold sm:justify-between">
          <span>
            <span className="text-amberBrand-400">بديل</span> — خيارك الأفضل للبيع والشراء في منبج
            <span className="mx-1 hidden md:inline">
              · إعلاناتك تُنشر بعد المراجعة لضمان الجودة
            </span>
          </span>

          {/* الإصدار + زر تحديث فوري (للتخلص من أي نسخة مخزَّنة قديمة) */}
          <span className="flex items-center gap-1">
            <button
              onClick={() => purgeAndReload()}
              className="hidden items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] text-navy-300 transition hover:bg-white/10 hover:text-amberBrand-400 sm:inline-flex"
              title="تحديث الموقع إلى آخر نسخة (يحذف الكاش القديم)"
            >
              <RefreshCw size={11} /> نسخة {APP_VERSION}
            </button>
          </span>

          {/* التواصل والدعم: اتصال (الأساسي + الثانوي إن وُجد) + واتساب + فيسبوك */}
          <span className="flex items-center gap-1">
            <span className="me-1 hidden text-navy-300 sm:inline">التواصل والدعم:</span>
            {contactNumbers(settings).map((p, i) => (
              <span key={p} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-navy-400">·</span>}
                <a
                  href={telLink(p, settings.whatsappCountryCode)}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition hover:bg-white/10 hover:text-amberBrand-400"
                  title={`${i === 0 ? "اتصل بنا" : "رقم ثانٍ"}: ${displayPhone(p, settings.whatsappCountryCode)}`}
                  dir="ltr"
                >
                  {i === 0 && <Phone size={11} />} {displayPhone(p, settings.whatsappCountryCode)}
                </a>
              </span>
            ))}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition hover:bg-white/10 hover:text-emeraldBrand-400"
              title="راسلنا على واتساب"
            >
              <MessageCircle size={11} /> واتساب
            </a>
            <a
              href={fb}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition hover:bg-white/10 hover:text-sky-300"
              title="صفحتنا على فيسبوك"
            >
              <Facebook size={11} /> فيسبوك
            </a>
          </span>
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="shrink-0" aria-label="بديل - الصفحة الرئيسية">
          <Logo size={38} showText tagline={false} />
        </Link>

        {/* قائمة سطح المكتب */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold transition",
                  isActive(item.href)
                    ? "bg-navy-50 text-navy-900 dark:bg-navy-800 dark:text-white"
                    : "text-navy-500 hover:bg-navy-50 hover:text-navy-900 dark:text-navy-200 dark:hover:bg-navy-800"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <CurrencySwitch />
          </div>
          <ThemeToggle compact />

          <Link
            href="/admin"
            className="relative hidden h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition hover:bg-navy-50 dark:border-navy-700 dark:text-navy-200 dark:hover:bg-navy-800 sm:inline-flex"
            title={auth.loggedIn ? "لوحة التحكم (مسجّل الدخول)" : "لوحة التحكم الإدارية"}
            aria-label="لوحة التحكم الإدارية"
          >
            {auth.loggedIn ? (
              <ShieldCheck size={16} className="text-emeraldBrand-500" />
            ) : (
              <LayoutDashboard size={16} />
            )}
            {pendingAds.length > 0 && (
              <span className="absolute -top-1.5 -left-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amberBrand-500 px-1 text-[10px] font-extrabold text-navy-900">
                {pendingAds.length}
              </span>
            )}
          </Link>

          <Link href="/post-ad" className="btn-amber hidden text-sm sm:inline-flex">
            <PlusCircle size={16} />
            أضف إعلانك
          </Link>

          <button
            className="btn-icon lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال */}
      {open && (
        <div className="animate-fade-up border-t border-navy-100 bg-white lg:hidden dark:border-navy-800 dark:bg-navy-950">
          <div className="container-page space-y-1 py-3">
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold",
                    isActive(item.href)
                      ? "bg-navy-50 text-navy-900 dark:bg-navy-800 dark:text-white"
                      : "text-navy-600 dark:text-navy-200"
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-600 dark:text-navy-200"
            >
              <LayoutDashboard size={17} />
              لوحة التحكم
              {pendingAds.length > 0 && (
                <span className="badge bg-amberBrand-100 text-amberBrand-700">
                  {pendingAds.length} بانتظار المراجعة
                </span>
              )}
            </Link>
            {/* زر تحديث الموقع (يحذف الكاش القديم) */}
            <button
              onClick={() => purgeAndReload()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amberBrand-400/60 bg-amberBrand-50/50 py-2.5 text-[12px] font-bold text-amberBrand-700 transition hover:bg-amberBrand-50 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
            >
              <RefreshCw size={14} /> تحديث الموقع (نسخة {APP_VERSION})
            </button>

            {/* التواصل والدعم في قائمة الجوال */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href={tel}
                className="flex flex-col items-center gap-1 rounded-xl border border-navy-200 py-2.5 text-[11px] font-bold text-navy-600 dark:border-navy-700 dark:text-navy-200"
              >
                <Phone size={15} className="text-amberBrand-500" /> اتصال
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl border border-emeraldBrand-300 py-2.5 text-[11px] font-bold text-emeraldBrand-700 dark:border-emeraldBrand-500/40 dark:text-emeraldBrand-400"
              >
                <MessageCircle size={15} /> واتساب
              </a>
              <a
                href={fb}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl border border-sky-300 py-2.5 text-[11px] font-bold text-sky-700 dark:border-sky-500/40 dark:text-sky-400"
              >
                <Facebook size={15} /> فيسبوك
              </a>
            </div>

            <div className="divider my-2" />
            <div className="flex items-center justify-between gap-3 px-1">
              <CurrencySwitch full />
            </div>
            <Link
              href="/post-ad"
              onClick={() => setOpen(false)}
              className="btn-amber mt-2 w-full"
            >
              <PlusCircle size={16} />
              أضف إعلانك مجاناً
            </Link>
            {auth.loggedIn && (
              <p className="px-1 pt-1 text-[11px] font-bold text-emeraldBrand-600 dark:text-emeraldBrand-400">
                مسجّل الدخول إلى لوحة التحكم كـ {settings.adminUsername}
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
