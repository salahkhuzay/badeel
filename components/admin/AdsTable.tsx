"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Eye,
  Search,
  ShieldX,
  Sparkles,
  Tag,
  Trash2,
  Undo2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import StatusBadge from "@/components/StatusBadge";
import { InlinePrice } from "@/components/Price";
import { formatDate, timeAgo } from "@/lib/currency";
import { STATUS_META, categoryName, categoryShort, plateRegionName } from "@/lib/taxonomy";
import type { Ad, AdStatus } from "@/lib/types";

const FILTERS: { id: AdStatus | "all"; name: string }[] = [
  { id: "all", name: "الكل" },
  { id: "pending", name: "قيد المراجعة" },
  { id: "active", name: "منشورة" },
  { id: "sold", name: "تم البيع" },
  { id: "rented", name: "تم التأجير" },
  { id: "rejected", name: "مرفوضة" },
];

/** جدول إدارة كل الإعلانات مع إجراءات بضغطة واحدة */
export default function AdsTable() {
  const { ads, moderate, districtLabelOf } = useStore();
  const toast = useToast();
  const [status, setStatus] = useState<AdStatus | "all">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim();
    return ads
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter((a) =>
        needle
          ? [a.title, a.ref, a.sellerName, a.sellerPhone].join(" ").includes(needle)
          : true
      )
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [ads, status, q]);

  const act = (ad: Ad, action: Parameters<typeof moderate>[0], msg: string) => {
    moderate(action);
    toast({ type: "info", title: msg, desc: `${ad.ref} — ${ad.title.slice(0, 40)}...` });
  };

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    ads.forEach((a) => m.set(a.status, (m.get(a.status) ?? 0) + 1));
    return m;
  }, [ads]);

  return (
    <div className="space-y-4">
      {/* أدوات */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatus(f.id)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${
                status === f.id
                  ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                  : "text-navy-500 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
              }`}
            >
              {f.name}
              <span className="ms-1.5 opacity-70">
                {f.id === "all" ? ads.length : counts.get(f.id) ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالعنوان، الرقم، المُعلن..."
            className="input py-2 pr-9 text-[12.5px]"
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="table-wrap bg-white dark:bg-navy-900">
        <table className="table">
          <thead>
            <tr>
              <th>الإعلان</th>
              <th>التصنيف</th>
              <th>الموقع</th>
              <th>السعر (بالعملتين)</th>
              <th>الحالة</th>
              <th>المشاهدات</th>
              <th>التاريخ</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ad) => (
              <tr key={ad.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-navy-100 dark:bg-navy-800">
                      {ad.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <Link
                        href={`/ad/${ad.ref}`}
                        className="line-clamp-1 max-w-[220px] font-bold text-navy-800 hover:text-amberBrand-600 dark:text-navy-50"
                      >
                        {ad.title}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-navy-400">
                        {ad.ref} · {ad.sellerName} · {ad.negotiable ? "قابل للتفاوض" : "سعر نهائي"}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="text-[12px]">
                  <span className="font-semibold text-navy-700 dark:text-navy-100">
                    {categoryName(ad.category)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-navy-400">
                    {ad.subtypeLabel
                      ? ad.subtypeLabel
                      : ad.category === "vehicles" && ad.plateRegion
                        ? plateRegionName(ad.plateRegion)
                        : categoryShort(ad.category)}
                  </span>
                </td>
                <td className="text-[12px] text-navy-600 dark:text-navy-200">
                  {districtLabelOf(ad)}
                </td>
                <td className="whitespace-nowrap text-[12.5px]">
                  <InlinePrice priceUsd={ad.priceUsd} priceSyp={ad.priceSyp} />
                </td>
                <td>
                  <StatusBadge status={ad.status} />
                  {ad.featured && (
                    <span className="badge mt-1 bg-amberBrand-100 text-amberBrand-700 dark:bg-amberBrand-500/15 dark:text-amberBrand-400">
                      <Sparkles size={10} /> مميّز
                    </span>
                  )}
                </td>
                <td className="text-[12px] text-navy-500">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={12} /> {ad.views}
                  </span>
                </td>
                <td className="whitespace-nowrap text-[11.5px] text-navy-400">
                  {timeAgo(ad.createdAt)}
                  <span className="mt-0.5 block text-[10.5px]">{formatDate(ad.createdAt)}</span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {ad.status === "pending" && (
                      <>
                        <IconBtn
                          title="موافقة ونشر"
                          tone="emerald"
                          onClick={() => act(ad, { type: "APPROVE", id: ad.id }, "تم نشر الإعلان")}
                        >
                          <CheckCircle2 size={14} />
                        </IconBtn>
                        <IconBtn
                          title="رفض الإعلان"
                          tone="rose"
                          onClick={() =>
                            act(
                              ad,
                              {
                                type: "REJECT",
                                id: ad.id,
                                reason: "رفض سريع من جدول الإدارة — يُرجى مراجعة تفاصيل الإعلان.",
                              },
                              "تم رفض الإعلان"
                            )
                          }
                        >
                          <ShieldX size={14} />
                        </IconBtn>
                      </>
                    )}

                    {ad.status === "active" && (
                      <>
                        <IconBtn
                          title="تعليم كـ تم البيع"
                          tone="navy"
                          onClick={() => act(ad, { type: "MARK_SOLD", id: ad.id }, "تم تعليم الإعلان كمُباع")}
                        >
                          <Tag size={14} />
                        </IconBtn>
                        <IconBtn
                          title="تعليم كـ تم التأجير"
                          tone="navy"
                          onClick={() =>
                            act(ad, { type: "MARK_RENTED", id: ad.id }, "تم تعليم الإعلان كمؤجَّر")
                          }
                        >
                          <BadgeCheck size={14} />
                        </IconBtn>
                        <IconBtn
                          title={ad.featured ? "إلغاء التمييز" : "تمييز الإعلان"}
                          tone="amber"
                          onClick={() =>
                            act(ad, { type: "TOGGLE_FEATURED", id: ad.id }, "تم تبديل حالة التمييز")
                          }
                        >
                          <Sparkles size={14} />
                        </IconBtn>
                      </>
                    )}

                    {(ad.status === "sold" || ad.status === "rented" || ad.status === "rejected") && (
                      <IconBtn
                        title="إعادة النشر"
                        tone="emerald"
                        onClick={() => act(ad, { type: "REOPEN", id: ad.id }, "تم إعادة نشر الإعلان")}
                      >
                        <Undo2 size={14} />
                      </IconBtn>
                    )}

                    <a href={`/ad/${ad.ref}`} target="_blank" rel="noreferrer">
                      <IconBtn title="فتح الإعلان" tone="plain" as="span">
                        <ExternalLink size={14} />
                      </IconBtn>
                    </a>

                    <IconBtn
                      title="حذف نهائي"
                      tone="rose"
                      onClick={() => {
                        if (confirm(`تأكيد حذف الإعلان ${ad.ref} نهائياً؟`))
                          act(ad, { type: "DELETE_AD", id: ad.id }, "تم حذف الإعلان");
                      }}
                    >
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                  {ad.rejectionReason && ad.status === "rejected" && (
                    <p className="mt-1 max-w-[240px] text-[10.5px] leading-relaxed text-rose-500">
                      {ad.rejectionReason}
                    </p>
                  )}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[13px] text-navy-400">
                  لا توجد إعلانات مطابقة لهذا التصنيف.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11.5px] leading-relaxed text-navy-400">
        ملاحظة: كل إجراء (موافقة / رفض / تعليم كمُباع أو مؤجَّر / تمييز / حذف) يُسجَّل فوراً في «سجل
        العمليات» وينعكس مباشرة على الواجهة العامة وعدّادات البحث.
      </p>
    </div>
  );
}

function IconBtn({
  children,
  title,
  tone,
  onClick,
  as = "button",
}: {
  children: React.ReactNode;
  title: string;
  tone: "emerald" | "rose" | "amber" | "navy" | "plain";
  onClick?: () => void;
  as?: "button" | "span";
}) {
  const tones = {
    emerald: "border-emeraldBrand-200 text-emeraldBrand-600 hover:bg-emeraldBrand-50 dark:border-emeraldBrand-500/30 dark:text-emeraldBrand-400",
    rose: "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400",
    amber: "border-amberBrand-200 text-amberBrand-600 hover:bg-amberBrand-50 dark:border-amberBrand-500/30 dark:text-amberBrand-400",
    navy: "border-navy-200 text-navy-600 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-200",
    plain: "border-navy-200 text-navy-400 hover:bg-navy-50 dark:border-navy-700",
  } as const;

  const Comp: any = as;
  return (
    <Comp
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${tones[tone]}`}
    >
      {children}
    </Comp>
  );
}
