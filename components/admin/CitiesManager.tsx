"use client";

import React from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Eye, MapPin, PlusCircle, Power, Search, Store } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { formatNumber, cn } from "@/lib/currency";

/* ==========================================================================
   إدارة المدن — نسخة مبسّطة بعد إلغاء الأحياء والمناطق
   تُبنى صفحة الإعلان الآن على المدينة فقط، والمناطق تُذكر في وصف الإعلان بحرية.
   ========================================================================== */

export default function CitiesManager() {
  const { cities, publicAds, toggleCity, ads } = useStore();
  const toast = useToast();

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 p-4 dark:border-navy-800">
          <div>
            <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
              <Building2 size={17} className="text-emeraldBrand-500" /> المدن المتاحة للنشر
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
              فعّل مدينة لتظهر فوراً في نموذج إضافة الإعلان وفي فلتر «المدينة» في البحث — بدون أي
              تعديل برمجي.
            </p>
          </div>
          <span className="badge bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
            {cities.filter((c) => c.active).length} مدينة مُفعّلة من {cities.length}
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {cities.map((c) => {
            const count = publicAds.filter((a) => a.cityId === c.id).length;
            const total = ads.filter((a) => a.cityId === c.id).length;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-2xl border p-4 transition",
                  c.active
                    ? "border-emeraldBrand-200 bg-emeraldBrand-50/50 dark:border-emeraldBrand-500/30 dark:bg-emeraldBrand-500/5"
                    : "border-navy-100 dark:border-navy-800"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        c.active
                          ? "bg-emeraldBrand-500 text-white"
                          : "bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-200"
                      )}
                    >
                      <MapPin size={20} />
                    </span>
                    <div>
                      <p className="text-[14px] font-extrabold text-navy-900 dark:text-white">
                        {c.name}
                      </p>
                      <p className="text-[11.5px] text-navy-400">{c.governorate}</p>
                    </div>
                  </div>

                  {c.active ? (
                    <span className="badge bg-emeraldBrand-100 text-emeraldBrand-700 dark:bg-emeraldBrand-500/15 dark:text-emeraldBrand-400">
                      <CheckCircle2 size={11} /> مُفعّلة
                    </span>
                  ) : (
                    <span className="badge bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-300">
                      غير مُفعّلة
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-white p-2.5 dark:bg-navy-900">
                    <p className="text-[15px] font-extrabold text-navy-900 dark:text-white">
                      {formatNumber(count)}
                    </p>
                    <p className="text-[10.5px] font-semibold text-navy-400">إعلان منشور</p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 dark:bg-navy-900">
                    <p className="text-[15px] font-extrabold text-navy-900 dark:text-white">
                      {formatNumber(total)}
                    </p>
                    <p className="text-[10.5px] font-semibold text-navy-400">إجمالي الإعلانات</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      toggleCity(c.id);
                      toast({
                        type: "success",
                        title: c.active ? `أُلغيت مُفعّلة ${c.name}` : `تم تفعيل ${c.name}`,
                        desc: c.active
                          ? "لن تظهر هذه المدينة في نموذج النشر الجديد."
                          : "أصبحت متاحة الآن في نموذج النشر والفلترة.",
                      });
                    }}
                    className={cn(
                      "btn btn-sm w-full justify-center",
                      c.active
                        ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
                        : "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                    )}
                  >
                    <Power size={14} /> {c.active ? "إلغاء التفعيل" : "تفعيل المدينة"}
                  </button>
                  <Link
                    href={`/search?city=${c.id}`}
                    className="btn-ghost btn-sm shrink-0"
                    title="عرض إعلانات هذه المدينة"
                  >
                    <Eye size={14} /> عرض
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-navy-900 dark:text-white">
          <Search size={15} className="text-amberBrand-500" /> ما الذي تغيّر بعد إلغاء الأحياء؟
        </h4>
        <ul className="mt-2.5 space-y-2 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
          <li>• نموذج إضافة الإعلان يطلب <b>المدينة</b> فقط — بلا حقول حي/قرية/منطقة.</li>
          <li>
            • من يحتاج توضيح الموقع يكتبه بحرية داخل وصف الإعلان (مثال: «خلف جامع الكبير قرب
            السوق»).
          </li>
          <li>• الفلترة في السوق تعتمد على: التصنيف، الماركة، الموديل، سنة الصنع، الحالة، السعر، والمدينة.</li>
          <li>• عند التوسّع لاحقاً: فعّل مدينة جديدة من هنا فوراً.</li>
        </ul>
      </div>

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <Store size={18} className="text-emeraldBrand-500" />
        <p className="flex-1 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
          هل تريد مدينة أخرى غير المدرجة؟ أضفها في بيانات المشروع في ملف <code>lib/seed.ts</code>{" "}
          (مصفوفة <code>CITIES</code>) وستظهر هنا تلقائياً، أو راسل فريق التطوير.
        </p>
        <Link href="/post-ad" className="btn-amber btn-sm">
          <PlusCircle size={14} /> تجربة نموذج النشر
        </Link>
      </div>
    </div>
  );
}
