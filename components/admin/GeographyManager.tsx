"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Globe2,
  Home,
  Map as MapIcon,
  MapPin,
  Plus,
  Trash2,
  Trees,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { DISTRICT_KINDS, districtKindShort } from "@/lib/geo";
import type { DistrictKind } from "@/lib/types";

/* ==========================================================================
   إدارة المناطق (أحياء / قرى / ريف) والتوسّع الإقليمي
   - لا قوائم ثابتة: المناطق تُضاف تلقائياً عندما يكتبها المستخدمون في نموذج
     الإعلان، أو يدوياً من هنا.
   - يمكن تعديل نوع أي منطقة، أو حذف المناطق غير المستخدمة.
   ========================================================================== */

const KIND_ICON: Record<DistrictKind, React.ReactNode> = {
  neighborhood: <Home size={12} className="text-amberBrand-500" />,
  village: <Trees size={12} className="text-emeraldBrand-500" />,
  area: <MapIcon size={12} className="text-navy-400" />,
};

export default function GeographyManager() {
  const {
    cities,
    ads,
    districtFacets,
    ensureDistrict,
    setDistrictKind,
    deleteDistrict,
    toggleCity,
  } = useStore();
  const toast = useToast();

  const [cityId, setCityId] = useState("manbij");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<DistrictKind>("neighborhood");

  const city = cities.find((c) => c.id === cityId)!;
  const allFacets = districtFacets("all");

  /* عدد الإعلانات لكل منطقة (لكل الحالات) + المناطق غير المستخدمة من السجل */
  const rows = useMemo(() => {
    return cities.map((c) => {
      const fromRegistry = c.districts.map((d) => ({
        district: d,
        count: allFacets.find((f) => f.cityId === c.id && f.id === d.id)?.count ?? 0,
        inRegistry: true,
      }));
      // مناطق موجودة في الإعلانات لكن غير مسجّلة في السجل (احتياطي)
      const orphans = allFacets
        .filter((f) => f.cityId === c.id && !c.districts.some((d) => d.id === f.id))
        .map((f) => ({
          district: { id: f.id, name: f.name, kind: f.kind, createdBy: "user" as const },
          count: f.count,
          inRegistry: false,
        }));
      const all = [...fromRegistry, ...orphans].sort(
        (a, b) => b.count - a.count || a.district.name.localeCompare(b.district.name, "ar")
      );
      return { city: c, districts: all };
    });
  }, [cities, allFacets]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (clean.length < 2) {
      toast({ type: "error", title: "اسم المنطقة قصير جداً" });
      return;
    }
    const existing = city.districts.find((d) => d.name === clean);
    if (existing) {
      toast({ type: "error", title: "المنطقة موجودة مسبقاً", desc: clean });
      return;
    }
    ensureDistrict(cityId, clean, kind);
    toast({
      type: "success",
      title: "تمت إضافة المنطقة",
      desc: `"${clean}" متاحة الآن في الفرز والبحث ونموذج الإعلان.`,
    });
    setName("");
  };

  const remove = (districtId: string, districtName: string, count: number) => {
    if (count > 0) {
      toast({
        type: "error",
        title: "لا يمكن حذف منطقة مرتبطة بإعلانات",
        desc: `"${districtName}" مستخدمة في ${count} إعلان. انقل الإعلانات أو احذفها أولاً.`,
      });
      return;
    }
    if (confirm(`حذف "${districtName}" من قائمة المناطق؟`)) {
      deleteDistrict(cityId, districtId);
      toast({ type: "info", title: "تم حذف المنطقة", desc: districtName });
    }
  };

  const totalUsed = allFacets.reduce((s, f) => s + f.count, 0);
  const byKind = DISTRICT_KINDS.map((k) => ({
    ...k,
    districts: allFacets.filter((f) => f.kind === k.id).length,
    ads: allFacets.filter((f) => f.kind === k.id).reduce((s, f) => s + f.count, 0),
  }));

  return (
    <div className="space-y-4">
      {/* ملخّص */}
      <div className="grid gap-3 sm:grid-cols-3">
        {byKind.map((k) => (
          <div key={k.id} className="card flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-lg dark:bg-navy-800">
              {KIND_ICON[k.id]}
            </span>
            <div>
              <p className="text-[11.5px] font-semibold text-navy-400">{k.name}</p>
              <p className="text-lg font-extrabold text-navy-900 dark:text-white">
                {k.districts} منطقة
              </p>
              <p className="text-[11px] text-navy-400">{k.ads} إعلان</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* قائمة المدن والمناطق */}
        <div className="space-y-4">
          {rows.map(({ city: c, districts }) => (
            <div key={c.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white dark:bg-white dark:text-navy-900">
                    <Building2 size={19} />
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-navy-900 dark:text-white">
                      {c.name}
                      <span className="text-[11.5px] font-semibold text-navy-400">
                        محافظة {c.governorate}
                      </span>
                    </h3>
                    <p className="text-[11.5px] text-navy-400">
                      {districts.length} منطقة مسجّلة ·{" "}
                      {districts.reduce((s, d) => s + d.count, 0)} إعلان ·{" "}
                      {c.active ? "مُفعّلة على الواجهة العامة" : "غير مُفعّلة (توسّع قادم)"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleCity(c.id);
                    toast({
                      type: c.active ? "info" : "success",
                      title: c.active ? `تم إيقاف ${c.name}` : `تم تفعيل ${c.name}`,
                    });
                  }}
                  className={`btn btn-sm ${
                    c.active
                      ? "bg-emeraldBrand-500 text-white hover:bg-emeraldBrand-600"
                      : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-200"
                  }`}
                >
                  <Globe2 size={14} />
                  {c.active ? "مُفعّلة" : "تفعيل المدينة"}
                </button>
              </div>

              {districts.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-navy-200 p-4 text-center dark:border-navy-700">
                  <Users size={18} className="mx-auto text-navy-300" />
                  <p className="mt-1.5 text-[12.5px] font-bold text-navy-600 dark:text-navy-200">
                    لا توجد مناطق بعد
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-navy-400">
                    المناطق تُنشأ تلقائياً عندما يكتبها المستخدمون في نموذج «أضف إعلانك» (إدخال
                    يدوي)، أو أضفها من اللوحة المجاورة.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {districts.map(({ district: d, count, inRegistry }) => (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-navy-100 p-2.5 dark:border-navy-800"
                    >
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-2 py-1 text-[11.5px] font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-100">
                        {KIND_ICON[d.kind]}
                        {districtKindShort(d.kind)}
                      </span>

                      <span className="text-[13px] font-bold text-navy-800 dark:text-navy-50">
                        {d.name}
                      </span>

                      <span className="badge bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-300">
                        {count} إعلان
                      </span>

                      {!inRegistry && (
                        <span className="badge bg-amberBrand-100 text-amberBrand-700 dark:bg-amberBrand-500/15 dark:text-amberBrand-400">
                          <TriangleAlert size={10} /> من إدخال المستخدمين
                        </span>
                      )}

                      {/* تغيير نوع المنطقة */}
                      <select
                        value={d.kind}
                        onChange={(e) => {
                          setDistrictKind(c.id, d.id, e.target.value as DistrictKind);
                          toast({ type: "info", title: `تم تغيير نوع "${d.name}"` });
                        }}
                        className="ms-auto select w-32 py-1 text-[11.5px]"
                        aria-label={`نوع منطقة ${d.name}`}
                      >
                        {DISTRICT_KINDS.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.short}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => remove(d.id, d.name, count)}
                        disabled={count > 0}
                        title={count > 0 ? "لا يمكن الحذف — مرتبطة بإعلانات" : `حذف ${d.name}`}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                          count > 0
                            ? "cursor-not-allowed border-navy-100 text-navy-300 dark:border-navy-800"
                            : "border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                        }`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {c.id === "aleppo" && (
                <p className="mt-3 rounded-xl bg-amberBrand-50 p-3 text-[11.5px] leading-relaxed text-navy-600 dark:bg-amberBrand-500/10 dark:text-navy-200">
                  <b>جاهزية التوسّع:</b> فعّل مدينة حلب ليصبح بوسع المستخدمين نشر إعلانات فيها
                  وإدخال أحيائها يدوياً — وستظهر كل منطقة جديدة تلقائياً في قوائم الفرز والبحث.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* إضافة منطقة + شرح */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={add} className="card p-5">
            <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
              <Plus size={16} className="text-emeraldBrand-500" /> إضافة منطقة (حي / قرية / ريف)
            </h3>

            <div className="mt-4">
              <label className="label">المدينة</label>
              <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="select">
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.governorate}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="label">اسم المنطقة</label>
              <div className="relative">
                <MapPin
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: حي المحطة / قرية الجراحي"
                  className="input pr-9"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label">النوع</label>
              <div className="grid gap-2">
                {DISTRICT_KINDS.map((k) => (
                  <button
                    type="button"
                    key={k.id}
                    onClick={() => setKind(k.id)}
                    className={`option-card justify-between py-2.5 ${
                      kind === k.id ? "option-card-active" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[12.5px] font-bold text-navy-800 dark:text-navy-100">
                      {KIND_ICON[k.id]}
                      {k.name}
                    </span>
                    {kind === k.id && <CheckCircle2 size={15} className="text-amberBrand-500" />}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-emerald mt-5 w-full justify-center">
              <Plus size={16} /> إضافة المنطقة
            </button>
          </form>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-[13.5px] font-extrabold text-navy-900 dark:text-white">
              <CheckCircle2 size={15} className="text-emeraldBrand-500" /> كيف تعمل المناطق الآن؟
            </h3>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
              <li>
                • <b>لا قوائم أحياء ثابتة</b> — الطالب يكتب اسم الحي/القرية/المنطقة بيده في نموذج
                الإعلان.
              </li>
              <li>
                • كل اسم جديد يُسجَّل تلقائياً ويظهر فوراً في: فرز البحث، العرض المجمّع، فلتر الأنواع،
                واقتراحات النموذج.
              </li>
              <li>
                • الأسماء المتشابهة إملائياً (الحزوانة/الحزوانه) تُدمج تلقائياً في منطقة واحدة.
              </li>
              <li>
                • إجمالي المناطق المستخدمة حالياً: <b>{allFacets.length}</b> منطقة تخدم{" "}
                <b>{totalUsed}</b> إعلاناً.
              </li>
              <li>• لا يمكن حذف منطقة مرتبطة بإعلانات، حفاظاً على سلامة البيانات.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
