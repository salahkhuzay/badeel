"use client";

/* ==========================================================================
   مسودة إعلان غير مكتمل — بديل | Badeel
   ==========================================================================
   لماذا توجد هذه الطبقة؟
   على أندرويد، فتح الكاميرا أو منتقي الصور قد يجعل النظام يعيد تحميل الصفحة
   (أو ينهي المتصفح ليحرّر ذاكرة) عند العودة — فيضيع كل ما كتبه المستخدم
   وكل صورة أضافها. لذلك نحفظ المسودة (الحقول + الصور المضغوطة) في sessionStorage
   بعد كل تغيير، ونستعيدها عند العودة، ونحذفها بعد النشر الناجح.
   التخزين في sessionStorage (لا localStorage): المسودة تخص جلسة النشر الحالية
   فقط، ولا تُفاجئ المستخدم بإعلان قديم بعد أيام.
   ========================================================================== */

const DRAFT_KEY = "badeel.postad.draft.v1";

export type DraftEnvelope<T> = { form: T; savedAt: string };

/** حفظ المسودة — صامت عند امتلاء التخزين أو حجبه (لا نكسر النشر أبداً) */
export function saveDraft<T>(form: T): boolean {
  try {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ form, savedAt: new Date().toISOString() } satisfies DraftEnvelope<T>)
    );
    return true;
  } catch {
    return false;
  }
}

/** استعادة المسودة إن وُجدت */
export function loadDraft<T>(): T | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftEnvelope<T>;
    return parsed && typeof parsed === "object" && parsed.form ? parsed.form : null;
  } catch {
    return null;
  }
}

/** حذف المسودة (بعد النشر الناجح أو بطلب المستخدم) */
export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* تجاهل */
  }
}

/** هل توجد مسودة محفوظة؟ */
export function hasDraft(): boolean {
  try {
    return sessionStorage.getItem(DRAFT_KEY) !== null;
  } catch {
    return false;
  }
}
