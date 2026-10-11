"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastProvider } from "./Toast";

/* ==========================================================================
   تسجيل Service Worker (PWA) + تحديث تلقائي للنسخة الجديدة
   الهدف: ألّا يبقى المستخدم على نسخة قديمة مخزَّنة (كان يسبب ظهور بيانات قديمة
   مثل رقم الدعم السابق بعد تحديث المنصة).
   ========================================================================== */
function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1")
      return;

    const RELOAD_FLAG = "badeel.sw.reloaded";
    let reloading = false;

    /* عند تسلّم المتحكِّم الجديد (نسخة جديدة فعّالة) نُحدّث الصفحة مرة واحدة فقط */
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading || sessionStorage.getItem(RELOAD_FLAG) === "1") return;
      reloading = true;
      sessionStorage.setItem(RELOAD_FLAG, "1");
      location.reload();
    });

    const t = setTimeout(async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
        /* فحص وجود نسخة جديدة فوراً + عند كل فتح */
        reg.update().catch(() => {});
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            /* صار جاهزاً وهناك نسخة قديمة تعمل → نفّذ التنشيط (skipWaiting داخل sw.js) */
            if (sw.state === "installed" && navigator.serviceWorker.controller) sw.postMessage?.({ type: "SKIP_WAITING" });
          });
        });
        /* إن كان هناك نسخة «في الانتظار» الآن، فعّلها */
        if (reg.waiting) reg.waiting.postMessage?.({ type: "SKIP_WAITING" });
      } catch {
        /* تجاهل أخطاء التسجيل (بيئات مقيّدة) */
      }
    }, 1200);

    return () => clearTimeout(t);
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
      className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-pop transition hover:bg-navy-800 dark:bg-white dark:text-navy-900 no-print"
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
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        {!hideFooter && <Footer />}
        <ScrollTop />
      </div>
      <RegisterSW />
    </ToastProvider>
  );
}
