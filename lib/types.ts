/* ==========================================================================
   بديل | Badeel — أنواع البيانات الأساسية
   ========================================================================== */

export type Currency = "USD" | "SYP";

export type AdStatus =
  | "pending" // قيد المراجعة — لا يظهر للجمهور
  | "active" // منشور
  | "rejected" // مرفوض
  | "sold" // تم البيع
  | "rented"; // تم التأجير

export type MainCategory = "real-estate" | "vehicles";

/* ------------------------------- العقارات ------------------------------- */
export type PropertyType =
  | "apartment" // شقة سكنية
  | "house" // منزل عربي
  | "land-building" // أرض بناء
  | "land-agricultural" // أرض زراعية
  | "shop" // محل تجاري
  | "warehouse"; // مستودع

export type DealType = "sale" | "rent-monthly" | "rent-yearly";

export type AreaUnit = "m2" | "donum";

export type OwnershipType =
  | "tabu-green" // طابو أخضر
  | "court-ruling" // حكم محكمة
  | "real-estate-agency" // وكالة عقارية
  | "arqari-siyaq"; // عرقاري - سياق

/* ------------------------------- المركبات ------------------------------- */
export type VehicleType =
  | "passenger" // سيارة سياحية
  | "truck" // شاحنة / بيك أب
  | "motorcycle" // دراجة نارية
  | "machinery"; // آليات ثقيلة / جرار زراعي

export type BodyCondition =
  | "original" // خالية العلام أورجينال
  | "partial-damage" // قص وبخ جزئي
  | "needs-service"; // تحتاج صيانة

export type FuelType = "petrol" | "diesel" | "electric";

export type PlateRegion =
  | "manbij" // نمرة منبج
  | "aleppo" // نمرة حلب
  | "idlib" // نمرة إدلب
  | "unregistered-european"; // غير مجمرك - أوروبي

/* ------------------------------- التصنيفات ------------------------------- */
export interface Ad {
  id: string;
  ref: string; // رقم مرجعي قصير يظهر للمستخدم (مثال: BD-1042)
  title: string;
  description: string;
  category: MainCategory;

  /* عقارات */
  propertyType?: PropertyType;
  dealType?: DealType;
  areaSize?: number;
  areaUnit?: AreaUnit;
  ownership?: OwnershipType;

  /* مركبات */
  vehicleType?: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  bodyCondition?: BodyCondition;
  fuelType?: FuelType;
  plateRegion?: PlateRegion;

  /* السعر — يُخزَّن دائماً بالعملتين */
  price: number; // القيمة كما أدخلها المستخدم
  currency: Currency; // عملة الإدخال
  priceUsd: number; // سعر محوَّل للدولار
  priceSyp: number; // سعر محوَّل لليرة
  negotiable: boolean;

  /* الموقع */
  cityId: string;
  districtId: string;

  /* إعلام */
  images: string[]; // مسارات محلية (/images/..) أو روابط
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;

  /* دورة حياة الإعلان */
  status: AdStatus;
  featured: boolean;
  views: number;
  createdAt: string;
  publishedAt?: string | null;
  soldAt?: string | null;
  rejectionReason?: string | null;
  moderatedBy?: string | null;
}

/* -------------------------------- الجغرافيا -------------------------------- */
export interface District {
  id: string;
  name: string;
  kind: "neighborhood" | "village"; // حي أو قرية / ريف
}

export interface City {
  id: string;
  name: string; // منبج
  governorate: string; // حلب
  active: boolean;
  districts: District[];
}

/* -------------------------------- الإعدادات -------------------------------- */
export interface Settings {
  usdToSyp: number; // سعر صرف الدولار مقابل الليرة السورية
  whatsappCountryCode: string; // 963
  siteSlogan: string;
  contactPhone: string;
}

/* -------------------------------- الأحداث -------------------------------- */
export type ModerationAction =
  | { type: "APPROVE"; id: string }
  | { type: "REJECT"; id: string; reason: string }
  | { type: "MARK_SOLD"; id: string }
  | { type: "MARK_RENTED"; id: string }
  | { type: "REOPEN"; id: string }
  | { type: "TOGGLE_FEATURED"; id: string }
  | { type: "DELETE_AD"; id: string };

export interface AuditEntry {
  id: string;
  adRef: string;
  action: string;
  at: string;
}
