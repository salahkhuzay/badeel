/* ==========================================================================
   Service Worker — بديل (PWA)  ·  الإصدار v3
   سياسة صارمة ضد النسخ القديمة:
   - لا نخزّن صفحات HTML ولا ملفات JS/CSS إطلاقاً → المتصفح يجلبها من الشبكة دائماً.
   - نُخزّن الصور فقط (cache-first) + صفحة «لا يوجد اتصال».
   - عند التثبيت: skipWaiting فوراً، وعند التنشيط: حذف كل الكاشات السابقة.
   ========================================================================== */

const VERSION = "badeel-v3";
const CORE_CACHE = `${VERSION}-core`;
const IMAGE_CACHE = `${VERSION}-images`;

const CORE_FILES = ["/offline", "/favicon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE_CACHE);
      await Promise.all(CORE_FILES.map((u) => cache.add(u).catch(() => {})));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      /* حذف كل الكاشات — بما فيها كاشات النسخ القديمة (badeel-v1/v2...) */
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CORE_CACHE && k !== IMAGE_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();
  if (data.type === "PURGE") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        if (event.source && event.source.postMessage) event.source.postMessage({ type: "PURGED" });
      })()
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* الصور: cache-first (آمنة لأن أسماءها ثابتة داخل /images) */
  if (request.destination === "image") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return hit || Response.error();
        }
      })()
    );
    return;
  }

  /* تنقلات الصفحات: من الشبكة دائماً وبلا كاش وسيط؛ وعند الانقطاع → صفحة offline */
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request, { cache: "no-store" });
        } catch {
          const cache = await caches.open(CORE_CACHE);
          return (await cache.match("/offline")) || Response.error();
        }
      })()
    );
    return;
  }

  /* بقية الأصول (JS/CSS/HTML/JSON): تمرّ للشبكة كما هي — لا تخزين إطلاقاً */
});
