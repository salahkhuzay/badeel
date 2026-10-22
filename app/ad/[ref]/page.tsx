import type { Metadata } from "next";
import AdPageClient from "@/components/AdPageClient";
import { sbGetAdByRef } from "@/lib/supabase-server";
import { SITE_URL } from "@/lib/site";

/* موجة 23 + 38: صفحة تفاصيل الإعلان تعلن وسوم OpenGraph كاملة بصورة المنتج الحقيقية
   عبر endpoint موحّد /api/ad-image/[ref] حتى تلتقطه محركات النشر (فيسبوك، dlvr.it، واتساب)
   بدلاً من صورة الغلاف الافتراضية للرئيسية. */
export async function generateMetadata({ params }: { params: { ref: string } }): Promise<Metadata> {
  const ad = await sbGetAdByRef(params.ref);
  const title = ad ? `${ad.title} — بديل أونلاين` : `إعلان ${params.ref} — بديل أونلاين`;
  const desc = ad?.description?.trim()
    ? (ad.description.length > 160 ? `${ad.description.slice(0, 160)}…` : ad.description)
    : `تصفح تفاصيل الإعلان ${params.ref} على بديل أونلاين في منبج`;
  const imageUrl = `${SITE_URL}/api/ad-image/${params.ref}`;

  return {
    title,
    description: desc,
    robots: { index: false, follow: true },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/ad/${params.ref}`,
      title,
      description: desc,
      siteName: "بديل أونلاين",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default function Page() {
  return <AdPageClient />;
}
