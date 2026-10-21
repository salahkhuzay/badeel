"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  Search,
  ShieldX,
  Sparkles,
  Tag,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import StatusBadge from "@/components/StatusBadge";
import { InlinePrice } from "@/components/Price";
import { formatDate, timeAgo } from "@/lib/currency";
import { STATUS_META, MAIN_CATEGORIES, categoryName, categoryShort, plateRegionName } from "@/lib/taxonomy";
import type { Ad, AdStatus, MainCategory } from "@/lib/types";
import AdArtwork from "@/lib/artwork";
import { getRateKey } from "@/lib/remote-rate";
import { moderateRemoteAd } from "@/lib/remote-ads";

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
  const { ads, settings, cities, moderate, cityById, adsBridge, syncAds } = useStore();
  const toast = useToast();
  const [status, setStatus] = useState<AdStatus | "all">("all");
  const [q, setQ] = useState("");

  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [editForm, setEditForm] = useState<Partial<Ad>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setEditForm({
      title: ad.title,
      price: ad.price,
      currency: ad.currency,
      priceOnRequest: ad.priceOnRequest,
      negotiable: ad.negotiable,
      category: ad.category,
      cityId: ad.cityId,
      description: ad.description ?? "",
      sellerName: ad.sellerName ?? "",
      sellerPhone: ad.sellerPhone ?? "",
      sellerWhatsapp: ad.sellerWhatsapp ?? "",
      status: ad.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAd) return;
    setSavingEdit(true);
    try {
      const key = getRateKey().trim();
      const rate = settings.usdToSyp || 14500;
      const price = Number(editForm.price ?? editingAd.price);
      const curr = editForm.currency ?? editingAd.currency;
      const priceUsd = curr === "USD" ? price : Math.round(price / rate);
      const priceSyp = curr === "SYP" ? price : Math.round(price * rate);
      const patch = {
        ...editForm,
        price,
        currency: curr,
        priceUsd,
        priceSyp,
      };
      const res = await moderateRemoteAd(editingAd.id, patch, key);
      if (res.ok) {
        toast({
          type: "success",
          title: "تم حفظ التعديلات بنجاح",
          desc: `تم تحديث الإعلان ${editingAd.ref} ونُشر فوراً`,
        });
        await syncAds();
        setEditingAd(null);
      } else {
        toast({ type: "error", title: "تعذّر حفظ التعديل", desc: res.error });
      }
    } catch (e) {
      toast({ type: "error", title: "خطأ في الاتصال", desc: String(e) });
    } finally {
      setSavingEdit(false);
    }
  };

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
      {/* موجة 25: حالة جسر الإعلانات — هل القائمة مشتركة بين كل الأجهزة؟ */}
      <div className="card flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="text-[11.5px] font-semibold text-navy-600 dark:text-navy-300">
          {adsBridge
            ? "جسر الإعلانات (Supabase) موصول — كل إعلان وموافقة تظهر لجميع الزوار فوراً."
            : "جسر الإعلانات غير مضبوط — القائمة محلية في هذا المتصفح فقط (اضبط SUPABASE في Vercel لتفعيل السوق المشترك)."}
        </div>
        <button type="button" onClick={() => syncAds()} className="btn btn-sm">
          <Undo2 size={13} /> مزامنة الآن
        </button>
      </div>
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
                      <AdArtwork ad={ad} className="h-full w-full" showSky={false} />
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
                  {cityById(ad.cityId)?.name ?? "منبج"}
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

                    <IconBtn
                      title="تعديل تفاصيل الإعلان"
                      tone="navy"
                      onClick={() => openEditModal(ad)}
                    >
                      <Edit3 size={14} />
                    </IconBtn>

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
        ملاحظة: كل إجراء (تعديل / موافقة / رفض / تعليم كمُباع أو مؤجَّر / تمييز / حذف) يُسجَّل فوراً في «سجل
        العمليات» وينعكس مباشرة على الواجهة العامة وتلقيم فيسبوك.
      </p>

      {/* نافذة تعديل الإعلان */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-navy-700">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  تعديل الإعلان: <span className="font-mono text-emerald-600 dark:text-emerald-400">{editingAd.ref}</span>
                </h3>
                <p className="text-xs text-slate-500">عدّل البيانات وسيتم حفظها ونشرها فوراً لكل الزوار وتلقيم فيسبوك</p>
              </div>
              <button
                onClick={() => setEditingAd(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-navy-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-bold text-slate-700 dark:text-slate-200">
              <div>
                <label className="mb-1 block">عنوان الإعلان</label>
                <input
                  type="text"
                  value={editForm.title ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block">القسم</label>
                  <select
                    value={editForm.category ?? "real-estate"}
                    onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value as any }))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100"
                  >
                    {MAIN_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">المدينة</label>
                  <select
                    value={editForm.cityId ?? "manbij"}
                    onChange={(e) => setEditForm((p) => ({ ...p, cityId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block">السعر</label>
                  <input
                    type="number"
                    disabled={Boolean(editForm.priceOnRequest)}
                    value={editForm.price ?? 0}
                    onChange={(e) => setEditForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block">العملة</label>
                  <select
                    disabled={Boolean(editForm.priceOnRequest)}
                    value={editForm.currency ?? "USD"}
                    onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value as any }))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100 disabled:opacity-50"
                  >
                    <option value="USD">دولار أمريكي ($)</option>
                    <option value="SYP">ليرة سورية (ل.س)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.priceOnRequest)}
                    onChange={(e) => setEditForm((p) => ({ ...p, priceOnRequest: e.target.checked }))}
                  />
                  السعر عند الطلب
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.negotiable)}
                    onChange={(e) => setEditForm((p) => ({ ...p, negotiable: e.target.checked }))}
                  />
                  قابل للتفاوض
                </label>
              </div>

              <div>
                <label className="mb-1 block">تفاصيل / وصف الإعلان</label>
                <textarea
                  rows={4}
                  value={editForm.description ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block">رقم الهاتف (اتصال)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editForm.sellerPhone ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, sellerPhone: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block">رقم الواتساب</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editForm.sellerWhatsapp ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, sellerWhatsapp: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">حالة الإعلان</label>
                <select
                  value={editForm.status ?? "active"}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-100"
                >
                  <option value="active">منشور (نشط)</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="sold">تم البيع</option>
                  <option value="rented">تم التأجير</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-3 dark:border-navy-700">
              <button
                onClick={() => setEditingAd(null)}
                className="btn-ghost btn-sm"
                disabled={savingEdit}
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn-emerald btn-sm"
              >
                {savingEdit ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </div>
      )}
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
