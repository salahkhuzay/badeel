import type { Metadata } from "next";
import PostAdPageClient from "@/components/PostAdPageClient";

/* موجة 23: نموذج النشر أداة داخلية للزوار — لا فائدة من فهرستها،
   واستبعادها يُبقي نتائج جوجل للصفحات ذات المحتوى الفعلي. */
export const metadata: Metadata = {
  title: "نشر إعلان جديد في منبج",
  description:
    "انشر إعلانك مجاناً على بديل أونلاين منبج: عقارات، سيارات ومركبات، أثاث منزلي، هواتف، ملابس ووظائف — يصل الزوار فور الموافقة.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PostAdPageClient />;
}
