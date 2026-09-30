import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingsBrowser from "@/components/ListingsBrowser";
import CategoryHeader from "@/components/CategoryHeader";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: "real-estate" }, { slug: "vehicles" }];
}

const META: Record<string, { title: string; desc: string }> = {
  "real-estate": {
    title: "عقارات منبج — شقق ومنازل وأراضٍ ومحلات",
    desc: "تصفّح العقارات المعروضة للبيع والإيجار في منبج: شقق سكنية، منازل عربية، أراضٍ للبناء والزراعة، محلات تجارية ومستودعات — بأسعار بالدولار والليرة السورية.",
  },
  vehicles: {
    title: "سيارات ومركبات للبيع في منبج",
    desc: "سيارات سياحية، شاحنات وبيك أب، دراجات نارية وآليات ثقيلة في منبج — مع تفاصيل الحالة والمحرّك ونمرة التسجيل.",
  },
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = META[params.slug];
  return m ? { title: m.title, description: m.desc } : { title: "تصنيف غير موجود" };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  if (params.slug !== "real-estate" && params.slug !== "vehicles") notFound();

  return (
    <>
      <CategoryHeader slug={params.slug as "real-estate" | "vehicles"} />
      <div className="container-page pt-6">
        <ListingsBrowser categoryLock={params.slug as "real-estate" | "vehicles"} embedded />
      </div>
    </>
  );
}
