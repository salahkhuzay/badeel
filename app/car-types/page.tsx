import React from "react";
import type { Metadata } from "next";
import CarTypesExplorer from "@/components/CarTypesExplorer";

/* صفحة «أنواع السيارات»: نوع ← ماركات ← طرازات */

export const metadata: Metadata = {
  title: "أنواع السيارات والماركات الصينية والكهربائية — بديل منبج",
  description:
    "تصفّح سوق السيارات في منبج حسب النوع (سيدان، هاتشباك، SUV، كوبيه، بيك أب، فان، باص، شاحنة، دراجة، سكوتر، جرار، آليات) وحسب المجموعة: ماركات صينية (شانجان، بي واي دي، جيلي، شيري، إم جي، هافال، جيتور) وسيارات كهربائية وهايبرد بالكامل، وأشهر السيارات الصينية الصغيرة — مع ماركات كل نوع بشعاراتها الرسمية وكل طرازاتها.",
  alternates: { canonical: "/car-types" },
};

export default function CarTypesPage() {
  return <CarTypesExplorer />;
}
