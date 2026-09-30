import React from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 dark:bg-navy-800 dark:text-navy-300">
        <SearchX size={30} />
      </div>
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
        الصفحة أو الإعلان غير موجود
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-navy-500 dark:text-navy-300">
        ربما تم حذف الإعلان أو إغلاقه من قبل المُعلن، أو أن الرابط غير صحيح. يمكنك البحث في
        الإعلانات المتاحة حالياً في منبج.
      </p>
      <div className="mt-2 flex gap-2">
        <Link href="/search" className="btn-primary">
          تصفّح الإعلانات
        </Link>
        <Link href="/" className="btn-ghost">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
