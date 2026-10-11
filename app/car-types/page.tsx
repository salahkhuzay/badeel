import React from "react";
import type { Metadata } from "next";
import CarTypesExplorer from "@/components/CarTypesExplorer";

/* صفحة «أنواع السيارات»: نوع ← ماركات ← طرازات */

export const metadata: Metadata = {
  title: "أنواع السيارات — سيدان، SUV، بيك أب، فان، باص، شاحنة ودراجات",
  description:
    "تصفّح سوق السيارات في منبج حسب نوع السيارة: سيدان، هاتشباك، رباعية الدفع، كوبيه، بيك أب، فان وعائلية، باص، شاحنة، دراجة نارية، سكوتر، جرار زراعي وآليات ثقيلة — مع ماركات كل نوع بشعاراتها الرسمية وكل طرازاتها.",
  alternates: { canonical: "/car-types" },
};

export default function CarTypesPage() {
  return <CarTypesExplorer />;
}
