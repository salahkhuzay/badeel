import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  /* موجة 23: العنوان الافتراضي يبدأ بما طلبه صاحب المنصة — عقارات وسيارات */
  title: {
    default: "عقارات وسيارات للبيع والشراء في منبج | بديل أونلاين — Badeel Online",
    template: "%s | بديل أونلاين - Badeel Online",
  },
  description:
    "عقارات وسيارات ومركبات في منبج أولاً: شقق وأراضٍ ومحلات وسيارات مستعملة وجديدة، إضافة إلى أثاث منزلي وأدوات كهربائية وملابس وهواتف ووظائف — بيع وشراء مباشر بين البائع والمشتري على بديل أونلاين، بأسعار بالدولار والليرة السورية.",
  keywords: [
    "بديل",
    "منبج",
    "عقارات منبج",
    "سيارات منبج",
    "شقق للبيع في منبج",
    "هواتف مستعملة منبج",
    "آيفون منبج",
    "سامسونغ منبج",
    "وظائف منبج",
    "إعلانات مبوبة سوريا",
    "Badeel",
    "Manbij",
  ],
  applicationName: "بديل أونلاين - Badeel Online",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "بديل أونلاين" },
  formatDetection: { telephone: true },
  metadataBase: new URL(SITE_URL),
  /* موجة 23: أُزيل canonical العام من هنا — كان يُسنَد لكل صفحة فيدمج جوجل
     صفحات الخصوصية/التصنيفات في فهرس الرئيسية (سبب النتائج المشوّهة).
     كل صفحة تعلن رابطها القانوني بنفسها الآن. */
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // للتحقق من ملكية الموقع في Google Search Console — يُضبط من متغيّرات البيئة على الاستضافة
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    locale: "ar_SY",
    title: "بديل أونلاين | عقارات، سيارات، أثاث وسلع مستعملة في منبج",
    description:
      "موقع بديل أونلاين في منبج — بيع وشراء العقارات، السيارات والمركبات، الأثاث المنزلي، الهواتف والسلع المستعملة مباشرة بين البائع والمشتري.",
    siteName: "بديل أونلاين - Badeel Online",
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "بديل أونلاين — سوق منبج للإعلانات المبوبة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بديل أونلاين | عقارات، سيارات، أثاث وسلع مستعملة في منبج",
    description:
      "موقع بديل أونلاين في منبج — بيع وشراء العقارات، السيارات والمركبات، الأثاث المنزلي، الهواتف والسلع المستعملة مباشرة بين البائع والمشتري، بأسعار بالدولار والليرة السورية.",
    images: ["/og-cover.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

/* سكربت صغير لمنع "وميض" الوضع الليلي قبل تحميل React —
   يقرأ الثيم بتعبير نمطي من النص الخام بلا JSON.parse (موجة 22): ذاكرة
   الصيغة القديمة عند بعض المستخدمين ميغابايتات، وتحليلها هنا كان يجمّد
   أول إطلالة على الجوال */
const themeInit = `
(function(){try{
  var raw = localStorage.getItem('badeel.state.v1') || '';
  var m = raw.match(/"theme":"(dark|light)"/);
  var dark = m ? m[1] === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
}catch(e){}})();
`;

/* بيانات منظمة Schema.org — تحسّن ظهور الموقع في نتائج Google
   (اسم الموقع، شعاره، وصندوق بحث داخلي في نتائج البحث) */
const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "بديل أونلاين - Badeel Online",
      alternateName: ["بديل", "Badeel"],
      description:
        "موقع بديل أونلاين في منبج — بيع وشراء العقارات، السيارات والمركبات، الأثاث المنزلي، الهواتف والسلع المستعملة مباشرة بين البائع والمشتري.",
      inLanguage: "ar",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "بديل أونلاين - Badeel Online",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      areaServed: "SY",
    },
  ],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* بيانات منظمة JSON-LD: تعرّف Google بالموقع وبصندوق البحث فيه */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON_LD }}
        />
      </head>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
