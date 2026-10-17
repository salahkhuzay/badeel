import type { Metadata } from "next";
import HowItWorksClient from "@/components/HowItWorksClient";

/* موجة 23: صفحة شرح الخدمة تحمل رابطها القانوني الخاص بها */
export const metadata: Metadata = {
  title: "كيف يعمل بديل أونلاين",
  description:
    "خطوات البيع والشراء على بديل أونلاين في منبج: نشر الإعلان، مراجعته، ثم التواصل المباشر بين البائع والمشتري — بلا وسيط ولا عمولة.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return <HowItWorksClient />;
}
