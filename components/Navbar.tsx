"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Car,
  Home,
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
import { cn } from "@/lib/currency";

const NAV = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/category/real-estate", label: "عقارات", icon: Building2 },
  { href: "/category/vehicles", label: "سيارات ومركبات", icon: Car },
  { href: "/how-it-works", label: "كيف يعمل بديل؟", icon: ShieldCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { pendingAds, adminUser } = useStore();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur-lg dark:border-navy-800 dark:bg-navy-950/85">
      {/* شريط تنبيهي علوي */}
      <div className="bg-navy-900 py-1.5 text-center text-[11px] font-semibold text-navy-100 dark:bg-navy-800">
        <span className="text-amberBrand-400">بديل</span> — خيارك الأفضل للبيع والشراء في منبج ·
        <span className="mx-1 hidden sm:inline">إعلاناتك تُنشر بعد المراجعة لضمان الجودة</span>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="shrink-0" aria-label="بديل - الصفحة الرئيسية">
          <Logo size={38} showText tagline={false} />
        </Link>

        {/* قائمة سطح المكتب */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
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
            title="لوحة التحكم الإدارية"
            aria-label="لوحة التحكم الإدارية"
          >
            <LayoutDashboard size={16} />
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
            {NAV.map((item) => {
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
            {adminUser && (
              <p className="px-1 pt-1 text-[11px] text-navy-400">
                مسجّل الدخول كمسؤول: {adminUser}
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
