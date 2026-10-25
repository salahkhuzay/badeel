/* ==========================================================================
   بديل | Badeel — أنواع البيانات الأساسية
   ========================================================================== */

export type Currency = "USD" | "SYP";

export type AdStatus =
  | "pending" // قيد المراجعة — لا يظهر للجمهور
  | "active" // منشور
  | "rejected" // مرفوض
  | "sold" // تم البيع
  | "rented"; // تم التأجير (أو تم الإيجار)

/* -------------------------- التصنيفات الرئيسية -------------------------- */
export type MainCategory =
  | "real-estate" // عقارات
  | "vehicles" // سيارات ومركبات
  | "furniture" // أثاث منزلي
  | "appliances" // أدوات وأجهزة كهربائية
  | "clothing" // ملابس وأزياء
  | "phones" // هواتف مستعملة وجديدة
  | "jobs" // وظائف
  | "other"; // أصناف ومنتجات أخرى (موجة 30)

/* ------------------------------ العقارات ------------------------------ */
export type PropertyType =
  | "apartment" // شقة سكنية
  | "house" // منزل عربي
  | "farm" // مزرعة
  | "building" // بناية
  | "land-building" // أرض بناء
  | "land-agricultural" // أرض زراعية
  | "shop" // محل تجاري
  | "warehouse"; // مستودع

/* ------------------------------- المركبات ------------------------------- */
export type VehicleType =
  | "passenger" // سيارة سياحية أو جيب
  | "pickup" // بيك أب
  | "van" // فان
  | "medium-truck" // شاحنة متوسطة
  | "tractor" // جرار زراعي
  | "motorcycle" // دراجة نارية
  | "microbus" // ميكرو باص
  | "bus" // باص
  | "machinery" // آليات ثقيلة
  | "heavy-truck" // شاحنة كبيرة
  | "mini-truck" // شاحنة صغيرة ( سوزوكي )
  | "other" // أخرى
  | "truck"; // احتياطي للتوافق مع الإعلانات السابقة

/* --------------------------- نوع التعامل/الإيجار --------------------------- */
export type DealType =
  | "sale" // بيع
  | "rent-daily" // إيجار يومي
  | "rent-monthly" // إيجار شهري
  | "rent-yearly"; // إيجار سنوي

/** عرض أو طلب — للوظائف (عرض وظيفة / طلب عمل) وأي تصنيف يقبل الطلب */
export type ListingKind = "offer" | "seek";

/* ------------------------------- الحالة ------------------------------- */
export type ItemCondition = "new" | "like-new" | "good" | "needs-repair";

/* -------------------------------- الوظائف -------------------------------- */
export type EmploymentType = "full-time" | "part-time" | "temporary" | "daily" | "remote";

/* ------------------------------ أوراق الملكية ------------------------------ */
export type OwnershipType =
  | "tabu-green"
  | "court-ruling"
  | "real-estate-agency"
  | "arqari-siyaq";

/* -------------------------- نمر السيارات (محدّث) -------------------------- */
export type PlateRegion =
  | "registered" // مجمرك
  | "new-import" // إدخال جديد
  | "idlib" // نمرة إدلب
  | "north" // نمرة الشمال
  | "democratic" // نمرة الديمقراطي
  | "regime"; // نمرة النظام

export type BodyCondition = "original" | "partial-damage" | "needs-service";
export type FuelType = "petrol" | "diesel" | "electric" | "hybrid";

/* ------------------------------- الإعلان ------------------------------- */
export interface Ad {
  id: string;
  ref: string; // رقم مرجعي قصير (مثال: BD-1042)
  title: string;
  description: string;
  category: MainCategory;

  /** نوع فرعي عام (أنواع الأثاث / الأجهزة / الملابس / مجالات العمل) */
  subtypeId?: string;
  subtypeLabel?: string;

  /** عرض أو طلب (الوظائف) */
  jobKind?: ListingKind;
  employmentType?: EmploymentType;
  experienceYears?: number;

  /** حالة السلعة (أثاث / أجهزة / ملابس) */
  condition?: ItemCondition;

  /* عقارات */
  propertyType?: PropertyType;
  dealType?: DealType;
  areaSize?: number;
  areaUnit?: "m2" | "donum";
  ownership?: OwnershipType;

  /* هواتف */
  storage?: string; // سعة التخزين (64GB, 128GB...)

  /* نوع هيكل المركبة (سيدان، SUV، بيك أب...) */
  bodyType?: string;

  /* مركبات */
  vehicleType?: VehicleType;
  brandId?: string; // معرّف الماركة (hyundai, kia...)
  modelId?: string; // معرّف الموديل داخل الماركة
  make?: string; // اسم الماركة نصاً (للعرض والبحث)
  model?: string; // اسم الموديل نصاً
  year?: number; // سنة الصنع
  bodyCondition?: BodyCondition;
  fuelType?: FuelType;
  plateRegion?: PlateRegion;

  /* السعر — يُخزَّن دائماً بالعملتين */
  price: number;
  currency: Currency;
  priceUsd: number;
  priceSyp: number;
  negotiable: boolean;
  /** هل السعر غير محدّد (مثل وظائف بدون راتب معلن) */
  priceOnRequest?: boolean;

  /* الموقع — المدينة فقط (أُلغيت الأحياء والمناطق) */
  cityId: string;

  /* إعلام */
  images: string[];
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
export interface City {
  id: string;
  name: string;
  governorate: string;
  active: boolean;
  /** عند التوسّع لاحقاً: مدن إضافية تُفعَّل من لوحة التحكم */
}

/* -------------------------------- الإعدادات -------------------------------- */
export interface Settings {
  usdToSyp: number;
  rateUpdatedAt?: string; // وقت آخر تعديل يدوي لسعر الصرف (يُعرض في اللوحة)
  whatsappCountryCode: string;
  siteSlogan: string;
  contactPhone: string;
  contactPhone2?: string; // رقم ثانٍ اختياري — يظهر تلقائياً عند تعبئته من اللوحة
  contactPhoneSource?: "default" | "custom"; // من ضبط الرقم؟ «custom» لا يمسّه أي ترحيل
  facebookUrl: string;
  /* الأمان */
  adminUsername: string;
  adminSalt: string;
  adminHash: string;
  passwordChanged: boolean; // هل غيّر المسؤول كلمة المرور الافتراضية؟
  sessionMinutes: number; // انتهاء الجلسة بالخمول
  maxLoginAttempts: number;
  lockMinutes: number;
}

export interface AuthState {
  loggedIn: boolean;
  sessionExpiresAt: string | null;
  sessionEpoch: number; // لخروج "من جميع الأجهزة"
  failedAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
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
  kind?: "ad" | "auth" | "geo" | "settings";
}
