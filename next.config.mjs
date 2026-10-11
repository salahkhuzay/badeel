/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // مفيد عند النشر على استضافة ثابتة (Vercel / Netlify / Cloudflare Pages)
  images: { unoptimized: true },

  /* ==========================================================================
     ترويسات منع الاحتفاظ بنسخة قديمة في المتصفح أو الوسطاء:
     - صفحات HTML: no-store → كل فتح يجلب آخر نسخة منشورة.
     - ملف Service Worker: no-cache → فحص التحديثات يصل للشبكة دائماً.
     - ملفات _next/static بأسماء مُجزَّأة (hash) تبقى قابلة للتخزين الطويل بأمان.
     ========================================================================== */
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // كل ما هو ليس أصولاً ثابتة مُجزَّأة أو صوراً أو المانيفست أو العامل
        source: "/((?!_next/static|_next/image|images|favicon.svg|manifest.webmanifest|sw.js).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
