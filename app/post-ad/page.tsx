"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Building,
  CalendarDays,
  Car,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Home,
  Image as ImageIcon,
  Info,
  LandPlot,
  MessageCircle,
  Phone,
  Ruler,

  Sparkles,
  Store,
  Trees,
  Truck,
  Bike,
  Tractor,
  User,
  Warehouse,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import AdCard from "@/components/AdCard";
import StatusBadge from "@/components/StatusBadge";
import AdPreviewModal from "@/components/AdPreviewModal";
import { cn, formatMoney, nextRef, uid } from "@/lib/currency";
import {
  AREA_UNITS,
  BODY_CONDITIONS,
  DEAL_TYPES,
  DONUM_TYPES,
  FUEL_TYPES,
  OWNERSHIP_TYPES,
  PLATE_REGIONS,
  PROPERTY_TYPES,
  VEHICLE_TYPES,
  YEAR_REQUIRED,
} from "@/lib/taxonomy";
import type {
  Ad,
  AreaUnit,
  BodyCondition,
  Currency,
  DealType,
  FuelType,
  MainCategory,
  OwnershipType,
  PlateRegion,
  PropertyType,
  VehicleType,
} from "@/lib/types";

/* أيقونات أنواع العقارات والمركبات */
const PROPERTY_ICONS: Record<PropertyType, React.ReactNode> = {
  apartment: <Building size={20} />,
  house: <Home size={20} />,
  "land-building": <LandPlot size={20} />,
  "land-agricultural": <Trees size={20} />,
  shop: <Store size={20} />,
  warehouse: <Warehouse size={20} />,
};

const VEHICLE_ICONS: Record<VehicleType, React.ReactNode> = {
  passenger: <CarFront size={20} />,
  truck: <Truck size={20} />,
  motorcycle: <Bike size={20} />,
  machinery: <Tractor size={20} />,
};

/** صورة نموذجية من مكتبة بديل (بدل رفع الملفات في هذا العرض التجريبي) */
const SAMPLE_IMAGES = [
  "/images/apt-1.jpg",
  "/images/house-1.jpg",
  "/images/land-1.jpg",
  "/images/shop-1.jpg",
  "/images/car-1.jpg",
  "/images/truck-1.jpg",
  "/images/moto-1.jpg",
  "/images/tractor-1.jpg",
];

interface FormState {
  category: MainCategory;
  propertyType: PropertyType | "";
  dealType: DealType | "";
  areaSize: string;
  areaUnit: AreaUnit;
  ownership: OwnershipType | "";
  vehicleType: VehicleType | "";
  make: string;
  model: string;
  year: string;
  bodyCondition: BodyCondition | "";
  fuelType: FuelType | "";
  plateRegion: PlateRegion | "";
  title: string;
  description: string;
  price: string;
  currency: Currency;
  negotiable: boolean;
  cityId: string;
  districtId: string;
  images: string[];
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sameWhatsapp: boolean;
}

const INITIAL: FormState = {
  category: "real-estate",
  propertyType: "",
  dealType: "sale",
  areaSize: "",
  areaUnit: "m2",
  ownership: "",
  vehicleType: "",
  make: "",
  model: "",
  year: "",
  bodyCondition: "",
  fuelType: "",
  plateRegion: "",
  title: "",
  description: "",
  price: "",
  currency: "USD",
  negotiable: true,
  cityId: "manbij",
  districtId: "",
  images: [],
  sellerName: "",
  sellerPhone: "",
  sellerWhatsapp: "",
  sameWhatsapp: true,
};

export default function PostAdPage() {
  const { cities, settings, addAd, ads, toUsd, toSyp } = useStore();
  const toast = useToast();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Ad | null>(null);
  const [showPreview, setShowPreview] = useState(false); // شاشة المعاينة قبل الإرسال
  const [previewRef, setPreviewRef] = useState("BD-###");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const activeCities = cities.filter((c) => c.active);
  const districts = activeCities.find((c) => c.id === form.cityId)?.districts ?? [];

  /* تحويل السعر الفوري للعملة الأخرى */
  const priceNumber = Number(form.price) || 0;
  const converted = useMemo(() => {
    if (!priceNumber) return null;
    return form.currency === "USD"
      ? { other: toSyp(priceNumber, "USD"), label: "ل.س" }
      : { other: toUsd(priceNumber, "SYP"), label: "$" };
  }, [priceNumber, form.currency, toSyp, toUsd]);

  const isLand = form.category === "real-estate" && DONUM_TYPES.includes(form.propertyType as PropertyType);
  const yearRequired =
    form.category === "vehicles" && YEAR_REQUIRED.includes(form.vehicleType as VehicleType);

  /* ------------------------------- التحقق ------------------------------- */
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 10) e.title = "أدخل عنواناً واضحاً لا يقل عن 10 أحرف.";
    if (form.description.trim().length < 30)
      e.description = "اكتب وصفاً مفصّلاً لا يقل عن 30 حرفاً (الحالة، الأوراق، الموقع...).";
    if (!form.districtId) e.districtId = "اختر الحي أو المنطقة.";
    if (!priceNumber || priceNumber <= 0) e.price = "أدخل سعراً صحيحاً أكبر من صفر.";
    if (form.sellerName.trim().length < 3) e.sellerName = "أدخل اسمك أو اسم المكتب.";
    const phoneDigits = form.sellerPhone.replace(/\D/g, "");
    if (phoneDigits.length < 8) e.sellerPhone = "أدخل رقم هاتف صحيح (مثال: 0955123456).";
    if (!form.sameWhatsapp && form.sellerWhatsapp.replace(/\D/g, "").length < 8)
      e.sellerWhatsapp = "أدخل رقم واتساب صحيح.";

    if (form.category === "real-estate") {
      if (!form.propertyType) e.propertyType = "اختر نوع العقار.";
      if (!form.dealType) e.dealType = "اختر نوع التعامل.";
      if (!form.areaSize || Number(form.areaSize) <= 0) e.areaSize = "أدخل مساحة صحيحة.";
      if (!form.ownership) e.ownership = "حدّد وضع أوراق الملكية.";
    } else {
      if (!form.vehicleType) e.vehicleType = "اختر نوع المركبة.";
      if (!form.make.trim()) e.make = "أدخل الماركة (مثال: كيا، هيونداي).";
      if (!form.model.trim()) e.model = "أدخل الموديل.";
      if (yearRequired && (!form.year || Number(form.year) < 1950 || Number(form.year) > 2026))
        e.year = "أدخل سنة صنع صحيحة (1950 - 2026).";
      if (!form.bodyCondition) e.bodyCondition = "حدّد حالة الجسم.";
      if (!form.fuelType) e.fuelType = "حدّد نوع الوقود.";
      if (!form.plateRegion) e.plateRegion = "حدّد نمرة التسجيل.";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast({
        type: "error",
        title: "يرجى إكمال الحقول المطلوبة",
        desc: `يوجد ${Object.keys(e).length} حقل بحاجة إلى تصحيح.`,
      });
      const first = document.querySelector("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  /* ------------------------------- الإرسال ------------------------------- */

  /** الخطوة 1: التحقّق ثم فتح شاشة المعاينة (لا يتم أي إرسال في هذه المرحلة) */
  function openPreview(validateFirst = true) {
    if (validateFirst && !validate()) return;
    setPreviewRef(nextRef(ads));
    setShowPreview(true);
  }

  /** الخطوة 2: الإرسال الفعلي بعد تأكيد المستخدم داخل شاشة المعاينة */
  function submit() {
    setShowPreview(false);
    if (!validate()) return;

    const price = Number(form.price);
    const ad: Ad = {
      id: uid("ad"),
      ref: previewRef !== "BD-###" ? previewRef : nextRef(ads),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,

      propertyType: form.category === "real-estate" ? (form.propertyType as PropertyType) : undefined,
      dealType: form.category === "real-estate" ? (form.dealType as DealType) : undefined,
      areaSize: form.category === "real-estate" ? Number(form.areaSize) : undefined,
      areaUnit: form.category === "real-estate" ? form.areaUnit : undefined,
      ownership: form.category === "real-estate" ? (form.ownership as OwnershipType) : undefined,

      vehicleType: form.category === "vehicles" ? (form.vehicleType as VehicleType) : undefined,
      make: form.category === "vehicles" ? form.make.trim() : undefined,
      model: form.category === "vehicles" ? form.model.trim() : undefined,
      year: form.category === "vehicles" && form.year ? Number(form.year) : undefined,
      bodyCondition:
        form.category === "vehicles" ? (form.bodyCondition as BodyCondition) : undefined,
      fuelType: form.category === "vehicles" ? (form.fuelType as FuelType) : undefined,
      plateRegion: form.category === "vehicles" ? (form.plateRegion as PlateRegion) : undefined,

      price,
      currency: form.currency,
      priceUsd: form.currency === "USD" ? price : toUsd(price, "SYP"),
      priceSyp: form.currency === "SYP" ? price : toSyp(price, "USD"),
      negotiable: form.negotiable,

      cityId: form.cityId,
      districtId: form.districtId,

      images: form.images,
      sellerName: form.sellerName.trim(),
      sellerPhone: form.sellerPhone.trim(),
      sellerWhatsapp: (form.sameWhatsapp ? form.sellerPhone : form.sellerWhatsapp).trim(),

      status: "pending", // ← قيد المراجعة: لا يظهر للجمهور قبل موافقة الإدارة
      featured: false,
      views: 0,
      createdAt: new Date().toISOString(),
      publishedAt: null,
      soldAt: null,
      rejectionReason: null,
      moderatedBy: null,
    };

    addAd(ad);
    setDone(ad);
    toast({
      type: "success",
      title: "تم إرسال إعلانك للمراجعة",
      desc: `رقم الإعلان ${ad.ref} — سيُنشر بعد موافقة فريق بديل.`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------------ شاشة النجاح ------------------------------ */
  if (done) {
    return (
      <div className="container-page py-10">
        <div className="card mx-auto max-w-2xl p-6 text-center sm:p-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emeraldBrand-50 text-emeraldBrand-600 dark:bg-emeraldBrand-500/10">
            <CheckCircle2 size={32} />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-navy-900 dark:text-white">
            تم إرسال إعلانك بنجاح 🎉
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-navy-500 dark:text-navy-300">
            إعلانك الآن <span className="font-bold text-amberBrand-600">قيد المراجعة</span> من فريق
            بديل، ولن يظهر للعموم حتى تتم الموافقة عليه. عادةً تستغرق المراجعة أقل من 12 ساعة.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <StatusBadge status="pending" />
            <span className="badge bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
              رقم الإعلان: {done.ref}
            </span>
            <span className="badge bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
              سيظهر في: منبج
            </span>
          </div>

          <div className="mt-6 text-right">
            <p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-navy-500 dark:text-navy-300">
              <Eye size={14} /> معاينة الإعلان كما سيظهر بعد الموافقة
            </p>
            <div className="pointer-events-none mx-auto max-w-sm opacity-95">
              <AdCard ad={done} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setForm(INITIAL);
                setDone(null);
              }}
              className="btn-amber"
            >
              <Sparkles size={16} /> إضافة إعلان آخر
            </button>
            <Link href="/" className="btn-ghost">
              العودة للرئيسية
            </Link>
            <Link href="/admin" className="btn-primary">
              لوحة التحكم (للمراجعة)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- النموذج -------------------------------- */
  const realEstate = form.category === "real-estate";

  /* عدد الحقول المعبّأة — يُعرض في شريط المعاينة */
  const filledCount = [
    form.title,
    form.description,
    form.price,
    form.districtId,
    form.sellerName,
    form.sellerPhone,
    form.images.length ? "x" : "",
    form.category === "real-estate" ? form.propertyType : form.vehicleType,
    form.category === "real-estate" ? form.ownership : form.bodyCondition,
  ].filter(Boolean).length;

  const previewData: Ad = { ...previewAd(form, { toUsd, toSyp }), ref: previewRef };

  return (
    <div className="container-page py-6">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy-900 dark:text-white sm:text-2xl">
          أضف إعلانك مجاناً
        </h1>
        <p className="mt-1 text-[12.5px] text-navy-500 dark:text-navy-300">
          إضافة الإعلان مجانية بالكامل. يُراجع الإعلان من قبل فريق بديل قبل النشر لضمان جودة
          المحتوى وصدق البيانات.
        </p>
        <p className="mt-3 inline-flex items-start gap-2 rounded-xl border border-amberBrand-200 bg-amberBrand-50/70 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-navy-700 dark:border-amberBrand-500/30 dark:bg-amberBrand-500/10 dark:text-navy-100">
          <Eye size={15} className="mt-0.5 shrink-0 text-amberBrand-600" />
          خطوة المعاينة إلزامية: عند الضغط على «إرسال» ستظهر لك شاشة معاينة كاملة للإعلان كما
          سيظهر للعموم، ولا تُرسل بياناتك إلا بعد تأكيدك.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          openPreview(true);
        }}
        className="grid gap-5 lg:grid-cols-[1fr_330px]"
      >
        <div className="space-y-5">
          {/* ============================ 1) التصنيف ============================ */}
          <Section step="1" title="نوع الإعلان" desc="اختر تصنيف الإعلان ثم حدّد التفاصيل الدقيقة">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "real-estate" as MainCategory,
                  name: "عقارات",
                  desc: "شقة، منزل عربي، أرض، محل، مستودع",
                  icon: <Building2 size={22} />,
                  tone: "emerald",
                },
                {
                  id: "vehicles" as MainCategory,
                  name: "سيارات ومركبات",
                  desc: "سيارة، شاحنة، دراجة، آليات ثقيلة",
                  icon: <Car size={22} />,
                  tone: "amber",
                },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    set("category", c.id);
                    set("propertyType", "");
                    set("vehicleType", "");
                  }}
                  className={cn(
                    "option-card items-center p-4",
                    form.category === c.id && "option-card-active"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                      c.tone === "emerald"
                        ? "bg-gradient-to-br from-emeraldBrand-500 to-emeraldBrand-700"
                        : "bg-gradient-to-br from-amberBrand-500 to-amberBrand-700"
                    )}
                  >
                    {c.icon}
                  </span>
                  <span className="text-right">
                    <span className="block text-[14.5px] font-extrabold text-navy-900 dark:text-white">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-navy-500 dark:text-navy-300">
                      {c.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Section>

          {/* ====================== 2) التفاصيل حسب التصنيف ====================== */}
          {realEstate ? (
            <Section step="2" title="تفاصيل العقار" desc="حدّد نوع العقار ونوع التعامل والمساحة والأوراق">
              <div data-error={Boolean(errors.propertyType)}>
                <label className="label">نوع العقار *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROPERTY_TYPES.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        set("propertyType", p.id);
                        if (DONUM_TYPES.includes(p.id) && !form.areaSize) set("areaUnit", "donum");
                        else if (!DONUM_TYPES.includes(p.id)) set("areaUnit", "m2");
                      }}
                      className={cn(
                        "option-card flex-col items-center gap-2 py-3 text-center",
                        form.propertyType === p.id && "option-card-active"
                      )}
                    >
                      <span className="text-navy-500 dark:text-navy-200">
                        {PROPERTY_ICONS[p.id]}
                      </span>
                      <span className="text-[12.5px] font-bold text-navy-800 dark:text-navy-100">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.propertyType && <p className="error-text">{errors.propertyType}</p>}
              </div>

              <div className="mt-5" data-error={Boolean(errors.dealType)}>
                <label className="label">نوع التعامل *</label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {DEAL_TYPES.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => set("dealType", d.id)}
                      className={cn(
                        "option-card flex-col items-start py-3",
                        form.dealType === d.id && "option-card-active"
                      )}
                    >
                      <span className="text-[13px] font-bold text-navy-800 dark:text-navy-100">
                        {d.name}
                      </span>
                      <span className="text-[11px] text-navy-400">{d.hint}</span>
                    </button>
                  ))}
                </div>
                {errors.dealType && <p className="error-text">{errors.dealType}</p>}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div data-error={Boolean(errors.areaSize)}>
                  <label className="label">المساحة *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ruler
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        min={1}
                        value={form.areaSize}
                        onChange={(e) => set("areaSize", e.target.value)}
                        placeholder={isLand ? "مثال: 12" : "مثال: 145"}
                        className="input pr-9"
                      />
                    </div>
                    <select
                      value={form.areaUnit}
                      onChange={(e) => set("areaUnit", e.target.value as AreaUnit)}
                      className="select w-36"
                    >
                      {AREA_UNITS.filter((u) => (isLand ? true : u.id === "m2")).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isLand && (
                    <p className="hint">للأراضي يُعتمد الدونم (1 دونم ≈ 1000 م² تقريباً في المنطقة).</p>
                  )}
                  {errors.areaSize && <p className="error-text">{errors.areaSize}</p>}
                </div>

                <div>
                  <label className="label">حالة التفاوض</label>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-navy-200 px-3.5 py-2.5 dark:border-navy-700">
                    <span className="text-[13px] font-semibold text-navy-700 dark:text-navy-100">
                      السعر قابل للتفاوض
                    </span>
                    <input
                      type="checkbox"
                      checked={form.negotiable}
                      onChange={(e) => set("negotiable", e.target.checked)}
                      className="h-4 w-4 accent-emeraldBrand-500"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5" data-error={Boolean(errors.ownership)}>
                <label className="label">وضع أوراق الملكية *</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {OWNERSHIP_TYPES.map((o) => (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => set("ownership", o.id)}
                      className={cn(
                        "option-card items-center py-3",
                        form.ownership === o.id && "option-card-active"
                      )}
                    >
                      <BadgeCheck size={17} className="text-emeraldBrand-500" />
                      <span>
                        <span className="block text-[13px] font-bold text-navy-800 dark:text-navy-100">
                          {o.name}
                        </span>
                        {o.hint && (
                          <span className="block text-[11px] text-navy-400">{o.hint}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.ownership && <p className="error-text">{errors.ownership}</p>}
              </div>
            </Section>
          ) : (
            <Section step="2" title="تفاصيل المركبة" desc="نوع المركبة، الماركة والموديل، الحالة والوقود والنمرة">
              <div data-error={Boolean(errors.vehicleType)}>
                <label className="label">نوع المركبة *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {VEHICLE_TYPES.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => set("vehicleType", v.id)}
                      className={cn(
                        "option-card flex-col items-center gap-2 py-3 text-center",
                        form.vehicleType === v.id && "option-card-active"
                      )}
                    >
                      <span className="text-navy-500 dark:text-navy-200">{VEHICLE_ICONS[v.id]}</span>
                      <span className="text-[12px] font-bold leading-tight text-navy-800 dark:text-navy-100">
                        {v.name}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.vehicleType && <p className="error-text">{errors.vehicleType}</p>}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div data-error={Boolean(errors.make)}>
                  <label className="label">الماركة *</label>
                  <input
                    value={form.make}
                    onChange={(e) => set("make", e.target.value)}
                    placeholder="كيا، هيونداي، ميتسوبيشي..."
                    className="input"
                  />
                  {errors.make && <p className="error-text">{errors.make}</p>}
                </div>
                <div data-error={Boolean(errors.model)}>
                  <label className="label">الموديل *</label>
                  <input
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                    placeholder="سيراتو، إلنترا، L200..."
                    className="input"
                  />
                  {errors.model && <p className="error-text">{errors.model}</p>}
                </div>
                <div data-error={Boolean(errors.year)}>
                  <label className="label">
                    سنة الصنع {yearRequired ? "*" : "(اختياري)"}
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                    />
                    <input
                      type="number"
                      min={1950}
                      max={2026}
                      value={form.year}
                      onChange={(e) => set("year", e.target.value)}
                      placeholder="2016"
                      className="input pr-9"
                    />
                  </div>
                  {errors.year && <p className="error-text">{errors.year}</p>}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div data-error={Boolean(errors.bodyCondition)}>
                  <label className="label">حالة الجسم *</label>
                  <select
                    value={form.bodyCondition}
                    onChange={(e) => set("bodyCondition", e.target.value as BodyCondition)}
                    className="select"
                  >
                    <option value="">— اختر —</option>
                    {BODY_CONDITIONS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.bodyCondition && <p className="error-text">{errors.bodyCondition}</p>}
                </div>
                <div data-error={Boolean(errors.fuelType)}>
                  <label className="label">نوع الوقود *</label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => set("fuelType", e.target.value as FuelType)}
                    className="select"
                  >
                    <option value="">— اختر —</option>
                    {FUEL_TYPES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  {errors.fuelType && <p className="error-text">{errors.fuelType}</p>}
                </div>
                <div data-error={Boolean(errors.plateRegion)}>
                  <label className="label">نمرة التسجيل *</label>
                  <select
                    value={form.plateRegion}
                    onChange={(e) => set("plateRegion", e.target.value as PlateRegion)}
                    className="select"
                  >
                    <option value="">— اختر —</option>
                    {PLATE_REGIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.plateRegion && <p className="error-text">{errors.plateRegion}</p>}
                </div>
              </div>
            </Section>
          )}

          {/* ========================== 3) الموقع الجغرافي ========================== */}
          <Section
            step="3"
            title="الموقع الجغرافي"
            desc="نظام أحياء محلي مخصّص لمنبج — جاهز للتوسّع لاحقاً إلى حلب"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">المدينة</label>
                <select
                  value={form.cityId}
                  onChange={(e) => {
                    set("cityId", e.target.value);
                    set("districtId", "");
                  }}
                  className="select"
                >
                  {activeCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.governorate}
                    </option>
                  ))}
                </select>
                <p className="hint">حلب ستُضاف قريباً كمدينة مستقلة.</p>
              </div>
              <div data-error={Boolean(errors.districtId)}>
                <label className="label">الحي / المنطقة *</label>
                <select
                  value={form.districtId}
                  onChange={(e) => set("districtId", e.target.value)}
                  className="select"
                >
                  <option value="">— اختر الحي أو الريف —</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.kind === "village" ? "(ريف)" : ""}
                    </option>
                  ))}
                </select>
                {errors.districtId && <p className="error-text">{errors.districtId}</p>}
              </div>
            </div>

            {/* اختيار سريع للأحياء */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {districts.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => set("districtId", d.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold transition",
                    form.districtId === d.id
                      ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                      : "border border-navy-200 text-navy-600 hover:border-amberBrand-400 dark:border-navy-700 dark:text-navy-200"
                  )}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </Section>

          {/* ============================== 4) المحتوى ============================== */}
          <Section step="4" title="عنوان الإعلان والوصف" desc="العنوان الواضح والوصف الدقيق يزيدان فرص البيع">
            <div data-error={Boolean(errors.title)}>
              <label className="label">عنوان الإعلان *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={90}
                placeholder={
                  realEstate
                    ? "شقة سكنية 145 م² للبيع في حي الكواكبي — طابو أخضر"
                    : "كيا سيراتو 2016 — خالية العلام أورجينال، نمرة منبج"
                }
                className="input"
              />
              <p className="hint">{form.title.length}/90 حرفاً</p>
              {errors.title && <p className="error-text">{errors.title}</p>}
            </div>

            <div className="mt-4" data-error={Boolean(errors.description)}>
              <label className="label">الوصف التفصيلي *</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
                maxLength={1500}
                placeholder={
                  realEstate
                    ? "اذكر: عدد الغرف، الطابق، الإكساء، الكهرباء والماء، المكتب التجاري، وضع الأوراق، سبب البيع..."
                    : "اذكر: العداد (كم)، الحالة الميكانيكية، الإطارات، القص والبخ، الصيانة الأخيرة، سبب البيع..."
                }
                className="input resize-y leading-7"
              />
              <p className="hint">{form.description.length}/1500 حرفاً</p>
              {errors.description && <p className="error-text">{errors.description}</p>}
            </div>
          </Section>

          {/* ============================== 5) السعر ============================== */}
          <Section
            step="5"
            title="السعر والعملة"
            desc="أدخل السعر بعملتك المفضّلة — يحوّله بديل تلقائياً ويُعرض بالعملتين معاً"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div data-error={Boolean(errors.price)}>
                <label className="label">
                  السعر * {form.dealType === "rent-monthly" ? "(عن الشهر)" : form.dealType === "rent-yearly" ? "(عن السنة)" : ""}
                </label>
                <div className="relative">
                  <CircleDollarSign
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder={form.currency === "USD" ? "38000" : "494000000"}
                    className="input pr-9 text-lg font-bold"
                  />
                </div>
                {errors.price && <p className="error-text">{errors.price}</p>}
              </div>

              <div>
                <label className="label">عملة الإدخال</label>
                <div className="flex gap-1 rounded-xl bg-navy-100/80 p-1 dark:bg-navy-800">
                  {(["USD", "SYP"] as Currency[]).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => set("currency", c)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-[12.5px] font-bold transition",
                        form.currency === c
                          ? "bg-white text-navy-900 shadow-sm dark:bg-navy-900 dark:text-white"
                          : "text-navy-500 dark:text-navy-200"
                      )}
                    >
                      {c === "USD" ? "$ دولار" : "ل.س ليرة"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {converted && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-emeraldBrand-200 bg-emeraldBrand-50/70 p-3.5 dark:border-emeraldBrand-500/30 dark:bg-emeraldBrand-500/10">
                <BadgeCheck size={18} className="text-emeraldBrand-600" />
                <p className="text-[12.5px] text-navy-700 dark:text-navy-100">
                  سيُعرض السعر تلقائياً بالعملتين:{" "}
                  <span className="font-extrabold">
                    {formatMoney(priceNumber, form.currency)}
                  </span>{" "}
                  <span className="text-navy-400">≈</span>{" "}
                  <span className="font-extrabold">
                    {converted.label === "$" ? `$ ${converted.other.toLocaleString("en-US")}` : `${converted.other.toLocaleString("en-US")} ل.س`}
                  </span>
                </p>
                <span className="badge ms-auto bg-white text-navy-600 dark:bg-navy-900 dark:text-navy-200">
                  سعر الصرف: 1 $ = {settings.usdToSyp.toLocaleString("en-US")} ل.س
                </span>
              </div>
            )}
          </Section>

          {/* ============================== 6) الصور ============================== */}
          <Section
            step="6"
            title="صور الإعلان"
            desc="اختياري — اختر صوراً من مكتبة بديل النموذجية (رفع الصور من جهازك متاح في النسخة الكاملة)"
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SAMPLE_IMAGES.map((src) => {
                const selected = form.images.includes(src);
                return (
                  <button
                    type="button"
                    key={src}
                    onClick={() =>
                      set(
                        "images",
                        selected ? form.images.filter((s) => s !== src) : [...form.images, src]
                      )
                    }
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition",
                      selected ? "border-amberBrand-500" : "border-transparent opacity-80 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center bg-navy-950/40">
                        <CheckCircle2 size={22} className="text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="hint inline-flex items-center gap-1.5">
                <ImageIcon size={13} /> {form.images.length} صورة مختارة
              </p>
              {form.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => set("images", [])}
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-navy-400 hover:text-rose-500"
                >
                  <X size={12} /> إزالة الكل
                </button>
              )}
            </div>
          </Section>

          {/* =========================== 7) بيانات التواصل =========================== */}
          <Section step="7" title="بيانات التواصل" desc="لن تُعرض بياناتك علناً إلا بعد نشر الإعلان">
            <div className="grid gap-4 sm:grid-cols-2">
              <div data-error={Boolean(errors.sellerName)}>
                <label className="label">الاسم أو اسم المكتب *</label>
                <div className="relative">
                  <User
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                  />
                  <input
                    value={form.sellerName}
                    onChange={(e) => set("sellerName", e.target.value)}
                    placeholder="أبو أحمد / المكتب العقاري النموذجي"
                    className="input pr-9"
                  />
                </div>
                {errors.sellerName && <p className="error-text">{errors.sellerName}</p>}
              </div>

              <div data-error={Boolean(errors.sellerPhone)}>
                <label className="label">رقم الهاتف *</label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                  />
                  <input
                    value={form.sellerPhone}
                    onChange={(e) => {
                      set("sellerPhone", e.target.value);
                      if (form.sameWhatsapp) set("sellerWhatsapp", e.target.value);
                    }}
                    placeholder="0955123456"
                    inputMode="tel"
                    className="input pl-16 pr-9"
                    dir="ltr"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-navy-400">
                    +963
                  </span>
                </div>
                {errors.sellerPhone && <p className="error-text">{errors.sellerPhone}</p>}
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.sameWhatsapp}
                onChange={(e) => {
                  set("sameWhatsapp", e.target.checked);
                  if (e.target.checked) set("sellerWhatsapp", form.sellerPhone);
                }}
                className="h-4 w-4 accent-emeraldBrand-500"
              />
              <span className="text-[13px] font-semibold text-navy-700 dark:text-navy-100">
                نفس الرقم متاح على واتساب
              </span>
            </label>

            {!form.sameWhatsapp && (
              <div className="mt-3" data-error={Boolean(errors.sellerWhatsapp)}>
                <label className="label">رقم الواتساب</label>
                <div className="relative">
                  <MessageCircle
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emeraldBrand-500"
                  />
                  <input
                    value={form.sellerWhatsapp}
                    onChange={(e) => set("sellerWhatsapp", e.target.value)}
                    placeholder="0955123456"
                    inputMode="tel"
                    className="input pl-16 pr-9"
                    dir="ltr"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-navy-400">
                    +963
                  </span>
                </div>
                {errors.sellerWhatsapp && <p className="error-text">{errors.sellerWhatsapp}</p>}
              </div>
            )}
          </Section>

          {/* زر الإرسال (للجوال) */}
          <div className="lg:hidden">
            <SubmitBar errors={Object.keys(errors).length} />
          </div>
        </div>

        {/* ============================ العمود الجانبي ============================ */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block">
            <SubmitBar errors={Object.keys(errors).length} />
          </div>

          <div className="card p-4">
            <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-navy-900 dark:text-white">
              <Info size={15} className="text-amberBrand-500" /> قبل أن تُرسل
            </h3>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
              <li className="flex gap-2">
                <span className="text-amberBrand-500">•</span> الإعلان يُنشر بعد موافقة الإدارة
                (الموافقة المسبقة) — لا يظهر للجمهور مباشرة.
              </li>
              <li className="flex gap-2">
                <span className="text-amberBrand-500">•</span> تأكد من صحة رقم الهاتف، فكل التواصل
                يحدث مباشرة بينك وبين المشتري.
              </li>
              <li className="flex gap-2">
                <span className="text-amberBrand-500">•</span> الإعلانات المكررة أو غير الواضحة قد
                تُرفض مع ذكر السبب.
              </li>
              <li className="flex gap-2">
                <span className="text-amberBrand-500">•</span> الإضافة مجانية تماماً ولا توجد أي
                عمولة على البيع.
              </li>
            </ul>
          </div>

          <div className="card overflow-hidden">
            <div className="bg-navy-900 p-4 text-white dark:bg-navy-800">
              <h3 className="flex items-center gap-2 text-[13px] font-extrabold">
                <Eye size={15} className="text-amberBrand-400" /> معاينة مباشرة (مصغّرة)
              </h3>
            </div>
            <div className="p-3">
              {form.title || form.price ? (
                <div className="pointer-events-none">
                  <AdCard ad={previewData} compact />
                </div>
              ) : (
                <p className="py-6 text-center text-[12px] text-navy-400">
                  ابدأ بتعبئة النموذج لعرض معاينة حيّة للإعلان هنا.
                </p>
              )}
              <button
                type="button"
                onClick={() => openPreview(false)}
                className="btn-ghost btn-sm mt-3 w-full justify-center"
              >
                <Eye size={14} /> فتح المعاينة الكاملة
              </button>
            </div>
          </div>
        </aside>
      </form>

      {/* ==================== شاشة المعاينة قبل الإرسال ==================== */}
      <AdPreviewModal
        ad={previewData}
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={submit}
        summaryCount={filledCount}
      />
    </div>
  );
}

/* ---------------------------- مكوّنات مساعدة ---------------------------- */

function Section({
  step,
  title,
  desc,
  children,
}: {
  step: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-[13px] font-extrabold text-amberBrand-400 dark:bg-white dark:text-navy-900">
          {step}
        </span>
        <div>
          <h2 className="text-[15px] font-extrabold text-navy-900 dark:text-white">{title}</h2>
          {desc && (
            <p className="mt-0.5 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
              {desc}
            </p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function SubmitBar({ errors }: { errors: number }) {
  return (
    <div className="card p-4">
      <button type="submit" className="btn-amber w-full justify-center py-3 text-[15px]">
        <Eye size={17} /> معاينة الإعلان قبل الإرسال
      </button>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-navy-400">
        لن تُرسل بياناتك الآن — ستظهر لك شاشة معاينة كاملة، ويتم الإرسال فقط بعد تأكيدك.
        {errors > 0 && (
          <span className="mt-1 block font-bold text-rose-500">
            يوجد {errors} حقل يحتاج إلى تصحيح قبل المعاينة
          </span>
        )}
      </p>
    </div>
  );
}

/** بناء نسخة معاينة من الإعلان قبل الإرسال */
function previewAd(
  f: FormState,
  { toUsd, toSyp }: { toUsd: (a: number, c: Currency) => number; toSyp: (a: number, c: Currency) => number }
): Ad {
  const price = Number(f.price) || 0;
  return {
    id: "preview",
    ref: "BD-معاينة",
    title: f.title || "عنوان الإعلان سيظهر هنا",
    description: f.description || "وصف الإعلان...",
    category: f.category,
    propertyType: f.propertyType || undefined,
    dealType: f.dealType || undefined,
    areaSize: f.areaSize ? Number(f.areaSize) : undefined,
    areaUnit: f.areaUnit,
    ownership: f.ownership || undefined,
    vehicleType: f.vehicleType || undefined,
    make: f.make || undefined,
    model: f.model || undefined,
    year: f.year ? Number(f.year) : undefined,
    bodyCondition: f.bodyCondition || undefined,
    fuelType: f.fuelType || undefined,
    plateRegion: f.plateRegion || undefined,
    price,
    currency: f.currency,
    priceUsd: f.currency === "USD" ? price : toUsd(price, "SYP"),
    priceSyp: f.currency === "SYP" ? price : toSyp(price, "USD"),
    negotiable: f.negotiable,
    cityId: f.cityId,
    districtId: f.districtId || "mnb-center",
    images: f.images,
    sellerName: f.sellerName || "اسم المُعلن",
    sellerPhone: f.sellerPhone || "0955123456",
    sellerWhatsapp: f.sameWhatsapp ? f.sellerPhone : f.sellerWhatsapp || "0955123456",
    status: "pending",
    featured: false,
    views: 0,
    createdAt: new Date().toISOString(),
    publishedAt: null,
    soldAt: null,
    rejectionReason: null,
    moderatedBy: null,
  };
}
