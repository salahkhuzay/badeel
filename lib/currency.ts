import type { Ad, Currency, Settings } from "./types";
import { CURRENCY_LABEL } from "./taxonomy";

/* ==========================================================================
   محرّك العملة المزدوجة + أدوات التنسيق العربية
   ========================================================================== */

/** سعر الصرف الافتراضي — يمكن تعديله من لوحة التحكم (إعدادات) */
export const DEFAULT_SETTINGS: Settings = {
  usdToSyp: 13000,
  whatsappCountryCode: "963",
  siteSlogan: "بديل — خيارك الأفضل للبيع والشراء في منبج",
  contactPhone: "0955555555",
};

/** تحويل مبلغ من عملة إلى أخرى */
export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  usdToSyp: number
): number {
  if (from === to) return Math.round(amount);
  return from === "USD" ? Math.round(amount * usdToSyp) : Math.round(amount / usdToSyp);
}

/** تنسيق الأرقام بالعربية مع فواصل الآلاف */
export function formatNumber(n: number, maximumFractionDigits = 0) {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(n);
}

/** تنسيق مبلغ + رمز العملة */
export function formatMoney(amount: number, currency: Currency) {
  const value = formatNumber(amount);
  return currency === "USD" ? `$ ${value}` : `${value} ل.س`;
}

/** التحويل المختصر للأرقام الكبيرة: 12.5 ألف / 1.2 مليون */
export function compactMoney(amount: number, currency: Currency) {
  const v = Math.abs(amount);
  const suffix =
    v >= 1_000_000_000
      ? { d: 1_000_000_000, s: "مليار" }
      : v >= 1_000_000
        ? { d: 1_000_000, s: "مليون" }
        : v >= 10_000
          ? { d: 1000, s: "ألف" }
          : null;
  if (!suffix) return formatMoney(amount, currency);
  const n = amount / suffix.d;
  return currency === "USD"
    ? `$ ${formatNumber(n, 1)} ${suffix.s}`
    : `${formatNumber(n, 1)} ${suffix.s} ل.س`;
}

/** السعر بالأرقام مع تسمية العملة الكاملة (للجداول) */
export function priceWithLabel(amount: number, currency: Currency) {
  return `${formatNumber(amount)} ${CURRENCY_LABEL[currency].long}`;
}

/* --------------------------------- الوقت --------------------------------- */
export function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 30) return `قبل ${d} يوم`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `قبل ${mo} شهر`;
  return `قبل ${Math.floor(mo / 12)} سنة`;
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/* ------------------------------ الاتصالات ------------------------------ */

/** تطبيع رقم الهاتف السوري: 0955555555 → 963955555555 */
export function normalizePhone(raw: string, countryCode = "963") {
  let digits = (raw || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = countryCode + digits.slice(1);
  else if (!digits.startsWith(countryCode)) digits = countryCode + digits;
  return digits;
}

/** رقم للعرض للمستخدم المحلي */
export function displayPhone(raw: string, countryCode = "963") {
  const n = normalizePhone(raw, countryCode);
  if (!n.startsWith(countryCode)) return n;
  return "0" + n.slice(countryCode.length);
}

/** رابط واتساب برسالة جاهزة */
export function whatsappLink(
  phone: string,
  ad: Pick<Ad, "title" | "ref">,
  countryCode = "963"
) {
  const text = `مرحباً، أنا مهتم بإعلانك على منصة بديل: ${ad.title}`;
  return `https://wa.me/${normalizePhone(phone, countryCode)}?text=${encodeURIComponent(
    text
  )}`;
}

export function telLink(phone: string, countryCode = "963") {
  return `tel:+${normalizePhone(phone, countryCode)}`;
}

/* -------------------------------- متنوع -------------------------------- */

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export function nextRef(existing: Ad[]) {
  const nums = existing
    .map((a) => parseInt((a.ref || "").replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `BD-${max + 1}`;
}

/** تخزين آمن: يعمل حتى لو كانت التخزين المحلي محجوباً (iframe sandbox) */
export const safeStorage = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return mem.get(key) ?? null;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      mem.set(key, value as never);
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      mem.delete(key);
    }
  },
};

const mem = new Map<string, never>();
