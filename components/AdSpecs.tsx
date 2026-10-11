"use client";

import React from "react";
import {
  BadgeCheck,
  Banknote,
  Briefcase,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Fuel,
  Layers,
  MapPin,
  Package,
  Palette,
  Ruler,
  Shirt,
  Smartphone,
  Sofa,
  Tag,
  Timer,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import type { Ad } from "@/lib/types";
import {
  bodyConditionName,
  conditionName,
  dealTypeName,
  employmentName,
  fuelTypeName,
  jobKindName,
  ownershipName,
  plateRegionName,
  propertyTypeName,
  subtypeName,
  vehicleTypeName,
} from "@/lib/taxonomy";
import { brandName, modelName } from "@/lib/brands";

/* ==========================================================================
   مواصفات الإعلان — مصدر واحد يخدم: صفحة الإعلان + المعاينة + لوحة التحكم
   ========================================================================== */

export interface Spec {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const YES_NO = (v: boolean) => (v ? "السعر قابل للتفاوض" : "السعر نهائي");

/** مواصفات تفصيلية (شبكة 2-3 أعمدة) */
export function adSpecs(ad: Ad): Spec[] {
  const S = (label: string, value: string, icon: React.ReactNode): Spec => ({ label, value, icon });

  switch (ad.category) {
    case "real-estate":
      return [
        S("نوع العقار", propertyTypeName(ad.propertyType), <Building2 size={14} />),
        S("نوع التعامل", dealTypeName(ad.dealType) || "بيع", <CalendarDays size={14} />),
        S(
          "المساحة",
          `${ad.areaSize ?? "—"} ${ad.areaUnit === "donum" ? "دونم" : "متر مربع"}`,
          <Ruler size={14} />
        ),
        S("أوراق الملكية", ownershipName(ad.ownership), <BadgeCheck size={14} />),
        S("التفاوض", YES_NO(ad.negotiable), <Tag size={14} />),
      ];

    case "vehicles": {
      const model = ad.model || modelName(ad.brandId, ad.modelId);
      return [
        S("نوع المركبة", vehicleTypeName(ad.vehicleType), <Truck size={14} />),
        S(
          "الماركة والموديل",
          `${ad.make || brandName(ad.brandId) || "—"} ${model ? `— ${model}` : ""}`.trim(),
          <Car size={14} />
        ),
        S("سنة الصنع", String(ad.year ?? "—"), <CalendarDays size={14} />),
        S("نوع التعامل", dealTypeName(ad.dealType) || "بيع", <Banknote size={14} />),
        S("حالة الجسم", bodyConditionName(ad.bodyCondition), <CheckCircle2 size={14} />),
        S("نوع الوقود", fuelTypeName(ad.fuelType), <Fuel size={14} />),
        S("نمرة التسجيل", plateRegionName(ad.plateRegion), <BadgeCheck size={14} />),
        S("التفاوض", YES_NO(ad.negotiable), <Tag size={14} />),
      ];
    }

    case "furniture":
      return [
        S("نوع الأثاث", ad.subtypeLabel || subtypeName("furniture", ad.subtypeId), <Sofa size={14} />),
        S("الحالة", conditionName(ad.condition), <CheckCircle2 size={14} />),
        S("التفاوض", YES_NO(ad.negotiable), <Tag size={14} />),
      ];

    case "appliances":
      return [
        S(
          "نوع الجهاز",
          ad.subtypeLabel || subtypeName("appliances", ad.subtypeId),
          <Zap size={14} />
        ),
        S("الحالة", conditionName(ad.condition), <CheckCircle2 size={14} />),
        S("الماركة", ad.make || "غير محددة", <Package size={14} />),
        S("التفاوض", YES_NO(ad.negotiable), <Tag size={14} />),
      ];

    case "clothing":
      return [
        S(
          "نوع الملابس",
          ad.subtypeLabel || subtypeName("clothing", ad.subtypeId),
          <Shirt size={14} />
        ),
        S("الحالة", conditionName(ad.condition), <CheckCircle2 size={14} />),
        S("المقاس", ad.model || "غير محدد", <Palette size={14} />),
        S("التفاوض", YES_NO(ad.negotiable), <Tag size={14} />),
      ];

    case "phones": {
      const brand = ad.make || brandName(ad.brandId);
      const model = ad.model || modelName(ad.brandId, ad.modelId);
      return [
        S("النوع", brand ? `${brand}${model ? ` — ${model}` : ""}` : "هاتف", <Smartphone size={14} />),
        S("الحالة", conditionName(ad.condition), <CheckCircle2 size={14} />),
        S("سعة التخزين", ad.storage || "غير محددة", <Package size={14} />),
        S("التفاوض", YES_NO(ad.negotiable), <Tag size={14} />),
      ];
    }

    case "jobs":
      return [
        S("نوع الإعلان", jobKindName(ad.jobKind), <Briefcase size={14} />),
        S(
          "مجال العمل",
          ad.subtypeLabel || subtypeName("jobs", ad.subtypeId),
          <Layers size={14} />
        ),
        S("نوع الدوام", employmentName(ad.employmentType), <Timer size={14} />),
        S(
          "سنوات الخبرة",
          ad.experienceYears != null ? `${ad.experienceYears} سنة` : "غير محددة",
          <BadgeCheck size={14} />
        ),
        S("الأجر", ad.priceOnRequest || !ad.price ? "يُتفق عليه" : "مذكور بالتفاوض", <Banknote size={14} />),
      ];

    default:
      return [];
  }
}

/** شرائح مختصرة لبطاقة الإعلان */
export function adChips(ad: Ad): Spec[] {
  const specs = adSpecs(ad);
  return ad.category === "phones" ? specs.slice(0, 3) : specs.slice(0, 3);
}

/** هل الإعلان معروض للبيع أم للإيجار؟ */
export function dealBadge(ad: Ad): { label: string; className: string } | null {
  if (!ad.dealType) return null;
  if (ad.dealType === "sale") return { label: "للبيع", className: "bg-emeraldBrand-500 text-white" };
  const map: Record<string, string> = {
    "rent-daily": "للإيجار اليومي",
    "rent-monthly": "للإيجار الشهري",
    "rent-yearly": "للإيجار السنوي",
  };
  return { label: map[ad.dealType] ?? "للإيجار", className: "bg-navy-800 text-white" };
}

/** عنوان الموقع المختصر — المدينة فقط (أُلغيت الأحياء) */
export function LocationLine({ city }: { city?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <MapPin size={13} className="text-amberBrand-500" /> {city ?? "منبج"}
    </span>
  );
}

export { Warehouse };
