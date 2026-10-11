/* ==========================================================================
   أمان لوحة التحكم — بديل | Badeel
   - كلمة المرور تُخزَّن كبصمة PBKDF2-SHA256 (120 ألف تكرار) وملح عشوائي،
     ولا تُخزَّن نصّاً صريحاً في أي مكان.
   - قفل تلقائي بعد عدد محاولات فاشلة، وانتهاء جلسة تلقائي بعد خمول.
   ملاحظة إنتاجية: عند ربط قاعدة بيانات يجب نقل التحقق إلى الخادم (API + JWT)
   لأن أي تحقق في المتصفح يمكن تجاوزه نظرياً بواسطة صاحب الجهاز نفسه.
   ========================================================================== */

export const PBKDF2_ITERATIONS = 120000;
export const PBKDF2_KEYLEN = 32; // بايت
export const PBKDF2_DIGEST = "SHA-256";

/** اسم مستخدم لوحة التحكم (غير معروض في الواجهة) */
export const ADMIN_USERNAME = "admin";

/**
 * كلمة المرور الافتراضية: تُسلَّم بشكل خاص (لا تُكتب في الكود ولا في المستودع)
 * لتغييرها: من اللوحة → الإعدادات والأمان → تغيير كلمة مرور اللوحة
 * (تُغيَّر من لوحة التحكم ← الإعدادات ← الأمان، ويُطلب تغييرها في أول دخول)
 */
export const DEFAULT_ADMIN_SALT = "badeel::manbij::v1";
export const DEFAULT_ADMIN_HASH =
  "0938b34bfd8af5496995bd209652bf20b6e2019c057124798ec6ba6cfe09a640";

/** ملح عشوائي جديد */
export function randomSalt(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(arr);
  else for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

/** بصمة كلمة المرور (PBKDF2-SHA256) — تعمل في المتصفح والخادم */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_DIGEST,
    },
    keyMaterial,
    PBKDF2_KEYLEN * 8
  );
  return toHex(bits);
}

/** مقارنة بزمن ثابت (تمنع هجمات قياس الزمن) */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface PasswordCheck {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  issues: string[];
  ok: boolean;
}

/** تقييم قوة كلمة المرور */
export function checkPassword(pw: string): PasswordCheck {
  const issues: string[] = [];
  if (pw.length < 8) issues.push("8 أحرف على الأقل");
  if (!/[a-z]/.test(pw)) issues.push("حرف لاتيني صغير");
  if (!/[A-Z]/.test(pw)) issues.push("حرف لاتيني كبير");
  if (!/\d/.test(pw)) issues.push("رقم واحد على الأقل");
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push("رمز خاص مثل @ # $ !");
  if (/(1234|123456|password|badeel|admin|0000)/i.test(pw)) issues.push("لا تستخدم كلمات شائعة");

  const score = Math.max(0, Math.min(4, 5 - issues.length)) as 0 | 1 | 2 | 3 | 4;
  const labels = ["ضعيفة جداً", "ضعيفة", "متوسطة", "جيدة", "قوية"];
  return { score, label: labels[score], issues, ok: issues.length === 0 };
}

/** هل انتهت مدة القفل؟ */
export const lockRemaining = (lockedUntil?: string | null) => {
  if (!lockedUntil) return 0;
  const diff = new Date(lockedUntil).getTime() - Date.now();
  return diff > 0 ? diff : 0;
};

export const formatDuration = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s} ثانية`;
  const m = Math.ceil(s / 60);
  return m < 60 ? `${m} دقيقة` : `${Math.ceil(m / 60)} ساعة`;
};
