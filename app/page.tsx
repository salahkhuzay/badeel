"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Car,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  LayoutGrid,
  MapPin,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import AdCard from "@/components/AdCard";
import Price from "@/components/Price";
import { compactMoney } from "@/lib/currency";
import { MAIN_CATEGORIES, PROPERTY_TYPES, VEHICLE_TYPES, dealTypeName } from "@/lib/taxonomy";
import type { MainCategory } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { publicAds, featuredAds, cities, settings, currency, districtName, cityById } = useStore();
  const manbij = cities.find((c) => c.id === "manbij");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<MainCategory | "all">("all");
  const [district, setDistrict] = useState("all");
  const [tab, setTab] = useState<MainCategory | "all">("all");

  const activeAds = useMemo(
    () =>
      [...publicAds]
        .filter((a) => a.status === "active")
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime()
        ),
    [publicAds]
  );

  const listings = useMemo(
    () => (tab === "all" ? activeAds : activeAds.filter((a) => a.category === tab)).slice(0, 8),
    [activeAds, tab]
  );

  const stats = useMemo(() => {
    const re = publicAds.filter((a) => a.category === "real-estate").length;
    const ve = publicAds.filter((a) => a.category === "vehicles").length;
    return {
      total: publicAds.length,
      re,
      ve,
      neighbors: manbij?.districts.length ?? 0,
      views: publicAds.reduce((s, a) => s + a.views, 0),
    };
  }, [publicAds, manbij]);

  // متوسط سعر الشقق للبيع (مؤشر سوق محلي مميز)
  const marketIndex = useMemo(() => {
    const apartments = publicAds.filter(
      (a) => a.propertyType === "apartment" && a.dealType === "sale" && a.areaSize
    );
    const avgPerMeter = apartments.length
      ? Math.round(
          apartments.reduce((s, a) => s + a.priceUsd / (a.areaSize || 1), 0) / apartments.length
        )
      : 0;
    const cars = publicAds.filter((a) => a.category === "vehicles" && a.vehicleType === "passenger");
    const avgCar = cars.length
      ? Math.round(cars.reduce((s, a) => s + a.priceUsd, 0) / cars.length)
      : 0;
    return { avgPerMeter, avgCar, usdToSyp: settings.usdToSyp };
  }, [publicAds, settings.usdToSyp]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat !== "all") params.set("category", cat);
    if (district !== "all") params.set("district", district);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="pb-4">
      {/* ============================== البطل ============================== */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #F59E0B 0, transparent 45%), radial-gradient(circle at 85% 30%, #059669 0, transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="container-page relative py-12 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div className="animate-fade-up">
              <span className="chip bg-amberBrand-500/15 text-amberBrand-400 ring-1 ring-amberBrand-500/30">
                <MapPin size={13} />
                منبج — محافظة حلب
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[42px]">
                بديل — <span className="text-amberBrand-400">خيارك الأفضل</span> للبيع والشراء في منبج
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-200 sm:text-base">
                سوق محلي متخصص بالعقارات والسيارات: شقق، منازل عربية، أراضٍ، محلات، سياحي، شاحنات
                وآليات. كل الأسعار بالدولار والليرة السورية، وكل إعلان يُراجع قبل النشر.
              </p>

              {/* البحث */}
              <form
                onSubmit={onSearch}
                className="mt-6 rounded-2xl border border-white/10 bg-white/95 p-2.5 shadow-pop backdrop-blur dark:bg-navy-900/95"
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                    />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="ابحث: شقة، أرض، كيا، منزل عربي، سيارة..."
                      className="input border-transparent bg-navy-50 pr-10 dark:bg-navy-800"
                      aria-label="بحث"
                    />
                  </div>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value as MainCategory | "all")}
                    className="select border-transparent bg-navy-50 sm:w-40 dark:bg-navy-800"
                    aria-label="التصنيف"
                  >
                    <option value="all">كل التصنيفات</option>
                    {MAIN_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="select border-transparent bg-navy-50 sm:w-48 dark:bg-navy-800"
                    aria-label="الحي"
                  >
                    <option value="all">كل الأحياء والريف</option>
                    {manbij?.districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn-amber shrink-0 px-5">
                    <Search size={16} /> ابحث
                  </button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-navy-300">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emeraldBrand-400" /> إعلانات مُراجَعة يدوياً
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleDollarSign size={14} className="text-amberBrand-400" /> الأسعار بالدولار
                  والليرة
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} className="text-navy-200" /> تواصل مباشر بدون وسيط
                </span>
              </div>
            </div>

            {/* مؤشر السوق المحلي */}
            <div className="animate-scale-in rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-extrabold">
                  <TrendingUp size={16} className="text-emeraldBrand-400" />
                  مؤشر سوق منبج
                </h3>
                <span className="badge bg-emeraldBrand-500/15 text-emeraldBrand-400">
                  <Clock3 size={11} /> مباشر
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <Metric label="إعلان منشور" value={String(stats.total)} />
                <Metric label="إعلان مميّز" value={String(featuredAds.length)} />
                <Metric label="عقارات" value={String(stats.re)} icon={<Building2 size={13} />} />
                <Metric label="مركبات" value={String(stats.ve)} icon={<Car size={13} />} />
                <div className="col-span-2 rounded-xl border border-white/10 bg-navy-950/40 p-3">
                  <p className="text-[11px] text-navy-300">متوسط سعر المتر (شقق للبيع)</p>
                  <p className="mt-1 text-lg font-extrabold text-white">
                    {marketIndex.avgPerMeter ? `$ ${marketIndex.avgPerMeter} / م²` : "—"}
                  </p>
                  <p className="text-[11px] text-navy-300">
                    {marketIndex.avgPerMeter
                      ? `≈ ${compactMoney(marketIndex.avgPerMeter * settings.usdToSyp, "SYP")} للمتر`
                      : "لا توجد بيانات كافية"}
                  </p>
                </div>
                <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-navy-950/40 p-3">
                  <div>
                    <p className="text-[11px] text-navy-300">سعر الصرف المعتمد اليوم</p>
                    <p className="mt-0.5 text-sm font-extrabold">
                      1 $ = {settings.usdToSyp.toLocaleString("en-US")} ل.س
                    </p>
                  </div>
                  <CircleDollarSign size={26} className="text-amberBrand-400" />
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-navy-300">
                الأسعار تُخزَّن وتُعرض بالعملتين معاً، ويمكن تبديل عملة العرض من الشريط العلوي في أي
                وقت.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= التصنيفات السريعة ========================= */}
      <section className="container-page -mt-6 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {MAIN_CATEGORIES.map((c) => {
            const count = publicAds.filter((a) => a.category === c.id).length;
            const Icon = c.id === "real-estate" ? Building2 : Car;
            const tone =
              c.id === "real-estate"
                ? "from-emeraldBrand-500 to-emeraldBrand-700"
                : "from-amberBrand-500 to-amberBrand-700";
            return (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="card card-hover group flex items-center gap-4 p-5"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-sm`}
                >
                  <Icon size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-navy-900 dark:text-white">{c.name}</h3>
                  <p className="mt-0.5 line-clamp-1 text-[12.5px] text-navy-500 dark:text-navy-300">
                    {c.tagline}
                  </p>
                  <span className="mt-1 inline-block text-[11px] font-bold text-amberBrand-600 dark:text-amberBrand-400">
                    {count} إعلان متاح
                  </span>
                </div>
                <ChevronLeft
                  size={20}
                  className="shrink-0 text-navy-300 transition group-hover:-translate-x-1 group-hover:text-amberBrand-500"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================== الإعلانات المميزة ========================== */}
      {featuredAds.length > 0 && (
        <section className="container-page mt-12">
          <SectionHead
            icon={<Sparkles size={18} className="text-amberBrand-500" />}
            title="إعلانات مميزة"
            subtitle="أفضل الفرص المختارة من فريق بديل"
            href="/search?featured=1"
          />
          <div className="grid-ads">
            {featuredAds.slice(0, 4).map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </section>
      )}

      {/* ============================ أحدث الإعلانات ============================ */}
      <section className="container-page mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900 dark:text-white sm:text-xl">
              <Clock3 size={19} className="text-amberBrand-500" />
              أحدث الإعلانات المعتمدة
            </h2>
            <p className="mt-1 text-[12.5px] text-navy-500 dark:text-navy-300">
              إعلانات راجعها فريق بديل ونشرها — {activeAds.length} إعلاناً نشطاً
            </p>
          </div>
          <div className="flex rounded-xl bg-navy-100/80 p-1 dark:bg-navy-800">
            {[
              { id: "all" as const, label: "الكل", icon: LayoutGrid },
              { id: "real-estate" as const, label: "عقارات", icon: Building2 },
              { id: "vehicles" as const, label: "مركبات", icon: Car },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    tab === t.id
                      ? "bg-white text-navy-900 shadow-sm dark:bg-navy-900 dark:text-white"
                      : "text-navy-500 hover:text-navy-900 dark:text-navy-300"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid-ads">
          {listings.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Link href="/search" className="btn-ghost px-6">
            عرض جميع الإعلانات <ArrowLeft size={16} />
          </Link>
        </div>
      </section>

      {/* ============================ الأحياء والريف ============================ */}
      <section className="container-page mt-14">
        <SectionHead
          icon={<MapPin size={18} className="text-emeraldBrand-500" />}
          title="تصفّح حسب الحي والريف"
          subtitle="11 منطقة تغطي منبج وريفها الغربي والشرقي"
        />
        <div className="flex flex-wrap gap-2">
          {manbij?.districts.map((d) => {
            const count = publicAds.filter((a) => a.districtId === d.id).length;
            return (
              <Link
                key={d.id}
                href={`/search?district=${d.id}`}
                className="group flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-3.5 py-2 text-[13px] font-semibold text-navy-700 shadow-sm transition hover:border-amberBrand-400 hover:text-amberBrand-600 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-100"
              >
                <MapPin size={13} className="text-navy-300 group-hover:text-amberBrand-500" />
                {d.name}
                <span className="badge bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-300">
                  {count}
                </span>
                {d.kind === "village" && (
                  <span className="text-[10px] font-bold text-emeraldBrand-600">ريف</span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================ كيف يعمل بديل ============================ */}
      <section className="container-page mt-14">
        <SectionHead
          icon={<ShieldCheck size={18} className="text-navy-700 dark:text-navy-100" />}
          title="كيف يعمل بديل؟"
          subtitle="بسيط، آمن، ومجاني — بدون وسطاء"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "1",
              t: "أضف إعلانك",
              d: "املأ النموذج الذكي (عقار أو مركبة) وصور اختيارية — إضافة مجانية بالكامل.",
            },
            {
              n: "2",
              t: "مراجعة إدارية",
              d: "يراجع فريق بديل الإعلان خلال ساعات قليلة للتأكد من صحة البيانات ومطابقة السياسات.",
            },
            {
              n: "3",
              t: "النشر والتواصل",
              d: "بعد الموافقة يُنشر الإعلان ويمكن للمشترين التواصل معك مباشرة عبر واتساب أو الاتصال.",
            },
            {
              n: "4",
              t: "إغلاق الإعلان",
              d: "بعد البيع أو التأجير نحدّث حالة الإعلان إلى (تم البيع/تم التأجير) لتبقى المنصة نظيفة.",
            },
          ].map((s) => (
            <div key={s.n} className="card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-sm font-extrabold text-amberBrand-400 dark:bg-white dark:text-navy-900">
                {s.n}
              </span>
              <h4 className="mt-3 text-sm font-extrabold text-navy-900 dark:text-white">{s.t}</h4>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================== أكثر الأحياء نشاطاً + أنواع ====================== */}
      <section className="container-page mt-14 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-navy-900 dark:text-white">
            <Building2 size={16} className="text-emeraldBrand-500" /> أنواع العقارات
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((p) => {
              const count = publicAds.filter((a) => a.propertyType === p.id).length;
              return (
                <Link
                  key={p.id}
                  href={`/category/real-estate?type=${p.id}`}
                  className="rounded-lg border border-navy-100 px-3 py-1.5 text-[12.5px] font-semibold text-navy-600 transition hover:border-emeraldBrand-400 hover:text-emeraldBrand-600 dark:border-navy-800 dark:text-navy-200"
                >
                  {p.name} <span className="text-navy-400">({count})</span>
                </Link>
              );
            })}
          </div>
          <div className="divider my-4" />
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-navy-900 dark:text-white">
            <Car size={16} className="text-amberBrand-500" /> أنواع المركبات
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {VEHICLE_TYPES.map((v) => {
              const count = publicAds.filter((a) => a.vehicleType === v.id).length;
              return (
                <Link
                  key={v.id}
                  href={`/category/vehicles?type=${v.id}`}
                  className="rounded-lg border border-navy-100 px-3 py-1.5 text-[12.5px] font-semibold text-navy-600 transition hover:border-amberBrand-400 hover:text-amberBrand-600 dark:border-navy-800 dark:text-navy-200"
                >
                  {v.name} <span className="text-navy-400">({count})</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-navy-900 dark:text-white">
            <TrendingUp size={16} className="text-amberBrand-500" /> أحدث الفرص السكنية للبيع
          </h3>
          <ul className="mt-3 divide-y divide-navy-100 dark:divide-navy-800">
            {[...publicAds]
              .filter(
                (a) =>
                  a.category === "real-estate" &&
                  (a.dealType === "sale" || !a.dealType) &&
                  a.status === "active"
              )
              .slice(0, 5)
              .map((ad) => (
                <li key={ad.id}>
                  <Link
                    href={`/ad/${ad.ref}`}
                    className="group flex items-center gap-3 py-3 transition hover:bg-navy-50/60 dark:hover:bg-navy-800/40"
                  >
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy-100 dark:bg-navy-800">
                      {ad.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 size={18} className="text-navy-400" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-navy-800 group-hover:text-amberBrand-600 dark:text-navy-50">
                        {ad.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-navy-400">
                        {districtName(ad.cityId, ad.districtId)} · {ad.areaSize}{" "}
                        {ad.areaUnit === "donum" ? "دونم" : "م²"} ·{" "}
                        {dealTypeName(ad.dealType) || "بيع"}
                      </span>
                    </span>
                    <Price priceUsd={ad.priceUsd} priceSyp={ad.priceSyp} size="sm" showBoth={false} />
                  </Link>
                </li>
              ))}
          </ul>
          <div className="divider my-3" />
          <p className="text-[11.5px] leading-relaxed text-navy-400">
            العملة الحالية للعرض:{" "}
            <span className="font-bold text-navy-600 dark:text-navy-200">
              {currency === "USD" ? "الدولار الأمريكي" : "الليرة السورية"}
            </span>{" "}
            — بدّلها من الشريط العلوي، وستُحدَّث كل الأسعار في المنصة فوراً.
          </p>
        </div>
      </section>

      {/* ============================== دعوة للعمل ============================== */}
      <section className="container-page mt-14">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 90% 10%, #F59E0B 0, transparent 40%), radial-gradient(circle at 10% 90%, #059669 0, transparent 40%)",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                عندك شقة أو سيارة للبيع؟ <span className="text-amberBrand-400">أضفها مجاناً</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-200">
                أضف إعلانك في دقيقتين، وسيظهر لآلاف الباحثين في منبج وريفها بعد موافقة فريق المراجعة.
                لا نطلب أي عمولة على البيع.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/post-ad" className="btn-amber px-6 py-3 text-base">
                <PlusCircle size={18} /> أضف إعلانك الآن
              </Link>
              <Link
                href="/how-it-works"
                className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10"
              >
                تعرّف على السياسات
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-950/40 p-3">
      <dt className="flex items-center gap-1.5 text-[11px] text-navy-300">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-lg font-extrabold text-white">{value}</dd>
    </div>
  );
}

function SectionHead({
  icon,
  title,
  subtitle,
  href,
  hrefLabel = "عرض الكل",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900 dark:text-white sm:text-xl">
          {icon}
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[12.5px] text-navy-500 dark:text-navy-300">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-amberBrand-600 hover:underline dark:text-amberBrand-400"
        >
          {hrefLabel} <ArrowLeft size={14} />
        </Link>
      )}
    </div>
  );
}
