import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "من نحن",
  description: "قصة بديل أونلاين — منصة الإعلانات المبوبة المحلية في منبج.",
};

const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <section className="card p-5">
    <h2 className="mb-2 text-[15px] font-extrabold text-navy-900 dark:text-white">{t}</h2>
    <div className="space-y-2 text-[13px] leading-relaxed text-navy-600 dark:text-navy-200">
      {children}
    </div>
  </section>
);

export default function AboutPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amberBrand-500/10 text-amberBrand-600">
            <HeartHandshake size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">من نحن</h1>
            <p className="text-[12px] text-navy-400">بديل أونلاين — Badeel Online</p>
          </div>
        </div>

        <S t="قصتنا">
          <p>
            وُلدت «بديل أونلاين» من حاجة سوق منبج الحقيقي إلى لوحه إعلانات نظيفة وسريعة
            باللهجة المحلية: مكان واحد يجد فيه الناس شقة للإيجار، وسيارة سياحية أو جيب أو
            بيك أب، وجراراً زراعياً أو آلية ثقيلة، وهاتفاً جديداً أو مستعملاً، وغرفة نوم
            كاملة — بأسعار معروضة بالدولار والليرة معاً كما يتداولها السوق كل يوم.
          </p>
        </S>

        <S t="ماذا نقدم">
          <p>
            نشر الإعلانات مجاناً مع مراجعة إدارية قبل الظهور، وتصنيفات تغطي العقارات
            والمركبات بكل أنواعها (سياحية/جيب، بيك أب، شاحنات، فان، ميكروباص، باص، دراجات،
            جرارات، آليات ثقيلة) والهواتف والأثاث والأجهزة والملابس والوظائف، وبحث وفلترة
            بالمدينة والسعر والماركة والموديل كما يُسمّى في أسواقنا.
          </p>
        </S>

        <S t="لماذا سعر صرف مزدوج؟">
          <p>
            لأن السوق يفكّر بعملتين: يُخزَّن كل إعلان بالدولار والليرة، ويحدّث المسؤول سعر
            الصرف الرسمي يومياً من لوحة التحكم فيسري على كل الزوار فوراً — بلا حيرة وبلا
            حاسبات جانبية.
          </p>
        </S>

        <S t="تواصل معنا">
          <p>
            الدعم والرد على الاستفسارات عبر الاتصال أو واتساب على الرقم الظاهر في ترويسة
            الموقع، وعبر صفحتنا الرسمية على فيسبوك. ويمكن الاطلاع على{" "}
            <Link href="/terms" className="font-bold text-amberBrand-600 hover:underline">
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link href="/privacy" className="font-bold text-amberBrand-600 hover:underline">
              سياسة الخصوصية
            </Link>{" "}
            و{" "}
            <Link href="/cookies" className="font-bold text-amberBrand-600 hover:underline">
              سياسة ملفات الارتباط
            </Link>
            .
          </p>
        </S>
      </div>
    </div>
  );
}
