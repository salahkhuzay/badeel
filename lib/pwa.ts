/* ==========================================================================
   أدوات تحديث الموقع (PWA)
   الهدف: ألّا يرى المستخدم نسخة قديمة مخزَّنة أبداً.
   - registerSW: تسجيل العامل + فحص التحديثات فوراً + إعادة تحميل عند وصول نسخة جديدة.
   - purgeAndReload: حذف كل الكاشات وإلغاء تسجيل العاملين ثم إعادة تحميل بلا كاش وسيط.
   ========================================================================== */

export const APP_VERSION = "3.8.5";
export const APP_BUILD = "2026-10-21";
export const APP_RELEASE = `${APP_VERSION} · ${APP_BUILD}`;

const RELOAD_FLAG = "badeel.sw.reloaded";

/** هل بيئة المتصفح تسمح بـ Service Worker؟ */
function swSupported() {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  const { protocol, hostname } = location;
  return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
}

/** حذف كل الكاشات + إلغاء العاملين + إعادة تحميل (زر «تحديث» ووسم #update) */
export async function purgeAndReload() {
  try {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    }
  } catch {
    /* تجاهل */
  }
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    /* تجاهل */
  }
  const url = new URL(location.href);
  url.hash = "";
  url.searchParams.set("fresh", Date.now().toString(36));
  location.replace(url.toString());
}

/** تسجيل العامل + تحديث تلقائي عند وجود نسخة جديدة */
export async function registerSW() {
  if (!swSupported()) return;
  let reloading = false;

  /* مهم: هل كان هناك عامل يتحكم بالصفحة قبل هذه الزيارة؟
     - لا  ⇒ هذا أول تسجيل للعامل، وسيطرة العامل الأولى تُطلق controllerchange
             **ولا يجوز** إعادة تحميل الصفحة حينها: المستخدم قد يكون في منتصف
             ملء إعلان (أو رفع صور) فتضيع كل بياناته.
     - نعم ⇒ وصلت نسخة جديدة فعلياً، وعندها فقط نُحدّث الصفحة. */
  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return; // أول سيطرة — بلا إعادة تحميل
    if (reloading) return;
    try {
      if (sessionStorage.getItem(RELOAD_FLAG) === "1") return;
      sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {
      /* تجاهل */
    }
    reloading = true;
    location.reload();
  });

  try {
    /* إلغاء أي تسجيل قديم لعامل آخر (مثلاً نسخة سابقة بمسار مختلف) */
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url && !url.endsWith("/sw.js");
        })
        .map((r) => r.unregister().catch(() => false))
    );

    const reg = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
    await reg.update().catch(() => {});

    if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });

    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller)
          sw.postMessage({ type: "SKIP_WAITING" });
      });
    });
  } catch {
    /* بيئة مقيّدة — لا نكسر الواجهة */
  }
}
