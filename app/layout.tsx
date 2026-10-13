import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "بديل أونلاين | Badeel Online — سوق العقارات والمركبات والهواتف في منبج",
    template: "%s | بديل أونلاين - Badeel Online",
  },
  description:
    "بديل — خيارك الأفضل للبيع والشراء في منبج. منصة إعلانات مبوبة محلية: عقارات، سيارات ومركبات، هواتف جديدة ومستعملة، أثاث، أجهزة كهربائية، ملابس ووظائف — بأسعار بالدولار والليرة السورية.",
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
  alternates: { canonical: "/" },
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
    title: "بديل أونلاين | Badeel Online — سوق العقارات والمركبات والهواتف في منبج",
    description:
      "بديل — خيارك الأفضل للبيع والشراء في منبج. عقارات، مركبات، هواتف، أثاث، أجهزة ووظائف مع أسعار بالدولار والليرة السورية.",
    siteName: "بديل أونلاين - Badeel Online",
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

/* سكربت صغير لمنع "وميض" الوضع الليلي قبل تحميل React */
const themeInit = `
(function(){try{
  var raw = localStorage.getItem('badeel.state.v1');
  var saved = raw ? JSON.parse(raw) : null;
  var dark = saved && saved.theme ? saved.theme === 'dark'
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
        "سوق إعلانات مبوبة محلي في منبج: عقارات، سيارات ومركبات، هواتف، أثاث، أجهزة ووظائف — بأسعار بالدولار والليرة السورية.",
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
