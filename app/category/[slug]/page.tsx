import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Car } from "lucide-react";
import ListingsBrowser from "@/components/ListingsBrowser";
import CategoryHeader from "@/components/CategoryHeader";
import BrandIcon from "@/components/BrandIcon";
import VehicleBodyIcon from "@/components/VehicleBodyIcon";
import { BRANDS, PHONE_BRANDS } from "@/lib/brands";
import { BODY_TYPES } from "@/lib/vehicleBodies";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";
import type { MainCategory } from "@/lib/types";

export const dynamicParams = false;

const SLUGS: MainCategory[] = [
  "real-estate",
  "vehicles",
  "furniture",
  "appliances",
  "clothing",
  "phones",
  "jobs",
  "other",
];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

const META: Record<MainCategory, { title: string; desc: string }> = {
  "real-estate": {
    title: "عقارات منبج — شقق ومنازل وأراضٍ ومحلات للبيع والإيجار",
    desc: "تصفّح العقارات المعروضة للبيع والإيجار في منبج: شقق سكنية، منازل عربية، أراضٍ للبناء والزراعة، محلات تجارية ومستودعات — بأسعار بالدولار والليرة السورية.",
  },
  vehicles: {
    title: "سيارات ومركبات للبيع والإيجار في منبج — بالماركة وسنة الصنع",
    desc: "سيارات سياحية، شاحنات وبيك أب، دراجات نارية وآليات — فرز حسب الماركة (هيونداي، كيا، تويوتا...) والموديل وسنة الصنع ونمرة التسجيل، مع خيار الإيجار اليومي والشهري.",
  },
  furniture: {
    title: "أثاث منزلي للبيع في منبج — غرف نوم وكنبات وطاولات",
    desc: "أثاث منزلي جديد ومستعمل في منبج: غرف نوم، كنبات وجلسات، طاولات وسفرة، خزائن، أطقم مطبخ ومكاتب — بالتفاوض المباشر مع البائع.",
  },
  appliances: {
    title: "أدوات كهربائية ومنزلية في منبج — ثلاجات وغسالات ومكيفات",
    desc: "أجهزة كهربائية ومنزلية في منبج: ثلاجات، غسالات، مكيفات، تلفزيونات، مولّدات كهرباء وأدوات مطبخ — مع تحديد الحالة والموديل.",
  },
  clothing: {
    title: "ملابس وأزياء في منبج — رجالي ونسائي وأطفال",
    desc: "ملابس وأزياء جديدة ومستعملة في منبج: ملابس رجالية، نسائية، أطفال، أحذية، حقائب وإكسسوارات — بأسعار مناسبة وتواصل مباشر عبر واتساب.",
  },
  phones: {
    title: "هواتف مستعملة وجديدة للبيع في منبج — آيفون وسامسونغ وشاومي",
    desc: "سوق الهواتف في منبج: آيفون، سامسونغ، شاومي، هواوي، أوبو، ريلمي، فيفو، نوكيا وغيرها — جديدة ومستعملة، بفرز حسب الماركة والموديل والحالة وسعة التخزين، وتواصل مباشر عبر واتساب.",
  },
  jobs: {
    title: "وظائف في منبج — عروض وظائف وطلبات عمل",
    desc: "سوق العمل المحلي في منبج: عروض وظائف من أصحاب العمل وطلبات عمل من باحثين — تعليم، صحة، بناء، مطاعم، سائقين، حرفيين وإداريين، مع نوع الدوام ونواتج الخبرة.",
  },
  other: {
    title: "أصناف ومنتجات أخرى للبيع في منبج — بضائع ومقتنيات متنوعة",
    desc: "تصفّح المنتجات والأصناف المتنوعة في منبج: محاصيل، مواشي، عدد وأدوات، مستلزمات، بضائع ومقتنيات أخرى — بتفاوض وتواصل مباشر مع البائع عبر واتساب.",
  },
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = META[params.slug as MainCategory];
  return m
    ? {
        title: m.title,
        description: m.desc,
        /* موجة 23: كل تصنيف يعلن رابطه القانوني — لا يشارك الرئيسية فهرسها */
        alternates: { canonical: `/category/${params.slug}` },
      }
    : { title: "تصنيف غير موجود", robots: { index: false } };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug as MainCategory;
  if (!SLUGS.includes(slug)) notFound();

  return (
    <>
      <CategoryHeader slug={slug} />

      {/* شريط الماركات — يظهر في تصنيف المركبات: كل أيقونة تفتح سوق موديلاتها */}
      {slug === "vehicles" && (
        <div className="border-b border-navy-100 bg-navy-50/60 dark:border-navy-800 dark:bg-navy-900/40">
          <div className="container-page py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[13.5px] font-extrabold text-navy-900 dark:text-white">
                تسوّق حسب ماركة السيارة
                <span className="ms-2 text-[11.5px] font-semibold text-navy-400">
                  اضغط أي ماركة لعرض موديلاتها وسنة صنعها
                </span>
              </h2>
              <Link
                href="/category/vehicles?sort=year-desc"
                className="text-[11.5px] font-bold text-amberBrand-600 hover:underline dark:text-amberBrand-400"
              >
                عرض الكل حسب سنة الصنع ↓
              </Link>
            </div>
            <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
              {BRANDS.filter((b) => b.id !== "other").map((b) => (
                <Link
                  key={b.id}
                  href={`/category/vehicles?brand=${b.id}`}
                  className="flex w-[74px] shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl border-2 border-transparent bg-white p-2 transition hover:border-amberBrand-400 dark:bg-navy-900"
                  title={`${b.name} — ${b.models.length} موديل`}
                >
                  <BrandIcon brandId={b.id} size={36} />
                  <span className="line-clamp-1 text-center text-[10.5px] font-bold text-navy-700 dark:text-navy-100">
                    {b.name}
                  </span>
                </Link>
              ))}
              <Link
                href="/category/vehicles?brand=other"
                className="flex w-[74px] shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 border-transparent bg-white p-2 transition hover:border-amberBrand-400 dark:bg-navy-900"
              >
                <BrandIcon brandId="other" size={36} />
                <span className="text-center text-[10.5px] font-bold text-navy-700 dark:text-navy-100">
                  ماركة أخرى
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* أنواع السيارات بالأيقونات — مدمجة رسمياً داخل تصنيف سيارات ومركبات في منبج */}
      {slug === "vehicles" && (
        <div className="border-b border-navy-100 bg-white py-4 dark:border-navy-800 dark:bg-navy-950">
          <div className="container-page">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[13.5px] font-extrabold text-navy-900 dark:text-white">
                <Car size={16} className="text-amberBrand-500" /> أنواع السيارات بالأيقونات
                <span className="ms-2 text-[11.5px] font-semibold text-navy-400">
                  اختر النوع للتصفح السريع
                </span>
              </h2>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {BODY_TYPES.filter((t) => t.id !== "other").map((t) => (
                <Link
                  key={t.id}
                  href={`/category/vehicles?body=${t.id}`}
                  title={t.hint}
                  className="card group flex flex-col items-center gap-1.5 p-2.5 text-center transition hover:border-amberBrand-400"
                >
                  <span className="text-navy-700 transition group-hover:text-amberBrand-600 dark:text-navy-100">
                    <VehicleBodyIcon type={t.id} size={42} />
                  </span>
                  <span className="text-[11.5px] font-extrabold text-navy-900 dark:text-white">
                    {t.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* شريط ماركات الهواتف — كل أيقونة تفتح سوق موديلاتها */}
      {slug === "phones" && (
        <div className="border-b border-navy-100 bg-indigo-50/50 dark:border-navy-800 dark:bg-indigo-500/5">
          <div className="container-page py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[13.5px] font-extrabold text-navy-900 dark:text-white">
                تسوّق حسب ماركة الهاتف
                <span className="ms-2 text-[11.5px] font-semibold text-navy-400">
                  اضغط أي ماركة لعرض موديلاتها
                </span>
              </h2>
            </div>
            <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
              {PHONE_BRANDS.filter((b) => b.id !== "other-phone").map((b) => (
                <Link
                  key={b.id}
                  href={`/category/phones?subtype=${b.id}`}
                  className="flex w-[74px] shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl border-2 border-transparent bg-white p-2 transition hover:border-indigo-400 dark:bg-navy-900"
                  title={`${b.name} — ${b.models.length} موديل`}
                >
                  <BrandIcon brandId={b.id} size={36} />
                  <span className="line-clamp-1 text-center text-[10.5px] font-bold text-navy-700 dark:text-navy-100">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* شريط مختصر لباقي التصنيفات */}
      <div className="container-page pt-4">
        <div className="flex flex-wrap gap-1.5">
          {MAIN_CATEGORIES.filter((c) => c.id !== slug).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="chip border border-navy-200 font-bold text-navy-600 transition hover:border-amberBrand-400 dark:border-navy-700 dark:text-navy-200"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="container-page pt-6">
        <ListingsBrowser categoryLock={slug} embedded />
      </div>
    </>
  );
}
