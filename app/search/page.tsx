import React from "react";
import type { Metadata } from "next";
import ListingsBrowser from "@/components/ListingsBrowser";

export const metadata: Metadata = {
  title: "البحث المتقدّم في إعلانات منبج",
  description:
    "ابحث في كل إعلانات بديل: عقارات، مركبات، هواتف، أثاث، أجهزة، ملابس ووظائف في منبج — مع فلترة حسب الماركة والموديل وسنة الصنع والحالة ونطاق السعر والمدينة.",
  /* بحث داخلي بنتائج متغيرة — يُستبعد من الفهرسة (موجة 23) */
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return <ListingsBrowser pageSize={12} />;
}
