import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف تتعامل منصة بديل أونلاين مع بياناتك الشخصية وإعلاناتك.",
};

const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <section className="card p-5">
    <h2 className="mb-2 text-[15px] font-extrabold text-navy-900 dark:text-white">{t}</h2>
    <div className="space-y-2 text-[13px] leading-relaxed text-navy-600 dark:text-navy-200">
      {children}
    </div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emeraldBrand-500/10 text-emeraldBrand-600">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
              سياسة الخصوصية
            </h1>
            <p className="text-[12px] text-navy-400">آخر تحديث: 13 تشرين الأول 2026</p>
          </div>
        </div>

        <S t="1. البيانات التي تظهر علناً">
          <p>
            عند نشر إعلان تُعرض للعامة البيانات التي أدخلتها أنت: عنوان الإعلان ووصفه وصوره
            وسعره واسم المُعلِن ورقم هاتفه (للتواصل والاتصال وواتساب). لا تنشر في الوصف أو
            الصور أي بيانات حساسة لا تريد ظهورها (أرقام وثائق، عناوين دقيقة، صور أفراد).
          </p>
        </S>

        <S t="2. البيانات المخزَّنة في متصفحك">
          <p>
            تعتمد المنصة بنية خفيفة: معظم حالتك (المدينة المختارة، العملة، الوضع الليلي،
            مسودة إعلانك غير المنشور، جلسة دخول المسؤول إن كنت مسؤولاً) تُحفظ محلياً في
            متصفحك وحده (localStorage / sessionStorage) ولا تُرسل إلى خوادمنا لأنها لا تغادر
            جهازك. مسح بيانات الموقع من المتصفح يزيلها نهائياً.
          </p>
        </S>

        <S t="3. البيانات المخزَّنة سحابياً">
          <p>
            يُخزَّن سعر الصرف الرسمي للمنصة في مخزن سحابي آمن (Upstash KV) لغرض عرضه على
            الجميع، ولا يرتبط بأي معرّف شخصي. لا نستخدم متتبعات إعلانية ولا نبيع أي بيانات
            ولا نشاركها مع وسطاء تسويق.
          </p>
        </S>

        <S t="4. لوحة الإدارة">
          <p>
            دخول المسؤول محمي ببصمة كلمة مرور (PBKDF2) وعدّاد محاولات وقفل مؤقت، وتُسجَّل
            عمليات المراجعة والحذف في سجل تدقيق داخلي يظهر للمسؤول فقط.
          </p>
        </S>

        <S t="5. حقوقك">
          <p>
            يمكنك طلب تعديل أو حذف إعلانك في أي وقت عبر الاتصال برقم الدعم المنشور في
            الترويسة، ويُنفَّذ الطلب بعد التحقق من ملكية الإعلان. كما يمكنك مسح بياناتك
            المحلية ذاتياً من إعدادات المتصفح.
          </p>
        </S>

        <S t="6. القاصرون">
          <p>
            المنصة موجهة لمن يبلغ 18 سنة فأكثر؛ وعلى ولي الأمر الإشراف على استخدام القاصرين
            لأي جهاز يدخل المنصة.
          </p>
        </S>
      </div>
    </div>
  );
}
