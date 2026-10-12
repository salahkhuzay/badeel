"use client";

/* ==========================================================================
   معالجة صور الإعلانات المرفوعة من الجوال — بديل | Badeel
   ==========================================================================
   كل شيء يجري داخل متصفح المستخدم (بلا خادم وبلا رفع لأي مكان):
     ①  قراءة الصورة مع تصحيح دورانها من بيانات EXIF
     ②  تصغيرها إلى حدّ معقول (أطول ضلع 1280px)
     ③  ضغطها JPEG تدريجياً حتى تنزل تحت الحد المستهدف للحجم
     ④  إرجاعها كـ data URL تُخزَّن مع الإعلان في متصفح المستخدم
   ========================================================================== */

/** أقصى عدد صور في الإعلان الواحد */
export const MAX_AD_PHOTOS = 6;

/** أطول ضلع بعد التصغير */
export const PHOTO_MAX_EDGE = 1280;

/** أقصى حجم ملف مقبول قبل الضغط (12 م.ب) */
export const PHOTO_MAX_FILE_BYTES = 12 * 1024 * 1024;

/** الحد المستهدف لحجم الصورة بعد الضغط (طول النص base64 ≈ 1.37 × الحجم الفعلي) */
export const PHOTO_TARGET_CHARS = 150_000;

export type PhotoFail = { ok: false; message: string };
export type PhotoOk = { ok: true; dataUrl: string; bytes: number };

/** رسائل الأخطاء بالعربية — تُعرض للمستخدم كما هي */
const MSG = {
  notImage: "الملف المختار ليس صورة — اختر صورة بصيغة JPEG أو PNG.",
  tooBig: "حجم الصورة كبير جداً (الحد 12 م.ب) — جرّب صورة أخرى.",
  heic: "صيغة الصورة (HEIC) غير مدعومة على هذا المتصفح — صوّرها بالكاميرا أو حوّلها إلى JPEG.",
  decode: "تعذّر قراءة هذه الصورة — جرّب صورة أخرى.",
  canvas: "تعذّر تجهيز الصورة على هذا الجهاز — جرّب صورة أخرى.",
};

/** هل هذا الملف صورة مدعومة مبدئياً؟ */
export function isImageFile(file: File) {
  return Boolean(file && (file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)));
}

/** هل مصدر الصورة صورة حقيقية (وليست رسماً جاهزاً art:…)؟ */
export function isRealPhoto(src?: string | null): boolean {
  const s = String(src ?? "");
  return s.startsWith("data:image/") || /^https?:\/\//i.test(s) || s.startsWith("/uploads/");
}

/** تقدير الحجم التقريبي لصور الإعلان بالميغابايت (من طول النص) */
export function photosSizeMb(images: string[]) {
  const chars = images.filter(isRealPhoto).reduce((sum, s) => sum + s.length, 0);
  return chars / 1_000_000;
}

/** تحميل الصورة كعنصر <img> (مسار احتياطي عند فشل createImageBitmap) */
function loadViaImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = url;
  });
}

/** قراءة الصورة مع تصحيح الدوران — بمسارين لضمان العمل على كل الأجهزة */
async function readImage(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  /* المسار الأول: createImageBitmap مع احترام اتجاه EXIF (كروم وسفاري الحديثة) */
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, {
        imageOrientation: "from-image",
      } as ImageBitmapOptions);
      return { source: bmp, width: bmp.width, height: bmp.height, cleanup: () => bmp.close?.() };
    } catch {
      /* نكمل للمسار الثاني */
    }
  }
  /* المسار الثاني: <img> — المتصفحات الحديثة تطبّق اتجاه EXIF تلقائياً عند الرسم */
  const url = URL.createObjectURL(file);
  try {
    const img = await loadViaImg(url);
    return {
      source: img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      cleanup: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("decode");
  }
}

/** رسم الصورة على canvas بأبعاد محسوبة */
function drawToCanvas(source: CanvasImageSource, w: number, h: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  /* خلفية بيضاء: تحمي الصور الشفافة PNG من صيرورتها سوداء بعد ضغط JPEG */
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(source, 0, 0, cw, ch);
  return canvas;
}

/**
 * تجهيز صورة مرفوعة من الجوال: قراءة + تصحيح دوران + تصغير + ضغط.
 * تُرجع data URL جاهزاً للتخزين والعرض، أو رسالة خطأ عربية.
 */
export async function compressPhoto(file: File): Promise<PhotoOk | PhotoFail> {
  if (!isImageFile(file)) return { ok: false, message: MSG.notImage };
  if (file.size > PHOTO_MAX_FILE_BYTES) return { ok: false, message: MSG.tooBig };

  let read: Awaited<ReturnType<typeof readImage>>;
  try {
    read = await readImage(file);
  } catch {
    /* HEIC غالباً: يفشل فك ترميزه في المتصفحات غير الداعمة */
    const isHeic = /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    return { ok: false, message: isHeic ? MSG.heic : MSG.decode };
  }

  try {
    let maxEdge = PHOTO_MAX_EDGE;
    let quality = 0.72;
    let canvas = drawToCanvas(read.source, read.width, read.height, maxEdge);
    let dataUrl = canvas.toDataURL("image/jpeg", quality);

    /* إن بقيت أكبر من الحد المستهدف: انزل بالجودة ثم بالأبعاد */
    for (let i = 0; i < 3 && dataUrl.length > PHOTO_TARGET_CHARS; i++) {
      quality = Math.max(0.42, quality - 0.12);
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    while (dataUrl.length > PHOTO_TARGET_CHARS && maxEdge > 700) {
      maxEdge = Math.round(maxEdge * 0.78);
      canvas = drawToCanvas(read.source, read.width, read.height, maxEdge);
      dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    }

    return { ok: true, dataUrl, bytes: Math.round(dataUrl.length / 1.37) };
  } catch {
    return { ok: false, message: MSG.canvas };
  } finally {
    read.cleanup();
  }
}

/** تجهيز عدة صور بالتتابع مع تقرير تقدّم (لا يُجمّد الجوال بضغط متوازٍ ثقيل) */
export async function compressPhotoBatch(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<{ photos: string[]; errors: string[] }> {
  const photos: string[] = [];
  const errors: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const result = await compressPhoto(files[i]);
    if (result.ok) photos.push(result.dataUrl);
    else errors.push(result.message);
    onProgress?.(i + 1, files.length);
  }
  return { photos, errors };
}
