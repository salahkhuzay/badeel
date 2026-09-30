import React from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import Logo from "@/components/Logo";

export const metadata = { title: "لا يوجد اتصال" };

export default function OfflinePage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <Logo size={56} showText={false} />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amberBrand-50 text-amberBrand-600">
        <WifiOff size={26} />
      </div>
      <h1 className="text-xl font-extrabold text-navy-900 dark:text-white">لا يوجد اتصال بالإنترنت</h1>
      <p className="max-w-md text-sm leading-relaxed text-navy-500 dark:text-navy-300">
        يبدو أن الاتصال ضعيف أو غير متاح حالياً. الصفحات التي زرتها سابقاً محفوظة على جهازك ويمكن
        تصفّحها الآن، وسيتم تحديث البيانات تلقائياً عند عودة الاتصال.
      </p>
      <Link href="/" className="btn-amber mt-2">
        إعادة المحاولة
      </Link>
    </div>
  );
}
