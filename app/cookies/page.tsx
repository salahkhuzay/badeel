import type { Metadata } from "next";
import { Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة ملفات الارتباط",
  description: "ما الذي يخزّنه موقع بديل أونلاين في متصفحك ولماذا، وكيف تتحكم به.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cookies" },
};

const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <section className="card p-5">
    <h2 className="mb-2 text-[15px] font-extrabold text-navy-900 dark:text-white">{t}</h2>
    <div className="space-y-2 text-[13px] leading-relaxed text-navy-600 dark:text-navy-200">
      {children}
    </div>
  </section>
);

export default function CookiesPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
            <Cookie size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
              سياسة ملفات الارتباط والتخزين المحلي
            </h1>
            <p className="text-[12px] text-navy-400">آخر تحديث: 13 تشرين الأول 2026</p>
          </div>
        </div>

        <S t="1. لا كوكيز تتبّع">
          <p>
            لا يضع موقع بديل أونلاين كوكيز تتبّع إعلانية ولا كوكيز أطراف ثالثة، ولا نربط
            زيارتك بأي شبكة إعلانات أو تحليلات تجارية خارجية.
          </p>
        </S>

        <S t="2. التخزين المحلي الذي نستخدمه ولماذا">
          <p>
            نستخدم تخزين المتصفح المحلي (localStorage) وتخزين الجلسة (sessionStorage) لأغراض
            تشغيلية بحتة: تذكّر المدينة والعملة المفضلة والوضع الليلي/النهاري، وحفظ مسودة
            إعلانك أثناء كتابته حتى لا يضيع عند إغلاق الصفحة، وتذكّر جلسة دخول المسؤول مع
            بصمة كلمة المرور المشفّرة إن كنت مسؤولاً، ودعم عمل الموقع كتطبيق مثبّت (PWA)
            بدون إنترنت عبر Service Worker.
          </p>
        </S>

        <S t="3. ماذا يحدث إن مسحت التخزين؟">
          <p>
            من إعدادات المتصفح ← بيانات الموقع ← حذف: ستفقد التفضيلات والمسودة غير المنشورة
            وجلسة الدخول المحلية، وستعود المنصة لحالتها الافتراضية — دون أي أثر على
            إعلاناتك المنشورة أو على بقية الزوار.
          </p>
        </S>

        <S t="4. التحكم">
          <p>
            يمكنك رفض التخزين المحلي أو مسحه في أي وقت من إعدادات خصوصية متصفحك؛ سيبقى
            تصفّح الإعلانات وعرضها يعملان بشكل طبيعي.
          </p>
        </S>
      </div>
    </div>
  );
}
