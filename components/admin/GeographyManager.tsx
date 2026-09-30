"use client";

import React, { useState } from "react";
import { Building2, MapPin, Plus, Trash2, Trees, Globe2, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

/**
 * إدارة الأحياء والقرى + التوسّع الإقليمي.
 * بنية البيانات نفسها تعمل لأي مدينة جديدة (مثال: تفعيل حلب وإضافة أحيائها).
 */
export default function GeographyManager() {
  const { cities, addDistrict, deleteDistrict, toggleCity, districtOptions } = useStore();
  const toast = useToast();

  const [cityId, setCityId] = useState("manbij");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"neighborhood" | "village">("neighborhood");

  const city = cities.find((c) => c.id === cityId)!;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (clean.length < 2) {
      toast({ type: "error", title: "اسم المنطقة قصير جداً" });
      return;
    }
    if (city.districts.some((d) => d.name === clean)) {
      toast({ type: "error", title: "المنطقة موجودة مسبقاً", desc: clean });
      return;
    }
    addDistrict(cityId, clean, kind);
    toast({
      type: "success",
      title: "تمت إضافة المنطقة",
      desc: `"${clean}" متاحة الآن في نموذج إضافة الإعلان وفلترة البحث.`,
    });
    setName("");
  };

  const remove = (districtId: string, districtName: string) => {
    if (confirm(`حذف "${districtName}" من قائمة المناطق؟ الإعلانات المرتبطة ستبقى لكن بدون حي.`)) {
      deleteDistrict(cityId, districtId);
      toast({ type: "info", title: "تم حذف المنطقة", desc: districtName });
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      {/* قائمة المدن والأحياء */}
      <div className="space-y-4">
        {cities.map((c) => (
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
                    {c.districts.length} منطقة ·{" "}
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

            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.districts.map((d) => (
                <span
                  key={d.id}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-navy-100 bg-navy-50/60 py-1.5 pe-1.5 ps-2.5 text-[12px] font-semibold text-navy-700 dark:border-navy-800 dark:bg-navy-800/50 dark:text-navy-100"
                >
                  {d.kind === "village" ? (
                    <Trees size={12} className="text-emeraldBrand-500" />
                  ) : (
                    <MapPin size={12} className="text-amberBrand-500" />
                  )}
                  {d.name}
                  <button
                    onClick={() => remove(d.id, d.name)}
                    className="rounded p-1 text-navy-300 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                    title={`حذف ${d.name}`}
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>

            {c.id === "aleppo" && (
              <p className="mt-3 rounded-xl bg-amberBrand-50 p-3 text-[11.5px] leading-relaxed text-navy-600 dark:bg-amberBrand-500/10 dark:text-navy-200">
                <b>جاهزية التوسّع:</b> فعّل مدينة حلب من الزر أعلاه لتظهر أحياؤها فوراً في نموذج
                إضافة الإعلان وقوائم الفلترة والبحث، دون أي تعديل على الكود.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* إضافة منطقة */}
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <form onSubmit={add} className="card p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
            <Plus size={16} className="text-emeraldBrand-500" /> إضافة حي / قرية جديدة
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
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حي المحطة / قرية الجراحي"
              className="input"
            />
          </div>

          <div className="mt-4">
            <label className="label">النوع</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "neighborhood" as const, label: "حي داخل المدينة", icon: <MapPin size={14} /> },
                { id: "village" as const, label: "قرية / ريف", icon: <Trees size={14} /> },
              ].map((k) => (
                <button
                  type="button"
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`option-card justify-center py-2.5 ${
                    kind === k.id ? "option-card-active" : ""
                  }`}
                >
                  <span className="text-navy-500 dark:text-navy-200">{k.icon}</span>
                  <span className="text-[12.5px] font-bold text-navy-800 dark:text-navy-100">
                    {k.label}
                  </span>
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
            <CheckCircle2 size={15} className="text-emeraldBrand-500" /> بنية قابلة للتوسّع
          </h3>
          <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
            <li>• المدن والأحياء مخزّنة كبيانات (DB-ready) وليست قيماً ثابتة في الكود.</li>
            <li>• عدد المناطق المتاحة حالياً في الفلاتر: <b>{districtOptions().length}</b> منطقة.</li>
            <li>
              • كل إعلان مرتبط بمدينة + منطقة عبر مُعرّفات (cityId / districtId)، ما يسهّل الانتقال
              إلى قاعدة بيانات حقيقية لاحقاً.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
