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
import { contactNumbers } from "@/lib/contact";
import SecurityPanel from "./SecurityPanel";
import {
  fetchRemoteRate,
  getRateKey,
  publishRemoteRate,
  setRateKey,
  type RemoteRate,
} from "@/lib/remote-rate";

/** إعدادات المنصة: سعر الصرف، بيانات التواصل، وإعادة تعيين بيانات المنصة */
export default function SettingsPanel() {
  const { settings, updateSettings, resetDemo, ads, remoteRate } = useStore();
  const toast = useToast();

  const [rate, setRate] = useState(String(settings.usdToSyp));
  const [phone, setPhone] = useState(settings.contactPhone);
  const [phone2, setPhone2] = useState(settings.contactPhone2 ?? "");
  const [cc, setCc] = useState(settings.whatsappCountryCode);
  const [slogan, setSlogan] = useState(settings.siteSlogan);
  const [facebook, setFacebook] = useState(settings.facebookUrl);
  /* النشر العام للسعر: المفتاح + حالة الخادم */
  const [rateKey, setRateKeyState] = useState("");
  const [server, setServer] = useState<RemoteRate | null>(remoteRate);
  const [refreshing, setRefreshing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setRateKeyState(getRateKey());
  }, []);

  const refreshServer = async () => {
    setRefreshing(true);
    const r = await fetchRemoteRate();
    setServer(r);
    setRefreshing(false);
  };

  useEffect(() => {
    setRate(String(settings.usdToSyp));
    setPhone(settings.contactPhone);
    setPhone2(settings.contactPhone2 ?? "");
    setCc(settings.whatsappCountryCode);
    setSlogan(settings.siteSlogan);
    setFacebook(settings.facebookUrl);
  }, [settings]);

  const save = async (e: React.FormEvent) => {
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
      rateUpdatedAt: new Date().toISOString(),
      contactPhone: phone.trim(),
      contactPhone2: phone2.trim(),
      whatsappCountryCode: cc.replace(/\D/g, "") || "963",
      siteSlogan: slogan.trim(),
      facebookUrl: facebook.trim() || settings.facebookUrl,
    });
    /* نشر السعر لكل الزوار عبر المخزن السحابي (Upstash KV) */
    setPublishing(true);
    const pub = await publishRemoteRate(r, getRateKey());
    setPublishing(false);
    if (pub.ok) {
      setServer({ usdToSyp: r, updatedAt: pub.updatedAt, source: "kv" });
      toast({
        type: "success",
        title: "تم الحفظ والنشر لكل الزوار",
        desc: `السعر الرسمي الآن 1 $ = ${r.toLocaleString("en-US")} ل.س في كل المنصة.`,
      });
    } else {
      toast({
        type: "info",
        title: "حُفظ في هذا المتصفح فقط",
        desc: `${pub.error} — أدخل «مفتاح النشر» أدناه ليصل السعر إلى كل الزوار.`,
      });
    }
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

          {/* أزرار تعديل سريع — السعر يتغير يومياً فتكفي نقرة على الجوال */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[-500, -100, +100, +500].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  const next = Math.max(100, (Number(rate) || 0) + d);
                  setRate(String(next));
                }}
                className="rounded-lg border border-navy-200 px-2.5 py-1 text-[11.5px] font-bold text-navy-600 transition hover:border-amberBrand-400 hover:text-amberBrand-600 dark:border-navy-700 dark:text-navy-200"
                dir="ltr"
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
            <span className="self-center text-[10.5px] text-navy-400">تعديل سريع ثم «حفظ»</span>
          </div>

          {settings.rateUpdatedAt && (
            <p className="hint mt-2">
              آخر تعديل يدوي: {new Date(settings.rateUpdatedAt).toLocaleString("ar-SY")}
            </p>
          )}
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

          {/* نطاق سريان التعديل — بصراحة كاملة عن وضع «بلا خادم» الحالي */}
          <p className="mt-3 rounded-lg border border-emeraldBrand-500/30 bg-emeraldBrand-500/5 p-2.5 text-[11px] leading-relaxed text-emeraldBrand-700 dark:text-emeraldBrand-300">
            عند الحفظ يُنشر السعر <b>فوراً لكل الزوار</b> عبر المخزن السحابي المرتبط بالمنصة
            (Upstash KV) فيصير هو السعر الرسمي في كل الصفحات والفلترة. وإن تعذّر النشر — غياب
            مفتاح النشر أو انقطاع الاتصال — يبقى محفوظاً في متصفحك فقط ويظهر تنبيه بذلك.
          </p>

          {/* حالة السعر العام + مفتاح النشر */}
          <div className="mt-3 rounded-lg border border-navy-200 p-3 dark:border-navy-700">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-extrabold text-navy-700 dark:text-navy-100">
                السعر العام النافذ لكل الزوار
              </span>
              <button
                type="button"
                onClick={refreshServer}
                className="flex items-center gap-1 rounded-lg border border-navy-200 px-2 py-1 text-[10.5px] font-bold text-navy-500 transition hover:text-amberBrand-600 dark:border-navy-700 dark:text-navy-300"
              >
                <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> تحديث
              </button>
            </div>
            <p className="mt-1 text-[13px] font-extrabold text-navy-900 dark:text-white" dir="ltr">
              {server
                ? `1 $ = ${server.usdToSyp.toLocaleString("en-US")} SYP`
                : "لم يُجلب بعد — اضغط «تحديث»"}
            </p>
            {server?.updatedAt ? (
              <p className="hint mt-0.5">
                آخر نشر: {new Date(server.updatedAt).toLocaleString("ar-SY")}
              </p>
            ) : null}

            <label className="label mt-3">مفتاح النشر (RATE_WRITE_KEY)</label>
            <input
              type="password"
              value={rateKey}
              onChange={(e) => setRateKeyState(e.target.value)}
              onBlur={() => setRateKey(rateKey.trim())}
              placeholder="يُحفظ في متصفحك فقط ولا يُرسل إلا للخادم"
              className="input"
              dir="ltr"
              autoComplete="off"
            />
            <p className="hint mt-1">
              يُكتب مرة واحدة؛ ويجب أن يطابق متغيّر <span dir="ltr">RATE_WRITE_KEY</span> المضبوط
              في Vercel. بدونه يُحفظ السعر محلياً فقط.
            </p>
            {publishing && <p className="hint mt-1">جارٍ النشر لكل الزوار…</p>}
          </div>
        </div>

        <div className="divider my-5" />

        <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-navy-900 dark:text-white">
          <Phone size={15} className="text-emeraldBrand-500" /> بيانات التواصل والدعم
        </h4>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">رقم الدعم (الأساسي)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="0955555555"
            />
            <p className="hint">
              اتصال + واتساب. غيّره متى شئت — يُحفظ ولا يُستبدل تلقائياً أبداً بعد ذلك.
            </p>
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
          <label className="label">رقم ثانٍ — اختياري</label>
          <input
            value={phone2}
            onChange={(e) => setPhone2(e.target.value)}
            className="input"
            dir="ltr"
            placeholder="اتركه فارغاً فلا يظهر أي رقم ثانٍ"
          />
          <p className="hint">
            عند تعبئته يظهر تلقائياً بجانب الرقم الأساسي في التذييل والترويسة وصفحة «كيف يعمل
            بديل؟» — وعند تركه فارغاً يختفي تماماً. جاهز لأي رقم جديد متى احتجته.
          </p>
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
              placeholder="https://www.facebook.com/share/..."
            />
          </div>
          <p className="hint">
            الرابط الرسمي الحالي لصفحة بديل. يمكنك تغييره أو تحديثه متى شئت — والأيقونة تظهر
            دائماً في الموقع.
          </p>
        </div>

        <div className="mt-3">
          <label className="label">الشعار النصي للمنصة</label>
          <input value={slogan} onChange={(e) => setSlogan(e.target.value)} className="input" />
        </div>

        <p className="mt-3 rounded-xl bg-navy-50/70 p-3 text-[11.5px] leading-relaxed text-navy-500 dark:bg-navy-900 dark:text-navy-300">
          {contactNumbers(settings).length > 1 ? "الأرقام المعروضة حالياً للزوار:" : "الرقم المعروض حالياً للزوار:"}{" "}
          <span className="font-extrabold text-navy-700 dark:text-navy-100" dir="ltr">
            {contactNumbers(settings)
              .map((p) => displayPhone(p, settings.whatsappCountryCode))
              .join(" · ")}
          </span>{" "}
          — تُستخدم في زر الاتصال وزر واتساب في الترويسة والتذييل وفي صفحة «كيف يعمل بديل؟».
          الأرقام التي تضبطها هنا محفوظة ولا يمسّها أي تحديث تلقائي.
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
            إعادة التعيين <b>تحذف كل الإعلانات الموجودة</b> (بما فيها الإعلانات الحقيقية التي
            نشرها المستخدمون) وتُرجع الإعدادات والمدن إلى حالتها الأولى. لا تُستعاد الإعلانات
            التجريبية — فقد حُذفت من الموقع نهائياً.
          </p>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "تحذير: سيُحذف كل إعلان في المنصة (بما فيها الإعلانات الحقيقية) وتعود الإعدادات إلى حالتها الأولى. لا يمكن التراجع — هل تريد المتابعة؟"
                )
              ) {
                resetDemo();
                toast({ type: "info", title: "تمت إعادة تعيين بيانات المنصة" });
              }
            }}
            className="btn-danger mt-4 w-full justify-center"
          >
            <Trash2 size={15} /> إعادة تعيين بيانات المنصة
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-navy-400">
            <RefreshCw size={11} /> عدد الإعلانات الحالية: {ads.length} — ستُحذف كلها.
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
