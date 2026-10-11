"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  BadgeCheck,
  Briefcase,
  Building,
  Building2,
  CalendarDays,
  Car,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Fuel,
  Home,
  Image as ImageIcon,
  Info,
  LandPlot,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Plug,
  Ruler,
  Send,
  Shirt,
  Sofa,
  Sparkles,
  Store,
  Timer,
  Trees,
  Truck,
  Bike,
  Tractor,
  User,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import AdCard from "@/components/AdCard";
import StatusBadge from "@/components/StatusBadge";
import AdPreviewModal from "@/components/AdPreviewModal";
import BrandSelector from "@/components/BrandSelector";
import { cn, formatMoney, nextRef, uid } from "@/lib/currency";
import {
  CONDITIONS,
  DEAL_TYPES,
  EMPLOYMENT_TYPES,
  FUEL_TYPES,
  JOB_KINDS,
  OWNERSHIP_TYPES,
  PLATE_REGIONS,
  PROPERTY_TYPES,
  SUBTYPES,
  VEHICLE_TYPES,
  BODY_CONDITIONS,
  DONUM_TYPES,
  RENTABLE,
  YEAR_REQUIRED,
  categoryName,
  dealTypesFor,
} from "@/lib/taxonomy";
import { ALL_BRANDS, VEHICLE_YEARS, brandName, modelName } from "@/lib/brands";
import {
  DISTRICT_KINDS,
  cleanDistrictName,
  districtId as makeDistrictId,
  guessDistrictKind,
} from "@/lib/geo";
import type {
  Ad,
  BodyCondition,
  Currency,
  DealType,
  DistrictKind,
  EmploymentType,
  FuelType,
  ItemCondition,
  ListingKind,
  MainCategory,
  OwnershipType,
  PlateRegion,
  PropertyType,
  VehicleType,
} from "@/lib/types";

/* أيقونات */
const CATEGORY_ICON: Record<MainCategory, React.ReactNode> = {
  "real-estate": <Building2 size={22} />,
  vehicles: <Car size={22} />,
  furniture: <Sofa size={22} />,
  appliances: <Plug size={22} />,
  clothing: <Shirt size={22} />,
  jobs: <Briefcase size={22} />,
};

const CATEGORY_TONE: Record<MainCategory, string> = {
  "real-estate": "from-emeraldBrand-500 to-emeraldBrand-700",
  vehicles: "from-amberBrand-500 to-amberBrand-700",
  furniture: "from-rose-500 to-rose-700",
  appliances: "from-sky-500 to-sky-700",
  clothing: "from-violet-500 to-violet-700",
  jobs: "from-navy-600 to-navy-900",
};

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
  /* عقارات */
  propertyType: PropertyType | "";
  dealType: DealType;
  areaSize: string;
  areaUnit: "m2" | "donum";
  ownership: OwnershipType | "";
  /* مركبات */
  vehicleType: VehicleType | "";
  brandId: string;
  modelId: string;
  customMake: string;
  customModel: string;
  year: string;
  bodyCondition: BodyCondition | "";
  fuelType: FuelType | "";
  plateRegion: PlateRegion | "";
  /* أثاث / أجهزة / ملابس */
  subtypeId: string;
  condition: ItemCondition | "";
  itemBrand: string; // ماركة الجهاز
  sizeText: string; // مقاس الملابس
  /* وظائف */
  jobKind: ListingKind;
  employmentType: EmploymentType | "";
  experienceYears: string;
  /* مشترك */
  title: string;
  description: string;
  price: string;
  currency: Currency;
  negotiable: boolean;
  cityId: string;
  districtName: string;
  districtKind: DistrictKind;
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
  brandId: "",
  modelId: "",
  customMake: "",
  customModel: "",
  year: "",
  bodyCondition: "",
  fuelType: "",
  plateRegion: "",
  subtypeId: "",
  condition: "",
  itemBrand: "",
  sizeText: "",
  jobKind: "offer",
  employmentType: "",
  experienceYears: "",
  title: "",
  description: "",
  price: "",
  currency: "USD",
  negotiable: true,
  cityId: "manbij",
  districtName: "",
  districtKind: "area",
  images: [],
  sellerName: "",
  sellerPhone: "",
  sellerWhatsapp: "",
  sameWhatsapp: true,
};

export default function PostAdPage() {
  const { cities, settings, addAd, ads, toUsd, toSyp, ensureDistrict, districtFacets } = useStore();
  const toast = useToast();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Ad | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewRef, setPreviewRef] = useState("BD-###");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const activeCities = cities.filter((c) => c.active);
  const knownDistricts = districtFacets("all").filter((f) => f.cityId === form.cityId);

  const priceNumber = Number(form.price) || 0;
  const converted = useMemo(() => {
    if (!priceNumber) return null;
    return form.currency === "USD"
      ? { other: toSyp(priceNumber, "USD"), label: "ل.س" }
      : { other: toUsd(priceNumber, "SYP"), label: "$" };
  }, [priceNumber, form.currency, toSyp, toUsd]);

  const cat = form.category;
  const isLand = cat === "real-estate" && DONUM_TYPES.includes(form.propertyType as PropertyType);
  const yearRequired = cat === "vehicles" && YEAR_REQUIRED.includes(form.vehicleType as VehicleType);
  const isJob = cat === "jobs";
  const isRentable = RENTABLE.includes(cat);
  const subtypeList = SUBTYPES[cat];

  /* ------------------------------- التحقق ------------------------------- */
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 10) e.title = "أدخل عنواناً واضحاً لا يقل عن 10 أحرف.";
    if (form.description.trim().length < 30)
      e.description = "اكتب وصفاً مفصّلاً لا يقل عن 30 حرفاً.";
    if (cleanDistrictName(form.districtName).length < 2)
      e.districtName = "اكتب اسم الحي أو القرية أو المنطقة (حرفان على الأقل).";
    if (!isJob && (!priceNumber || priceNumber <= 0)) e.price = "أدخل سعراً صحيحاً أكبر من صفر.";
    if (form.sellerName.trim().length < 3) e.sellerName = "أدخل اسمك أو اسم المكتب.";
    if (form.sellerPhone.replace(/\D/g, "").length < 8)
      e.sellerPhone = "أدخل رقم هاتف صحيح (مثال: 0955123456).";
    if (!form.sameWhatsapp && form.sellerWhatsapp.replace(/\D/g, "").length < 8)
      e.sellerWhatsapp = "أدخل رقم واتساب صحيح.";

    if (cat === "real-estate") {
      if (!form.propertyType) e.propertyType = "اختر نوع العقار.";
      if (!form.areaSize || Number(form.areaSize) <= 0) e.areaSize = "أدخل مساحة صحيحة.";
      if (!form.ownership) e.ownership = "حدّد وضع أوراق الملكية.";
    } else if (cat === "vehicles") {
      if (!form.vehicleType) e.vehicleType = "اختر نوع المركبة.";
      if (!form.brandId) e.brandId = "اختر الماركة من الأيقونات.";
      if (form.brandId === "other") {
        if (!form.customMake.trim()) e.brandId = "اكتب اسم الماركة.";
        if (!form.customModel.trim()) e.modelId = "اكتب الموديل.";
      } else if (!form.modelId) e.modelId = "اختر الموديل.";
      if (yearRequired && (!form.year || Number(form.year) < 1950 || Number(form.year) > 2026))
        e.year = "أدخل سنة صنع صحيحة (1950 - 2026).";
      if (!form.bodyCondition) e.bodyCondition = "حدّد حالة الجسم.";
      if (!form.fuelType) e.fuelType = "حدّد نوع الوقود.";
      if (!form.plateRegion) e.plateRegion = "حدّد نمرة التسجيل.";
    } else if (cat === "furniture" || cat === "appliances" || cat === "clothing") {
      if (!form.subtypeId) e.subtypeId = "اختر النوع.";
      if (!form.condition) e.condition = "حدّد الحالة.";
    } else if (cat === "jobs") {
      if (!form.subtypeId) e.subtypeId = "اختر مجال العمل.";
      if (!form.employmentType) e.employmentType = "حدّد نوع الدوام.";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast({
        type: "error",
        title: "يرجى إكمال الحقول المطلوبة",
        desc: `يوجد ${Object.keys(e).length} حقل بحاجة إلى تصحيح.`,
      });
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  /* ------------------------------ البناء/الإرسال ------------------------------ */
  function buildAd(): Ad {
    const price = Number(form.price) || 0;
    const subtypeLabel = subtypeList.find((s) => s.id === form.subtypeId)?.name;
    const isOtherBrand = form.brandId === "other";
    const make = isOtherBrand ? form.customMake.trim() : brandName(form.brandId);
    const model = isOtherBrand ? form.customModel.trim() : modelName(form.brandId, form.modelId);

    return {
      id: uid("ad"),
      ref: previewRef !== "BD-###" ? previewRef : nextRef(ads),
      title: form.title.trim(),
      description: form.description.trim(),
      category: cat,

      subtypeId: form.subtypeId || undefined,
      subtypeLabel,
      jobKind: isJob ? form.jobKind : undefined,
      employmentType: isJob ? ((form.employmentType as EmploymentType) || undefined) : undefined,
      experienceYears: isJob && form.experienceYears ? Number(form.experienceYears) : undefined,
      condition: form.condition ? (form.condition as ItemCondition) : undefined,

      propertyType: cat === "real-estate" ? (form.propertyType as PropertyType) : undefined,
      dealType: isRentable ? form.dealType : "sale",
      areaSize: cat === "real-estate" ? Number(form.areaSize) : undefined,
      areaUnit: cat === "real-estate" ? form.areaUnit : undefined,
      ownership: cat === "real-estate" ? (form.ownership as OwnershipType) : undefined,

      vehicleType: cat === "vehicles" ? (form.vehicleType as VehicleType) : undefined,
      brandId: cat === "vehicles" ? form.brandId : undefined,
      modelId: cat === "vehicles" && !isOtherBrand ? form.modelId : undefined,
      make: cat === "vehicles" ? make : cat === "appliances" ? form.itemBrand.trim() || undefined : undefined,
      model:
        cat === "vehicles" ? model : cat === "clothing" ? form.sizeText.trim() || undefined : undefined,
      year: cat === "vehicles" && form.year ? Number(form.year) : undefined,
      bodyCondition: cat === "vehicles" ? (form.bodyCondition as BodyCondition) : undefined,
      fuelType: cat === "vehicles" ? (form.fuelType as FuelType) : undefined,
      plateRegion: cat === "vehicles" ? (form.plateRegion as PlateRegion) : undefined,

      price,
      currency: form.currency,
      priceUsd: form.currency === "USD" ? price : toUsd(price, "SYP"),
      priceSyp: form.currency === "SYP" ? price : toSyp(price, "USD"),
      priceOnRequest: isJob && !price,
      negotiable: isJob ? form.negotiable : form.negotiable,

      cityId: form.cityId,
      districtId: makeDistrictId(form.cityId, cleanDistrictName(form.districtName)),
      districtLabel: cleanDistrictName(form.districtName),
      districtKind: form.districtKind,

      images: form.images,
      sellerName: form.sellerName.trim(),
      sellerPhone: form.sellerPhone.trim(),
      sellerWhatsapp: (form.sameWhatsapp ? form.sellerPhone : form.sellerWhatsapp).trim(),

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

  function openPreview(validateFirst = true) {
    if (validateFirst && !validate()) return;
    setPreviewRef(nextRef(ads));
    setShowPreview(true);
  }

  function submit() {
    setShowPreview(false);
    if (!validate()) return;
    const ad = { ...buildAd(), ref: previewRef !== "BD-###" ? previewRef : nextRef(ads) };
    ensureDistrict(form.cityId, form.districtName, form.districtKind);
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
            إعلانك الآن <span className="font-bold text-amberBrand-600">قيد المراجعة</span> ولن يظهر
            للعموم حتى الموافقة عليه. عادةً تستغرق المراجعة أقل من 12 ساعة.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <StatusBadge status="pending" />
            <span className="badge bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
              رقم الإعلان: {done.ref}
            </span>
            <span className="badge bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
              {categoryName(done.category)}
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
              لوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- النموذج -------------------------------- */
  const filledCount = [
    form.title,
    form.description,
    form.price,
    form.districtName,
    form.sellerName,
    form.sellerPhone,
    form.images.length ? "x" : "",
    cat === "real-estate" ? form.propertyType : cat === "vehicles" ? form.vehicleType : form.subtypeId,
  ].filter(Boolean).length;

  const previewData: Ad = { ...buildAd(), ref: previewRef };

  return (
    <div className="container-page py-6">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy-900 dark:text-white sm:text-2xl">
          أضف إعلانك مجاناً
        </h1>
        <p className="mt-1 text-[12.5px] text-navy-500 dark:text-navy-300">
          ستّة تصنيفات: عقارات · سيارات ومركبات · أثاث منزلي · أدوات كهربائية · ملابس · وظائف.
        </p>
        <p className="mt-3 inline-flex items-start gap-2 rounded-xl border border-amberBrand-200 bg-amberBrand-50/70 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-navy-700 dark:border-amberBrand-500/30 dark:bg-amberBrand-500/10 dark:text-navy-100">
          <Eye size={15} className="mt-0.5 shrink-0 text-amberBrand-600" />
          خطوة المعاينة إلزامية: ستظهر لك شاشة معاينة كاملة قبل إرسال أي بيانات للمراجعة.
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
          <Section step="1" title="نوع الإعلان" desc="اختر التصنيف، ثم ستظهر الحقول المناسبة له تلقائياً">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  "real-estate",
                  "vehicles",
                  "furniture",
                  "appliances",
                  "clothing",
                  "jobs",
                ] as MainCategory[]
              ).map((c) => {
                const meta = { name: categoryName(c) };
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => {
                      set("category", c);
                      set("propertyType", "");
                      set("vehicleType", "");
                      set("subtypeId", "");
                      set("dealType", c === "vehicles" ? "sale" : "sale");
                      if (c === "jobs") set("negotiable", true);
                    }}
                    className={cn(
                      "option-card items-center gap-3 p-3.5",
                      cat === c && "option-card-active"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                        CATEGORY_TONE[c]
                      )}
                    >
                      {CATEGORY_ICON[c]}
                    </span>
                    <span className="text-right">
                      <span className="block text-[13.5px] font-extrabold text-navy-900 dark:text-white">
                        {meta.name}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ====================== 2) التفاصيل حسب التصنيف ====================== */}
          {cat === "real-estate" && (
            <Section step="2" title="تفاصيل العقار" desc="نوع العقار، نوع التعامل (بيع أو إيجار)، المساحة والأوراق">
              <div data-error={Boolean(errors.propertyType)}>
                <label className="label">نوع العقار *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROPERTY_TYPES.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        set("propertyType", p.id);
                        if (DONUM_TYPES.includes(p.id)) set("areaUnit", "donum");
                        else set("areaUnit", "m2");
                      }}
                      className={cn(
                        "option-card flex-col items-center gap-2 py-3 text-center",
                        form.propertyType === p.id && "option-card-active"
                      )}
                    >
                      <span className="text-navy-500 dark:text-navy-200">{PROPERTY_ICONS[p.id]}</span>
                      <span className="text-[12.5px] font-bold text-navy-800 dark:text-navy-100">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.propertyType && <p className="error-text">{errors.propertyType}</p>}
              </div>

              <div className="mt-5">
                <label className="label">نوع التعامل * — بيع أو إيجار</label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {dealTypesFor("real-estate").map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => set("dealType", d.id)}
                      className={cn("option-card flex-col items-start py-3", form.dealType === d.id && "option-card-active")}
                    >
                      <span className="text-[13px] font-bold text-navy-800 dark:text-navy-100">{d.name}</span>
                      <span className="text-[11px] text-navy-400">{d.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div data-error={Boolean(errors.areaSize)}>
                  <label className="label">المساحة *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ruler size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
                      <input
                        type="number"
                        inputMode="decimal"
                        value={form.areaSize}
                        onChange={(e) => set("areaSize", e.target.value)}
                        placeholder={isLand ? "مثال: 12" : "مثال: 145"}
                        className="input pr-9"
                      />
                    </div>
                    <select
                      value={form.areaUnit}
                      onChange={(e) => set("areaUnit", e.target.value as "m2" | "donum")}
                      className="select w-36"
                    >
                      {(
                        [
                          { id: "m2" as const, name: "متر مربع (م²)" },
                          { id: "donum" as const, name: "دونم" },
                        ]
                      )
                        .filter((u) => (isLand ? true : u.id === "m2"))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </div>
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
                      className={cn("option-card items-center py-3", form.ownership === o.id && "option-card-active")}
                    >
                      <BadgeCheck size={17} className="text-emeraldBrand-500" />
                      <span>
                        <span className="block text-[13px] font-bold text-navy-800 dark:text-navy-100">
                          {o.name}
                        </span>
                        {o.hint && <span className="block text-[11px] text-navy-400">{o.hint}</span>}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.ownership && <p className="error-text">{errors.ownership}</p>}
              </div>
            </Section>
          )}

          {cat === "vehicles" && (
            <Section step="2" title="تفاصيل المركبة" desc="النوع، الماركة والموديل، سنة الصنع، الحالة والنمرة">
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

              {/* الماركة والموديل بالأيقونات */}
              <div className="mt-5">
                <BrandSelector
                  brandId={form.brandId}
                  modelId={form.modelId}
                  customMake={form.customMake}
                  customModel={form.customModel}
                  error={errors.brandId || errors.modelId}
                  onChange={(patch) => {
                    if (patch.brandId !== undefined) set("brandId", patch.brandId);
                    if (patch.modelId !== undefined) set("modelId", patch.modelId);
                    if (patch.customMake !== undefined) set("customMake", patch.customMake);
                    if (patch.customModel !== undefined) set("customModel", patch.customModel);
                  }}
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div data-error={Boolean(errors.year)}>
                  <label className="label">سنة الصنع {yearRequired ? "*" : "(اختياري)"}</label>
                  <div className="relative">
                    <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <select
                      value={form.year}
                      onChange={(e) => set("year", e.target.value)}
                      className="select pr-9"
                    >
                      <option value="">— اختر السنة —</option>
                      {VEHICLE_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.year && <p className="error-text">{errors.year}</p>}
                </div>
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
                  <div className="relative">
                    <Fuel size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <select
                      value={form.fuelType}
                      onChange={(e) => set("fuelType", e.target.value as FuelType)}
                      className="select pr-9"
                    >
                      <option value="">— اختر —</option>
                      {FUEL_TYPES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.fuelType && <p className="error-text">{errors.fuelType}</p>}
                </div>
              </div>

              {/* نوع التعامل للمركبات: بيع أو إيجار */}
              <div className="mt-5">
                <label className="label">بيع أم إيجار؟ *</label>
                <div className="grid gap-2 sm:grid-cols-4">
                  {dealTypesFor("vehicles").map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => set("dealType", d.id)}
                      className={cn("option-card flex-col items-start py-3", form.dealType === d.id && "option-card-active")}
                    >
                      <span className="text-[12.5px] font-bold text-navy-800 dark:text-navy-100">{d.name}</span>
                      <span className="text-[10.5px] text-navy-400">{d.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* نمر السيارات المحدّثة */}
              <div className="mt-5" data-error={Boolean(errors.plateRegion)}>
                <label className="label">نمرة التسجيل *</label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PLATE_REGIONS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => set("plateRegion", p.id)}
                      className={cn(
                        "option-card items-center justify-between py-3",
                        form.plateRegion === p.id && "option-card-active"
                      )}
                    >
                      <span className="text-[13px] font-bold text-navy-800 dark:text-navy-100">
                        {p.name}
                      </span>
                      {form.plateRegion === p.id && (
                        <CheckCircle2 size={16} className="text-amberBrand-500" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="hint">اختر نوع النمرة كما هي مكتوبة على المركبة حالياً.</p>
                {errors.plateRegion && <p className="error-text">{errors.plateRegion}</p>}
              </div>
            </Section>
          )}

          {(cat === "furniture" || cat === "appliances" || cat === "clothing") && (
            <Section
              step="2"
              title={cat === "furniture" ? "تفاصيل الأثاث" : cat === "appliances" ? "تفاصيل الجهاز" : "تفاصيل الملابس"}
              desc="النوع والحالة — إضافة الماركة أو المقاس عند الحاجة"
            >
              <div data-error={Boolean(errors.subtypeId)}>
                <label className="label">
                  {cat === "furniture" ? "نوع الأثاث *" : cat === "appliances" ? "نوع الجهاز *" : "نوع الملابس *"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {subtypeList.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => set("subtypeId", s.id)}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2 text-[12.5px] font-bold transition",
                        form.subtypeId === s.id
                          ? "border-amberBrand-500 bg-amberBrand-50 text-amberBrand-700 dark:border-amberBrand-500 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
                          : "border-navy-100 text-navy-600 hover:border-amberBrand-300 dark:border-navy-800 dark:text-navy-200"
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                {errors.subtypeId && <p className="error-text">{errors.subtypeId}</p>}
              </div>

              <div className="mt-5" data-error={Boolean(errors.condition)}>
                <label className="label">الحالة *</label>
                <div className="grid gap-2 sm:grid-cols-4">
                  {CONDITIONS.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => set("condition", c.id)}
                      className={cn(
                        "option-card items-center justify-center py-2.5",
                        form.condition === c.id && "option-card-active"
                      )}
                    >
                      <span className="text-[12px] font-bold text-navy-800 dark:text-navy-100">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.condition && <p className="error-text">{errors.condition}</p>}
              </div>

              {cat === "appliances" && (
                <div className="mt-5">
                  <label className="label">ماركة الجهاز (اختياري)</label>
                  <input
                    value={form.itemBrand}
                    onChange={(e) => set("itemBrand", e.target.value)}
                    placeholder="سامسونغ، LG، بوش، توشيبا..."
                    className="input"
                  />
                </div>
              )}

              {cat === "clothing" && (
                <div className="mt-5">
                  <label className="label">المقاس (اختياري)</label>
                  <input
                    value={form.sizeText}
                    onChange={(e) => set("sizeText", e.target.value)}
                    placeholder="S / M / L / XL أو 38 / 40 ..."
                    className="input"
                  />
                </div>
              )}
            </Section>
          )}

          {cat === "jobs" && (
            <Section step="2" title="تفاصيل الوظيفة" desc="عرض وظيفة (تبحث عن موظف) أو طلب عمل (تبحث عن عمل)">
              <div>
                <label className="label">نوع الإعلان *</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {JOB_KINDS.map((k) => (
                    <button
                      type="button"
                      key={k.id}
                      onClick={() => set("jobKind", k.id)}
                      className={cn("option-card flex-col items-start py-3.5", form.jobKind === k.id && "option-card-active")}
                    >
                      <span className="text-[13.5px] font-extrabold text-navy-800 dark:text-navy-100">
                        {k.name}
                      </span>
                      <span className="text-[11.5px] text-navy-400">{k.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5" data-error={Boolean(errors.subtypeId)}>
                <label className="label">مجال العمل *</label>
                <div className="flex flex-wrap gap-1.5">
                  {subtypeList.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => set("subtypeId", s.id)}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2 text-[12.5px] font-bold transition",
                        form.subtypeId === s.id
                          ? "border-amberBrand-500 bg-amberBrand-50 text-amberBrand-700 dark:border-amberBrand-500 dark:bg-amberBrand-500/10 dark:text-amberBrand-400"
                          : "border-navy-100 text-navy-600 hover:border-amberBrand-300 dark:border-navy-800 dark:text-navy-200"
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                {errors.subtypeId && <p className="error-text">{errors.subtypeId}</p>}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div data-error={Boolean(errors.employmentType)}>
                  <label className="label">نوع الدوام *</label>
                  <div className="relative">
                    <Timer size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <select
                      value={form.employmentType}
                      onChange={(e) => set("employmentType", e.target.value as EmploymentType)}
                      className="select pr-9"
                    >
                      <option value="">— اختر —</option>
                      {EMPLOYMENT_TYPES.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.employmentType && <p className="error-text">{errors.employmentType}</p>}
                </div>
                <div>
                  <label className="label">سنوات الخبرة المطلوبة (اختياري)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form.experienceYears}
                    onChange={(e) => set("experienceYears", e.target.value)}
                    placeholder="مثال: 2"
                    className="input"
                  />
                </div>
              </div>
            </Section>
          )}

          {/* ========================== 3) الموقع الجغرافي ========================== */}
          <Section
            step="3"
            title="الموقع الجغرافي"
            desc="إدخال يدوي: اكتب اسم الحي أو القرية أو المنطقة كما يعرفها أهلها"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">المدينة</label>
                <select
                  value={form.cityId}
                  onChange={(e) => {
                    set("cityId", e.target.value);
                    set("districtName", "");
                  }}
                  className="select"
                >
                  {activeCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.governorate}
                    </option>
                  ))}
                </select>
              </div>

              <div data-error={Boolean(errors.districtName)}>
                <label className="label">الحي / القرية / المنطقة *</label>
                <div className="relative">
                  <MapPin size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emeraldBrand-500" />
                  <input
                    value={form.districtName}
                    onChange={(e) => {
                      set("districtName", e.target.value);
                      if (e.target.value.trim().length >= 2)
                        set("districtKind", guessDistrictKind(e.target.value));
                    }}
                    list="known-districts"
                    placeholder="اكتبها بنفسك: حارة النعيم، قرية الجراحي، طريق حلب..."
                    className="input pr-9"
                    autoComplete="off"
                  />
                  <datalist id="known-districts">
                    {knownDistricts.map((d) => (
                      <option key={d.id} value={d.name} />
                    ))}
                  </datalist>
                </div>
                {errors.districtName && <p className="error-text">{errors.districtName}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="label">نوع المنطقة</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {DISTRICT_KINDS.map((k) => (
                  <button
                    type="button"
                    key={k.id}
                    onClick={() => set("districtKind", k.id)}
                    className={cn("option-card justify-center py-2.5", form.districtKind === k.id && "option-card-active")}
                  >
                    <span className="text-[12.5px] font-bold text-navy-800 dark:text-navy-100">{k.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {knownDistricts.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold text-navy-400">
                  <Layers size={12} className="text-amberBrand-500" /> مناطق مُستخدمة حالياً — اضغط لاختيارها
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {knownDistricts.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => {
                        set("districtName", d.name);
                        set("districtKind", d.kind);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold transition",
                        cleanDistrictName(form.districtName) === d.name
                          ? "bg-emeraldBrand-500 text-white"
                          : "border border-navy-200 text-navy-600 hover:border-emeraldBrand-400 dark:border-navy-700 dark:text-navy-200"
                      )}
                    >
                      {d.name}
                      <span className="opacity-70">({d.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ============================== 4) المحتوى ============================== */}
          <Section step="4" title="عنوان الإعلان والوصف" desc="عنوان واضح ووصف دقيق يزيدان فرص البيع أو التوظيف">
            <div data-error={Boolean(errors.title)}>
              <label className="label">عنوان الإعلان *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={90}
                placeholder={
                  cat === "real-estate"
                    ? "شقة سكنية 145 م² للبيع في حي الكواكبي — طابو أخضر"
                    : cat === "vehicles"
                      ? "كيا سيراتو 2016 — خالية العلام أورجينال، مجمرك"
                      : cat === "furniture"
                        ? "غرفة نوم خشب زان كاملة بحالة ممتازة"
                        : cat === "appliances"
                          ? "ثلاجة سامسونغ 18 قدم — نوفروست"
                          : cat === "clothing"
                            ? "طقم رجالي رسمي جديد مقاس L"
                            : "مطلوب معلم رياضيات للمرحلة الإعدادية — دوام كامل"
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
                  cat === "jobs"
                    ? "اذكر: المهام، ساعات الدوام، مكان العمل، الخبرة المطلوبة، والأجر إن أمكن..."
                    : "اذكر التفاصيل المهمة: الحالة، الأوراق، سبب البيع، وأي معلومة تساعد المشتري..."
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
            title={isJob ? "الأجر (اختياري)" : "السعر والعملة"}
            desc="يُحوَّل السعر تلقائياً ويُعرض بالعملتين معاً"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div data-error={Boolean(errors.price)}>
                <label className="label">
                  {isJob ? "الأجر الشهري/اليومي (اتركه فارغاً إذا كان بالاتفاق)" : "السعر *"}{" "}
                  {form.dealType === "rent-daily"
                    ? "(عن اليوم)"
                    : form.dealType === "rent-monthly"
                      ? "(عن الشهر)"
                      : form.dealType === "rent-yearly"
                        ? "(عن السنة)"
                        : ""}
                </label>
                <div className="relative">
                  <CircleDollarSign size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
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
                  سيُعرض السعر بالعملتين:{" "}
                  <span className="font-extrabold">{formatMoney(priceNumber, form.currency)}</span>{" "}
                  <span className="text-navy-400">≈</span>{" "}
                  <span className="font-extrabold">
                    {converted.label === "$"
                      ? `$ ${converted.other.toLocaleString("en-US")}`
                      : `${converted.other.toLocaleString("en-US")} ل.س`}
                  </span>
                </p>
                <span className="badge ms-auto bg-white text-navy-600 dark:bg-navy-900 dark:text-navy-200">
                  سعر الصرف: 1 $ = {settings.usdToSyp.toLocaleString("en-US")} ل.س
                </span>
              </div>
            )}

            {isJob && (
              <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-navy-200 px-3.5 py-2.5 dark:border-navy-700">
                <span className="text-[13px] font-semibold text-navy-700 dark:text-navy-100">
                  الأجر قابل للتفاوض
                </span>
                <input
                  type="checkbox"
                  checked={form.negotiable}
                  onChange={(e) => set("negotiable", e.target.checked)}
                  className="h-4 w-4 accent-emeraldBrand-500"
                />
              </label>
            )}
          </Section>

          {/* ============================== 6) الصور ============================== */}
          <Section
            step="6"
            title="صور الإعلان"
            desc="اختياري — اختر صوراً من مكتبة بديل النموذجية (رفع الصور من الجهاز متاح في النسخة الكاملة)"
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SAMPLE_IMAGES.map((src) => {
                const selected = form.images.includes(src);
                return (
                  <button
                    type="button"
                    key={src}
                    onClick={() =>
                      set("images", selected ? form.images.filter((s) => s !== src) : [...form.images, src])
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
                  <User size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
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
                  <Phone size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
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
                  <MessageCircle size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emeraldBrand-500" />
                  <input
                    value={form.sellerWhatsapp}
                    onChange={(e) => set("sellerWhatsapp", e.target.value)}
                    placeholder="0955123456"
                    inputMode="tel"
                    className="input pl-16 pr-9"
                    dir="ltr"
                  />
                </div>
                {errors.sellerWhatsapp && <p className="error-text">{errors.sellerWhatsapp}</p>}
              </div>
            )}
          </Section>

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
              <li>• الإعلان يُنشر بعد موافقة الإدارة (الموافقة المسبقة).</li>
              <li>• العقارات والمركبات تقبل «بيع» أو «إيجار» — اختر البند الصحيح.</li>
              <li>• للمركبات: اختر الماركة بالأيقونة ثم الموديل، وحدّد سنة الصنع بدقة.</li>
              <li>• الوظائف: اختر «عرض وظيفة» إن كنت تبحث عن موظف، و«طلب عمل» إن كنت تبحث عن عمل.</li>
              <li>• لا تذكر أي بيانات مصرفية في الوصف.</li>
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
            <p className="mt-0.5 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">{desc}</p>
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
        لن تُرسل بياناتك الآن — ستظهر شاشة معاينة كاملة، والإرسال يتم بعد تأكيدك.
        {errors > 0 && (
          <span className="mt-1 block font-bold text-rose-500">
            يوجد {errors} حقل يحتاج إلى تصحيح قبل المعاينة
          </span>
        )}
      </p>
    </div>
  );
}

