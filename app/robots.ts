import type { MetadataRoute } from "next";

/* ==========================================================================
   robots.txt — يسمح لمحركات البحث بأرشفة الموقع العام،
   ويمنع أرشفة صفحات الإدارة والصفحات غير المفيدة للبحث.
   ========================================================================== */

import { SITE_URL as BASE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/offline", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
