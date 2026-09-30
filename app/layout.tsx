import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "بديل | Badeel — سوق العقارات والمركبات في منبج",
    template: "%s | بديل - Badeel",
  },
  description:
    "بديل — خيارك الأفضل للبيع والشراء في منبج. منصة إعلانات مبوبة محلية متخصصة بالعقارات والسيارات والمركبات في مدينة منبج وريفها، مع عرض الأسعار بالدولار والليرة السورية.",
  keywords: [
    "بديل",
    "منبج",
    "عقارات منبج",
    "سيارات منبج",
    "شقق للبيع في منبج",
    "إعلانات مبوبة سوريا",
    "Badeel",
    "Manbij",
  ],
  applicationName: "بديل - Badeel",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "بديل" },
  formatDetection: { telephone: true },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://badeel.vercel.app"
  ),
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
    title: "بديل | Badeel — سوق العقارات والمركبات في منبج",
    description:
      "بديل — خيارك الأفضل للبيع والشراء في منبج. عقارات ومركبات مع أسعار بالدولار والليرة السورية.",
    siteName: "بديل - Badeel",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
