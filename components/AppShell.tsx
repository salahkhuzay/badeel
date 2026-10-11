"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastProvider } from "./Toast";
import ContactBar from "./ContactBar";
import { purgeAndReload, registerSW, APP_VERSION } from "@/lib/pwa";

/* ==========================================================================
   الهيكل العام + تسجيل Service Worker مع تحديث تلقائي
   - يمنع بقاء المستخدم على نسخة قديمة (كاش/عامل خدمة) كان يعرض بيانات قديمة.
   - دعم رابط التحديث اليدوي: أي رابط ينتهي بـ #update → حذف الكاش وإعادة تحميل.
   ========================================================================== */
function PwaUpdater() {
  useEffect(() => {
    const needsPurge = () =>
      location.hash === "#update" || location.search.includes("refresh=1");

    /* وسم التحديث اليدوي: في الرابط أو عند إضافته لاحقاً */
    if (needsPurge()) {
      purgeAndReload();
      return;
    }
    const onHash = () => {
      if (needsPurge()) purgeAndReload();
    };
    window.addEventListener("hashchange", onHash);

    const t = setTimeout(() => registerSW(), 800);
    return () => {
      window.removeEventListener("hashchange", onHash);
      clearTimeout(t);
    };
  }, []);
  return null;
}

/** زر "العودة للأعلى" */
function ScrollTop() {
  const [show, setShow] = React.useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 left-4 z-40 sm:bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-pop transition hover:bg-navy-800 dark:bg-white dark:text-navy-900 no-print"
      aria-label="العودة للأعلى"
    >
      ↑
    </button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/admin");

  return (
    <ToastProvider>
      {/* وسم الإصدار ليتحقق المستخدم من أنه على آخر نسخة (يُقرأ من HTML مباشرة) */}
      <div className="flex min-h-screen flex-col" data-app-version={APP_VERSION}>
        <Navbar />
        <main className="flex-1">{children}</main>
        {!hideFooter && <Footer />}
        {/* مساحة سفلية حتى لا يغطي شريط التواصل آخر المحتوى على الجوال */}
        {!hideFooter && <div className="h-[68px] sm:hidden" aria-hidden="true" />}
        <ContactBar />
        <ScrollTop />
      </div>
      <PwaUpdater />
    </ToastProvider>
  );
}
