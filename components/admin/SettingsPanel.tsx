"use client";

import React, { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Facebook,
  Phone,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wifi,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { displayPhone, formatMoney } from "@/lib/currency";
import SecurityPanel from "./SecurityPanel";

/** إعدادات المنصة: سعر الصرف، بيانات التواصل، وإعادة تعيين البيانات التجريبية */
export default function SettingsPanel() {
  const { settings, updateSettings, resetDemo, ads } = useStore();
  const toast = useToast();

  const [rate, setRate] = useState(String(settings.usdToSyp));
  const [phone, setPhone] = useState(settings.contactPhone);
  const [cc, setCc] = useState(settings.whatsappCountryCode);
  const [slogan, setSlogan] = useState(settings.siteSlogan);
  const [facebook, setFacebook] = useState(settings.facebookUrl);

  useEffect(() => {
    setRate(String(settings.usdToSyp));
    setPhone(settings.contactPhone);
    setCc(settings.whatsappCountryCode);
    setSlogan(settings.siteSlogan);
    setFacebook(settings.facebookUrl);
  }, [settings]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const r = Number(rate);
    if (!r || r < 100) {
      toast({
        type: "error",
        title: "سعر صرف غير منطقي",
        desc: "أدخل سعر صرف صحيحاً (مثال: 13000 ليرة للدولار).",
      });
      return;
    }
    updateSettings({
      usdToSyp: r,
      contactPhone: phone.trim(),
      whatsappCountryCode: cc.replace(/\D/g, "") || "963",
      siteSlogan: slogan.trim(),
      facebookUrl: facebook.trim() || settings.facebookUrl,
    });
    toast({
      type: "success",
      title: "تم حفظ الإعدادات",
      desc: `تم تحديث سعر الصرف إلى 1 $ = ${r.toLocaleString("en-US")} ل.س وتحديث كل الأسعار المعروضة.`,
    });
  };

  const rateNumber = Number(rate) || 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={save} className="card p-5">
        <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
          <CircleDollarSign size={17} className="text-amberBrand-500" /> محرّك العملة المزدوجة
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
          الأسعار مُخزَّنة في كل إعلان بالدولار والليرة معاً. تعديل سعر الصرف هنا يُعيد حساب العرض
          والفلترة في كل المنصة فوراً.
        </p>

        <div className="mt-4">
          <label className="label">سعر صرف الدولار (ل.س لكل 1 $)</label>
          <div className="relative">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min={100}
              className="input pl-16 text-lg font-bold"
              dir="ltr"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11.5px] font-bold text-navy-400">
              SYP / USD
            </span>
          </div>
          {rateNumber > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11.5px]">
              <div className="rounded-lg bg-navy-50 p-2.5 dark:bg-navy-800/60">
                <span className="text-navy-400">مثال سعر 100 $</span>
                <p className="mt-0.5 font-bold text-navy-700 dark:text-navy-100">
                  {formatMoney(rateNumber * 100, "SYP")}
                </p>
              </div>
              <div className="rounded-lg bg-navy-50 p-2.5 dark:bg-navy-800/60">
                <span className="text-navy-400">مثال سعر 5,000,000 ل.س</span>
                <p className="mt-0.5 font-bold text-navy-700 dark:text-navy-100">
                  $ {Math.round(5000000 / rateNumber).toLocaleString("en-US")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="divider my-5" />

        <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-navy-900 dark:text-white">
          <Phone size={15} className="text-emeraldBrand-500" /> بيانات التواصل والدعم
        </h4>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">رقم الدعم</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="0955555555"
            />
          </div>
          <div>
            <label className="label">مفتاح الدولة لواتساب</label>
            <input
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="963"
            />
            <p className="hint">يُستخدم في بناء روابط wa.me لكل الإعلانات.</p>
          </div>
        </div>

        <div className="mt-3">
          <label className="label">رابط صفحة فيسبوك (يظهر في الترويسة والتذييل)</label>
          <div className="relative">
            <Facebook
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-500"
            />
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="input pl-3 pr-9"
              dir="ltr"
              placeholder="https://www.facebook.com/badeel"
            />
          </div>
          <p className="hint">
            اترك الرابط كما هو حتى إنشاء الصفحة الرسمية — الأيقونة تظهر دائماً في الموقع.
          </p>
        </div>

        <div className="mt-3">
          <label className="label">الشعار النصي للمنصة</label>
          <input value={slogan} onChange={(e) => setSlogan(e.target.value)} className="input" />
        </div>

        <p className="mt-3 rounded-xl bg-navy-50/70 p-3 text-[11.5px] leading-relaxed text-navy-500 dark:bg-navy-900 dark:text-navy-300">
          الرقم المعروض حالياً للزوار:{" "}
          <span className="font-extrabold text-navy-700 dark:text-navy-100" dir="ltr">
            {displayPhone(settings.contactPhone, settings.whatsappCountryCode)}
          </span>{" "}
          — يُستخدم في زر الاتصال وزر واتساب في الترويسة والتذييل وفي صفحة «كيف يعمل بديل؟».
        </p>

        <button type="submit" className="btn-amber mt-5 w-full justify-center">
          <Save size={16} /> حفظ الإعدادات
        </button>
      </form>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
            <Wifi size={16} className="text-navy-500" /> حالة النظام
          </h3>
          <ul className="mt-3 space-y-2.5 text-[12.5px]">
            <Row label="البيانات الحالية" value={`${ads.length} إعلان في الذاكرة`} />
            <Row label="التخزين" value="localStorage + fallback في الجلسة" />
            <Row label="مصدر البيانات" value="Mock Store (جاهز للاستبدال بـ API)" />
            <Row label="سعر الصرف النشط" value={`1 $ = ${settings.usdToSyp.toLocaleString("en-US")} ل.س`} />
            <Row label="مفتاح واتساب" value={`+${settings.whatsappCountryCode}`} />
            <Row label="أمان اللوحة" value={settings.passwordChanged ? "كلمة مرور مخصّصة ✅" : "كلمة المرور الافتراضية ⚠️"} />
            <Row label="مدة الجلسة" value={`${settings.sessionMinutes} دقيقة — قفل بعد ${settings.maxLoginAttempts} محاولات`} />
          </ul>
        </div>

        <div className="card border-rose-200 bg-rose-50/50 p-5 dark:border-rose-500/30 dark:bg-rose-500/5">
          <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-rose-700 dark:text-rose-400">
            <ShieldAlert size={16} /> منطقة الخطر
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-navy-600 dark:text-navy-200">
            إعادة التعيين تُرجع كل الإعلانات والأحياء والإعدادات إلى الحالة الافتراضية (33 إعلاناً
            تجريبياً تغطي التصنيفات الستّة: عقارات، مركبات، أثاث، أجهزة كهربائية، ملابس، وظائف)،
            وتُحذف كل الإضافات والتعديلات التي أجريتها من لوحة التحكم.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("تأكيد إعادة تعيين كل بيانات المنصة إلى الحالة الافتراضية؟")) {
                resetDemo();
                toast({ type: "info", title: "تمت إعادة تعيين البيانات التجريبية" });
              }
            }}
            className="btn-danger mt-4 w-full justify-center"
          >
            <Trash2 size={15} /> إعادة تعيين البيانات التجريبية
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-navy-400">
            <RefreshCw size={11} /> لا يؤثر على المنشورات الحقيقية لاحقاً (سيُحمى بصلاحيات خادم).
          </p>
        </div>
      </div>
      </div>

      <SecurityPanel />
    </div>
  );
}

/* --------------------------- قسم الأمان منفصل --------------------------- */
export function SecuritySection() {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-navy-900 dark:text-white">
        <ShieldCheck size={18} className="text-emeraldBrand-500" /> الأمان وحماية اللوحة
      </h3>
      <SecurityPanel />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-navy-100 pb-2 last:border-0 dark:border-navy-800">
      <span className="text-navy-400">{label}</span>
      <span className="font-bold text-navy-700 dark:text-navy-100">{value}</span>
    </li>
  );
}
