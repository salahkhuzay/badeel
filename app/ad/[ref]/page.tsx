import type { Metadata } from "next";
import AdPageClient from "@/components/AdPageClient";

/* موجة 23: صفحة تفاصيل الإعلان تُبنى في المتصفح من ذاكرة الجهاز (لا خادم
   خلفها)، لذا تُستبعد من الفهرسة — منعاً لصفحات رقيقة/مكررة تزاحم الرئيسية
   في نتائج جوجل. */
export function generateMetadata({ params }: { params: { ref: string } }): Metadata {
  return {
    title: `تفاصيل الإعلان ${params.ref}`,
    robots: { index: false, follow: true },
  };
}

export default function Page() {
  return <AdPageClient />;
}
