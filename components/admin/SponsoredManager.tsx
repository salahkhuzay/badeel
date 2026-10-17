"use client";

/* ==========================================================================
   components/admin/SponsoredManager.tsx — إدارة المساحة المأجورة (موجة 20)
   --------------------------------------------------------------------------
   قائمة الحملات مع حالتها (حية/موقوفة/منتهية/قبل البداية) + نموذج إضافة
   وتعديل: المعلن، النص، الرابط أو الهاتف، صورة اختيارية، فترة السريان،
   والتفعيل. الحفظ يستبدل القائمة كاملة عبر setSponsored.
   ========================================================================== */

import React, { useState } from "react";
import { Megaphone, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { sponsoredStatus, todayStr, type SponsoredAd } from "@/lib/sponsored";
import { uid } from "@/lib/currency";
import { getRateKey } from "@/lib/remote-rate";
import { publishSponsored } from "@/lib/remote-sponsored";

const emptyForm = (): SponsoredAd => ({
  id: "",
  advertiser: "",
  title: "",
  subtitle: "",
  linkUrl: "",
  phone: "",
  imageUrl: "",
  startsAt: todayStr(),
  endsAt: todayStr(),
  enabled: true,
});

export default function SponsoredManager() {
  const { sponsored, setSponsored } = useStore();
  const [form, setForm] = useState<SponsoredAd>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pubState, setPubState] = useState("");

  /* نشر القائمة لكل الزوار عبر KV — بنفس مفتاح نشر السعر (تبويب الإعدادات) */
  const publish = async () => {
    const key = getRateKey().trim();
    if (!key) {
      setPubState("أدخل «مفتاح النشر» من تبويب الإعدادات والأمان أولاً ثم انشر.");
      return;
    }
    setPubState("جارٍ النشر…");
    const r = await publishSponsored(sponsored, key);
    setPubState(r.ok ? `تم النشر لكل الزوار (${r.count} حملة)` : `تعذّر النشر: ${r.error}`);
  };

  const set = (patch: Partial<SponsoredAd>) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    if (!form.title.trim() || !form.advertiser.trim()) return;
    if (form.endsAt < form.startsAt) return;
    if (editingId) {
      setSponsored(sponsored.map((a) => (a.id === editingId ? { ...form, id: editingId } : a)));
    } else {
      setSponsored([...sponsored, { ...form, id: uid("spn") }]);
    }
    setForm(emptyForm());
    setEditingId(null);
  };

  const edit = (a: SponsoredAd) => {
    setForm({ ...a });
    setEditingId(a.id);
  };

  const remove = (id: string) => {
    setSponsored(sponsored.filter((a) => a.id !== id));
    if (editingId === id) {
      setForm(emptyForm());
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-navy-900 dark:text-white">
          <Megaphone size={17} className="text-amberBrand-500" />
          المساحة الإعلانية المأجورة — الشريط أعلى الرئيسية
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-navy-500 dark:text-navy-300">
          كل حملة حية تظهر كشريط مميز أعلى هيرو الصفحة الرئيسية لكل الزوار. عند غياب أي حملة
          حية تعرض المساحة تلقائياً لافتة «مساحتك الإعلانية هنا» مع زر حجز عبر واتساب — فلا
          تبقى المساحة فارغة أبداً.
        </p>

        {/* النموذج */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            اسم المعلن *
            <input
              className="input mt-1"
              value={form.advertiser}
              onChange={(e) => set({ advertiser: e.target.value })}
              placeholder="مثال: معرض النور للسيارات"
            />
          </label>
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            النص الرئيسي *
            <input
              className="input mt-1"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="مثال: وصلت حديثاً — كيا سبورتاج 2024"
            />
          </label>
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            نص ثانوي
            <input
              className="input mt-1"
              value={form.subtitle ?? ""}
              onChange={(e) => set({ subtitle: e.target.value })}
              placeholder="مثال: أسعار تقسيط مريحة"
            />
          </label>
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            رابط الوجهة (اختياري)
            <input
              className="input mt-1"
              dir="ltr"
              value={form.linkUrl ?? ""}
              onChange={(e) => set({ linkUrl: e.target.value })}
              placeholder="https://…"
            />
          </label>
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            أو هاتف للاتصال (اختياري)
            <input
              className="input mt-1"
              dir="ltr"
              value={form.phone ?? ""}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="09xxxxxxxx"
            />
          </label>
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            صورة خلفية (رابط، اختياري)
            <input
              className="input mt-1"
              dir="ltr"
              value={form.imageUrl ?? ""}
              onChange={(e) => set({ imageUrl: e.target.value })}
              placeholder="https://…/banner.jpg"
            />
          </label>
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            من تاريخ
            <input
              className="input mt-1"
              type="date"
              value={form.startsAt}
              onChange={(e) => set({ startsAt: e.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-navy-600 dark:text-navy-300">
            إلى تاريخ
            <input
              className="input mt-1"
              type="date"
              value={form.endsAt}
              onChange={(e) => set({ endsAt: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-navy-600 sm:col-span-2 dark:text-navy-300">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => set({ enabled: e.target.checked })}
            />
            حملة مفعّلة (إيقافها يخفي البانر فوراً دون حذف الحملة)
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-amber px-5" onClick={save}>
            <Plus size={15} /> {editingId ? "حفظ التعديلات" : "إضافة الحملة"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-ghost px-4"
              onClick={() => {
                setForm(emptyForm());
                setEditingId(null);
              }}
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        {/* النشر العام: التعديلات محلية حتى تُنشر — كجسر السعر تماماً */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-100 pt-4 dark:border-navy-800">
          <button type="button" className="btn-ghost px-4" onClick={publish}>
            <Send size={15} /> نشر المساحة لكل الزوار
          </button>
          {pubState && (
            <span className="text-[11px] font-bold text-navy-500 dark:text-navy-300">{pubState}</span>
          )}
          <span className="w-full text-[11px] leading-relaxed text-navy-400">
            التعديلات تبقى في متصفحك حتى تنشرها — وبعدها يراها كل الزوار فوراً عبر المخزن
            السحابي، بنفس مفتاح نشر سعر الصرف.
          </span>
        </div>
      </div>

      {/* القائمة */}
      <div className="card overflow-hidden">
        <div className="border-b border-navy-100 px-5 py-3 text-sm font-extrabold text-navy-800 dark:border-navy-800 dark:text-navy-100">
          الحملات ({sponsored.length})
        </div>
        {sponsored.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-navy-400">
            لا حملات بعد — المساحة تعرض الآن لافتة الحجز تلقائياً.
          </p>
        ) : (
          <ul className="divide-y divide-navy-100 dark:divide-navy-800">
            {sponsored.map((a) => {
              const st = sponsoredStatus(a);
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-navy-900 dark:text-white">
                      {a.title}
                    </div>
                    <div className="text-[11px] text-navy-400">
                      {a.advertiser} · {a.startsAt} ← {a.endsAt}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      st === "حية"
                        ? "bg-emeraldBrand-100 text-emeraldBrand-700 dark:bg-emeraldBrand-500/15 dark:text-emeraldBrand-300"
                        : "bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-300"
                    }`}
                  >
                    {st}
                  </span>
                  <button
                    type="button"
                    className="btn-icon text-navy-500 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-navy-800"
                    title="تعديل"
                    onClick={() => edit(a)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon text-navy-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    title="حذف"
                    onClick={() => remove(a.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
