"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  Building2,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Handshake,
  MessageCircle,
  Phone,
  PlusCircle,
  ShieldCheck,
  Smartphone,
  Sofa,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import Price from "@/components/Price";
import { useStore } from "@/lib/store";
import { displayPhone, supportWhatsapp, telLink } from "@/lib/currency";
import { contactNumbers } from "@/lib/contact";

export default function HowItWorksPage() {
  const { settings, publicAds } = useStore();
  const sample = publicAds.find((a) => a.status === "active");
  const tel = telLink(settings.contactPhone, settings.whatsappCountryCode);

  return (
    <div className="pb-6">
      {/* الرأس */}
      <section className="bg-navy-900 py-10 text-white">
        <div className="container-page">
          <span className="chip bg-amberBrand-500/15 text-amberBrand-400 ring-1 ring-amberBrand-500/30">
            <ShieldCheck size={13} /> السياسات وطريقة العمل
          </span>
          <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            كيف يعمل بديل؟ ولماذا هو <span className="text-amberBrand-400">أكثر أماناً</span> من
            المجموعات المفتوحة؟
          </h1>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-navy-200">
            بديل منصّة محلية لمنبج تجمع العرض والطلب في مكان واحد منظّم: عقارات، سيارات ومركبات،
            أثاث منزلي، أدوات كهربائية، ملابس، ووظائف (عرض وظيفة/طلب عمل) — مع مراجعة بشرية لكل
            إعلان، وعرض للأسعار بالعملتين، وتواصل مباشر بين الطرفين دون وسيط أو عمولة.
          </p>
        </div>
      </section>

      {/* الخطوات */}
      <section className="container-page mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            n: "1",
            icon: <PlusCircle size={20} />,
            t: "أضف إعلانك مجاناً",
            d: "نموذج ذكي: يطلب الحقول المناسبة فقط حسب التصنيف — ماركة وموديل وسنة صنع للمركبات، نوع وحالة للأثاث والأجهزة والملابس، عرض أو طلب للوظائف — ويحسب السعر بالعملتين مباشرة.",
            tone: "amber",
          },
          {
            n: "2",
            icon: <Clock3 size={20} />,
            t: "مراجعة بشرية (الموافقة المسبقة)",
            d: "كل إعلان يبدأ بحالة «قيد المراجعة». يتحقّق فريق بديل من وضوح البيانات وصحة التواصل ومنع التكرار.",
            tone: "navy",
          },
          {
            n: "3",
            icon: <MessageCircle size={20} />,
            t: "النشر والتواصل المباشر",
            d: "بعد الموافقة يُنشر الإعلان، ويمكن للمشترين مراسلتك عبر واتساب برسالة جاهزة أو الاتصال بك مباشرة.",
            tone: "emerald",
          },
          {
            n: "4",
            icon: <Handshake size={20} />,
            t: "إتمام الصفقة وإغلاق الإعلان",
            d: "بعد البيع أو التأجير نُعلّم الإعلان كـ«تم البيع/تم التأجير» لتبقى المنصة محدّثة ونظيفة.",
            tone: "navy",
          },
        ].map((s) => (
          <div key={s.n} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-amberBrand-400 dark:bg-white dark:text-navy-900">
                {s.icon}
              </span>
              <span className="text-3xl font-extrabold text-navy-100 dark:text-navy-800">{s.n}</span>
            </div>
            <h3 className="mt-3 text-[14px] font-extrabold text-navy-900 dark:text-white">{s.t}</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
              {s.d}
            </p>
          </div>
        ))}
      </section>

      {/* محرّك العملة */}
      <section className="container-page mt-10 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <CircleDollarSign size={18} className="text-amberBrand-500" /> محرّك العملة المزدوجة
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-navy-500 dark:text-navy-300">
            في منبج يُتداوَل بالدولار والليرة معاً. لذلك يحفظ بديل كل سعر بالعملتين ويحدّث العرض فور
            تغيير سعر الصرف من لوحة التحكم، مع إمكانية تبديل عملة العرض من الشريط العلوي في أي صفحة.
          </p>

          {sample && (
            <div className="mt-5 rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
              <p className="mb-2 text-[11.5px] font-semibold text-navy-400">
                مثال حقيقي من المنصة — يُعرض السعران دائماً:
              </p>
              <p className="text-[13px] font-bold text-navy-800 dark:text-navy-100">
                {sample.title}
              </p>
              <div className="mt-3">
                <Price priceUsd={sample.priceUsd} priceSyp={sample.priceSyp} size="lg" />
              </div>
              <p className="mt-3 text-[11.5px] text-navy-400">
                سعر الصرف المعتمد حالياً: 1 $ = {settings.usdToSyp.toLocaleString("en-US")} ل.س
              </p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <Smartphone size={18} className="text-indigo-500" /> هواتف جديدة ومستعملة
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-navy-500 dark:text-navy-300">
            سوق الهواتف في بديل: اختر <b>الماركة بالأيقونة الرسمية</b> (آيفون، سامسونغ، شاومي،
            هواوي، أوبو، ريلمي، فيفو، نوكيا، إنفينيكس، هونر، ون بلس، موتورولا...) ثم <b>الموديل</b>
            من قائمة الماركة، وحدّد <b>الحالة</b> (جديد / مستعمل كالجديد / بحالة جيدة / يحتاج صيانة)
            و<b>سعة التخزين</b> — والفرز في السوق يتم بنفس أيقونات الماركات.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { t: "جديد بالعلبة", d: "أجهزة جديدة مع الكرتونة والملحقات" },
              { t: "مستعمل نظيف", d: "بسعر أقل مع توضيح الحالة بدقة" },
              { t: "إكسسوارات وقطع", d: "شواحن، شاشات، بطاريات، سماعات" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                <p className="text-[12.5px] font-extrabold text-navy-800 dark:text-navy-50">{x.t}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-navy-400">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-navy-400">
            للسيارات نفس المبدأ: ماركة بالأيقونة الرسمية ← موديل ← سنة صنع ← نمرة — وبند إيجار
            يومي/شهري/سنوي عند الحاجة.
          </p>
        </div>
      </section>

      {/* البيانات المطلوبة لكل تصنيف */}
      <section className="container-page mt-10 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <Building2 size={18} className="text-emeraldBrand-500" /> العقارات: ما يجب ذكره
          </h2>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-200">
            <Item>نوع العقار: شقة سكنية، منزل عربي، أرض بناء، أرض زراعية، محل تجاري، مستودع.</Item>
            <Item>نوع التعامل: بيع، إيجار شهري، أو إيجار سنوي (مع توضيح إن كان السعر شهرياً/سنوياً).</Item>
            <Item>المساحة: بالمتر المربع، وللأراضي بالدونم.</Item>
            <Item>وضع الأوراق: طابو أخضر، حكم محكمة، وكالة عقارية، أو عرقاري - سياق.</Item>
            <Item>حالة التفاوض: هل السعر قابل للتفاوض أم نهائي.</Item>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <Car size={18} className="text-amberBrand-500" /> المركبات: ما يجب ذكره
          </h2>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-200">
            <Item>نوع المركبة: سيارة سياحية، شاحنة/بيك أب، دراجة نارية، آليات ثقيلة/جرار زراعي.</Item>
            <Item>الماركة والموديل وسنة الصنع.</Item>
            <Item>حالة الجسم: خالية العلام أورجينال، قص وبخ جزئي، أو تحتاج صيانة.</Item>
            <Item>نوع الوقود: بنزين، مازوت، كهرباء.</Item>
            <Item>
              نمرة التسجيل: مجمرك، إدخال جديد، نمرة إدلب، نمرة الشمال، نمرة الديمقراطي، أو نمرة
              النظام.
            </Item>
            <Item>
              الماركة والموديل من قائمة الأيقونات (هيونداي، كيا، تويوتا، مرسيدس، ميتسوبيشي، جيب،
              لاندروفر، رنج روفر، بي إم دبليو، أودي، فولكس فاغن، مازدا، نيسان، سكودا، شام، بيجو،
              رينو)، ولمن لا يجد ماركته: «ماركة أخرى» بكتابة يدوية.
            </Item>
            <Item>نوع التعامل: بيع، أو إيجار يومي/شهري حسب الحاجة.</Item>
          </ul>
        </div>
      </section>

      {/* تصنيفات إضافية: أثاث وأجهزة وملابس ووظائف */}
      <section className="container-page mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <Sofa size={18} className="text-rose-500" /> الأثاث والأجهزة والملابس
          </h2>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-200">
            <Item>حدّد النوع: غرفة نوم، كنبة، طاولة، خزانة... أو ثلاجة، غسالة، مكيف، مولّد.</Item>
            <Item>حدّد الحالة: جديد، مستعمل بحالة ممتازة، مستعمل بحالة جيدة، أو يحتاج صيانة.</Item>
            <Item>للأجهزة: اذكر الماركة، وللملابس: اذكر المقاس (S/M/L أو الرقم).</Item>
            <Item>أضف صوراً واضحة للقطعة نفسها — الصور من الإنترنت سبب رئيسي للرفض.</Item>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <Briefcase size={18} className="text-navy-600 dark:text-navy-200" /> الوظائف: عرض أم طلب؟
          </h2>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-200">
            <Item>«عرض وظيفة» إن كنت صاحب عمل وتبحث عن موظف، و«طلب عمل» إن كنت تبحث عن عمل.</Item>
            <Item>حدّد مجال العمل: تعليم، صحة، هندسة، بناء، مطاعم، سائقين، حرفيين، إداري...</Item>
            <Item>حدّد نوع الدوام: كامل، جزئي، بالورديات، حر، أو تدريب.</Item>
            <Item>الأجر اختياري — إن تركته فارغاً يُعرض «الأجر: يُتفق عليه» ويُحدَّث بالتفاوض المباشر.</Item>
          </ul>
        </div>
      </section>

      {/* الدعم والتواصل */}
      <section className="container-page mt-10">
        <div className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-right">
          <div>
            <h2 className="flex items-center justify-center gap-2 text-[16px] font-extrabold text-navy-900 sm:justify-start dark:text-white">
              <Phone size={18} className="text-amberBrand-500" /> التواصل والدعم
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
              لأي استفسار أو طلب تعديل/إغلاق إعلان، تواصل مع فريق بديل مباشرة — اتصال أو واتساب،
              أو عبر صفحتنا على فيسبوك.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
              {contactNumbers(settings).map((p) => (
                <a
                  key={p}
                  href={telLink(p, settings.whatsappCountryCode)}
                  className="text-[15px] font-extrabold text-navy-800 hover:text-amberBrand-600 dark:text-navy-50"
                  dir="ltr"
                >
                  {displayPhone(p, settings.whatsappCountryCode)}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={tel} className="btn-primary px-5">
              <Phone size={16} /> اتصال
            </a>
            <a
              href={supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-emeraldBrand-500 px-5 text-white hover:bg-emeraldBrand-600"
            >
              <MessageCircle size={16} /> واتساب
            </a>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-5"
            >
              فيسبوك
            </a>
          </div>
        </div>
      </section>

      {/* القواعد + الأمان */}
      <section className="container-page mt-10 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <AlertTriangle size={18} className="text-amberBrand-500" /> أسباب رفض الإعلان
          </h2>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-200">
            <Item>إعلان مكرر أو مُعاد نشره لأكثر من مرة.</Item>
            <Item>معلومات ناقصة أو غير واضحة (خصوصاً وضع الأوراق أو حالة المركبة).</Item>
            <Item>صور غير مطابقة للوصف أو صور من الإنترنت.</Item>
            <Item>بيانات تواصل غير صحيحة أو غير قابلة للتحقّق.</Item>
            <Item>سعر غير منطقي مقارنة بالسوق أو محاولة احتيال.</Item>
          </ul>
        </div>

        <div className="card border-emeraldBrand-200 bg-emeraldBrand-50/50 p-6 dark:border-emeraldBrand-500/30 dark:bg-emeraldBrand-500/5">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
            <ShieldCheck size={18} className="text-emeraldBrand-600" /> قواعد الأمان
          </h2>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-navy-700 dark:text-navy-100">
            <Item>عاين على الطبيعة قبل أي دفعة، ولا ترسل عربوناً لشخص لم تلتقِ به.</Item>
            <Item>تحقّق من الأوراق الرسمية (طابو / حكم محكمة / أوراق المركبة) بنفسك أو عبر مختص.</Item>
            <Item>اتفق على مكان عام وآمن لإتمام المقابلة، واصطحب شخصاً معك.</Item>
            <Item>بديل منصة عرض فقط: لا تتقاضى عمولة، ولا تتدخل في الدفع أو نقل الملكية.</Item>
            <Item>أبلغ عن أي إعلان مشبوه ليتم رفعه فوراً من المنصة.</Item>
          </ul>
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section className="container-page mt-10">
        <h2 className="mb-4 text-lg font-extrabold text-navy-900 dark:text-white">أسئلة شائعة</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {[
            {
              q: "هل الإضافة مجانية؟",
              a: "نعم، إضافة الإعلانات مجانية بالكامل ولا تُطلب أي عمولة على البيع أو التأجير. توجد إعلانات «مميّزة» تمنح ظهوراً أعلى في الصفحة الرئيسية.",
            },
            {
              q: "كم تستغرق المراجعة؟",
              a: "عادةً أقل من 12 ساعة. يظهر الإعلان في لوحة التحكم بحالة «قيد المراجعة» حتى تتم الموافقة عليه.",
            },
            {
              q: "لماذا لا يظهر إعلاني للجمهور؟",
              a: "لأن سياسة بديل هي الموافقة المسبقة: لا يُنشر أي إعلان قبل مراجعته من فريق الإدارة للتأكد من صحة البيانات ومنع التكرار والاحتيال.",
            },
            {
              q: "كيف يحدَّث سعر الصرف؟",
              a: "يُحدَّد سعر الصرف من لوحة التحكم، ويُعاد حساب كل الأسعار المعروضة فوراً بالعملتين. الأسعار الأصلية محفوظة بعملة الإدخال نفسها.",
            },
            {
              q: "هل تنشرون إعلانات المدن الأخرى؟",
              a: "الانطلاق من منبج. البنية جاهزة لإضافة أي مدينة (وأولها حلب وأحياؤها) من لوحة التحكم مباشرة.",
            },
            {
              q: "كيف أضيف هاتفاً للبيع؟",
              a: "اختر تصنيف «هواتف مستعملة وجديدة»، ثم اضغط أيقونة الماركة (آيفون، سامسونغ، شاومي...) واختر الموديل من قائمتها، وحدّد الحالة وسعة التخزين والسعر. السوق يمكن فرزه بنفس أيقونات الماركات، ويصلك المشترون مباشرة على واتساب أو الهاتف.",
            },
            {
              q: "هل يمكن تعديل إعلاني بعد النشر؟",
              a: "تواصل مع فريق الدعم عبر واتساب مع رقم الإعلان، وسنقوم بالتعديل أو إغلاق الإعلان (تم البيع/التأجير) نيابةً عنك.",
            },
          ].map((f) => (
            <details key={f.q} className="card group p-4">
              <summary className="cursor-pointer list-none text-[13.5px] font-extrabold text-navy-900 marker:hidden dark:text-white">
                <span className="ms-1 inline-flex items-center gap-2">
                  <Sparkles size={14} className="text-amberBrand-500" />
                  {f.q}
                </span>
              </summary>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* دعوة للعمل */}
      <section className="container-page mt-10">
        <div className="card flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emeraldBrand-50 text-emeraldBrand-600 dark:bg-emeraldBrand-500/10">
            <BadgeCheck size={26} />
          </span>
          <h2 className="text-xl font-extrabold text-navy-900 dark:text-white">
            جاهز للنشر؟ إعلانك على بُعد دقيقتين
          </h2>
          <p className="max-w-xl text-[13px] leading-relaxed text-navy-500 dark:text-navy-300">
            أضف إعلانك مجاناً، أو تواصل مع فريق بديل لأي استفسار. وللاطلاع على السياسات الإدارية
            يمكنك فتح لوحة التحكم للتجربة.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/post-ad" className="btn-amber px-6 py-3">
              <PlusCircle size={17} /> أضف إعلانك
            </Link>
            <a href={tel} className="btn-ghost px-6 py-3">
              <Phone size={17} /> اتصل بالدعم
            </a>
            <Link href="/admin" className="btn-primary px-6 py-3">
              <Users size={17} /> لوحة التحكم
            </Link>
          </div>
        </div>
      </section>

      <p className="container-page mt-6 text-center text-[11.5px] text-navy-400">
        <CheckCircle2 size={12} className="mx-1 inline text-emeraldBrand-500" />
        كل ما تقرأه هنا مُطبَّق فعلياً في هذه النسخة التجريبية: جرّب إضافة إعلان ثم وافِق عليه من لوحة
        التحكم.
        <Trash2 size={0} className="hidden" />
      </p>
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emeraldBrand-500" />
      <span>{children}</span>
    </li>
  );
}
