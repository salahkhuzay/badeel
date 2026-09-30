import React from "react";
import type { Metadata } from "next";
import ListingsBrowser from "@/components/ListingsBrowser";

export const metadata: Metadata = {
  title: "البحث المتقدّم في إعلانات منبج",
  description:
    "ابحث في كل إعلانات بديل: عقارات ومركبات في منبج وريفها، مع فلترة حسب الحي ونطاق السعر ونوع العقار أو المركبة.",
};

export default function SearchPage() {
  return <ListingsBrowser pageSize={12} />;
}
