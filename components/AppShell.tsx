"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastProvider } from "./Toast";

/** تسجيل Service Worker (PWA) — يعمل بصمت ودون كسر الواجهة داخل الإطارات المقيّدة */
function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost") return;
    const t = setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }, 2000);
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
