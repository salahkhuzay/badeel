"use client";

import React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  Eye,
  ShieldX,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { computeStats } from "@/lib/filters";
import { formatNumber } from "@/lib/currency";
import { categoryIcon } from "@/components/CategoryIcon";
import { themeOf } from "@/lib/theme";

/** بطاقات الإحصاءات + توزيع التصنيفات + أكثر الأحياء + آخر 7 أيام */
export default function AdminStats({ onGoPending }: { onGoPending?: () => void }) {
  const { ads, publicAds } = useStore();
  const s = computeStats(ads);

  /* أكثر ماركات السيارات والهواتف تواجداً في الإعلانات */
  const topBrands = (() => {
    const m: Record<string, { name: string; count: number; category: "vehicles" | "phones" }> = {};
    publicAds.forEach((a) => {
      if (a.category !== "vehicles" && a.category !== "phones") return;
      const key = `${a.category}:${a.brandId ?? "other"}`;
      const name = a.make || "أخرى";
      if (!m[key]) m[key] = { name, count: 0, category: a.category };
      m[key].count += 1;
    });
    return Object.entries(m)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  })();
  const maxBrand = Math.max(1, ...topBrands.map((b) => b.count));

  const barTone: Record<string, string> = {
    "real-estate": "bg-emeraldBrand-500",
    vehicles: "bg-amberBrand-500",
    furniture: "bg-rose-500",
    appliances: "bg-sky-500",
    clothing: "bg-violet-500",
    jobs: "bg-navy-600",
  };

  const maxDay = Math.max(1, ...s.byDay.map((d) => d.count));
  const totalCat = Math.max(1, s.byCategory.reduce((a, c) => a + c.count, 0));

  return (
    <div className="space-y-4">
      {/* البطاقات */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Building2 size={18} />}
          label="إجمالي الإعلانات"
          value={s.total}
          sub={`${s.active} منشور · ${s.soldOrRented} مُغلق`}
          tone="navy"
        />
        <StatCard
          icon={<Clock3 size={18} />}
          label="بانتظار المراجعة"
          value={s.pending}
          sub={s.pending ? "تحتاج إجراءً الآن" : "لا يوجد معلّق"}
          tone="amber"
          highlight={s.pending > 0}
          onClick={onGoPending}
        />
        <StatCard
          icon={<XCircle size={18} />}
          label="إعلانات مرفوضة"
          value={s.rejected}
          sub="مع تسجيل السبب"
          tone="rose"
        />
        <StatCard
          icon={<Eye size={18} />}
          label="إجمالي المشاهدات"
          value={s.totalViews}
          sub={`${s.featured} إعلان مميّز`}
          tone="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* توزيع التصنيفات */}
        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-[13.5px] font-extrabold text-navy-900 dark:text-white">
            <Building2 size={16} className="text-emeraldBrand-500" /> توزيع الإعلانات حسب التصنيف
          </h3>
          <div className="mt-4 space-y-3">
            {s.byCategory.map((c) => {
              const pct = Math.round((c.count / totalCat) * 100);
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="inline-flex items-center gap-1.5 font-bold text-navy-700 dark:text-navy-100">
                      <span className={themeOf(c.id).text}>{categoryIcon(c.id, 13)}</span>
                      {c.name}
                    </span>
                    <span className="font-bold text-navy-500">
                      {c.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                    <div
                      className={`h-full rounded-full ${barTone[c.id] ?? "bg-navy-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="divider my-4" />
          <div className="grid grid-cols-2 gap-2 text-center">
            <MiniStat icon={<Sparkles size={13} />} label="مميّزة" value={s.featured} />
            <MiniStat icon={<BadgeCheck size={13} />} label="نشطة" value={s.active} />
            <MiniStat icon={<CheckCircle2 size={13} />} label="تم البيع/التأجير" value={s.soldOrRented} />
            <MiniStat icon={<ShieldX size={13} />} label="مرفوضة" value={s.rejected} />
          </div>
        </div>

        {/* أكثر الماركات */}
        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-[13.5px] font-extrabold text-navy-900 dark:text-white">
            <TrendingUp size={16} className="text-amberBrand-500" /> أكثر الماركات في السوق
          </h3>
          <p className="mt-1 text-[11.5px] text-navy-400">
            ماركات السيارات والهواتف الأكثر عرضاً — مفيد لمعرفة ما يبحث عنه السوق
          </p>
          <ul className="mt-4 space-y-2.5">
            {topBrands.map((b) => (
              <li key={b.id}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <Link
                    href={`/category/${b.category}?subtype=${b.id.split(":")[1]}`}
                    className="font-bold text-navy-700 hover:text-amberBrand-600 dark:text-navy-100"
                  >
                    {b.name}
                    <span className="ms-1 text-[10px] font-semibold text-navy-400">
                      ({b.category === "vehicles" ? "سيارات" : "هواتف"})
                    </span>
                  </Link>
                  <span className="font-bold text-navy-500">{b.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-amberBrand-500 to-amberBrand-400"
                    style={{ width: `${(b.count / maxBrand) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {topBrands.length === 0 && (
              <li className="text-[12px] text-navy-400">لا توجد بيانات بعد.</li>
            )}
          </ul>
        </div>

        {/* آخر 7 أيام */}
        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-[13.5px] font-extrabold text-navy-900 dark:text-white">
            <Clock3 size={16} className="text-navy-500" /> الإعلانات المضافة (آخر 7 أيام)
          </h3>
          <div className="mt-6 flex h-40 items-end justify-between gap-2">
            {s.byDay.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-navy-500">{d.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-navy-900 to-navy-700 dark:from-amberBrand-600 dark:to-amberBrand-400"
                  style={{ height: `${Math.max(6, (d.count / maxDay) * 110)}px` }}
                  title={`${d.label}: ${d.count} إعلان`}
                />
                <span className="text-[10.5px] font-semibold text-navy-400">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-navy-400">
            إجمالي الإعلانات المضافة هذا الأسبوع:{" "}
            <span className="font-bold text-navy-600 dark:text-navy-200">
              {formatNumber(s.byDay.reduce((a, d) => a + d.count, 0))}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
  highlight,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tone: "navy" | "amber" | "emerald" | "rose";
  highlight?: boolean;
  onClick?: () => void;
}) {
  const tones = {
    navy: "text-navy-600 bg-navy-50 dark:bg-navy-800 dark:text-navy-100",
    amber: "text-amberBrand-600 bg-amberBrand-50 dark:bg-amberBrand-500/10",
    emerald: "text-emeraldBrand-600 bg-emeraldBrand-50 dark:bg-emeraldBrand-500/10",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
  } as const;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`card flex items-start gap-3 p-4 text-right transition ${
        onClick ? "card-hover cursor-pointer" : "cursor-default"
      } ${highlight ? "ring-2 ring-amberBrand-500/50" : ""}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11.5px] font-semibold text-navy-400">{label}</span>
        <span className="mt-0.5 block text-2xl font-extrabold leading-none text-navy-900 dark:text-white">
          {formatNumber(value)}
        </span>
        {sub && <span className="mt-1 block text-[11px] text-navy-400">{sub}</span>}
      </span>
    </button>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-navy-100 p-2.5 dark:border-navy-800">
      <p className="flex items-center justify-center gap-1 text-[10.5px] font-semibold text-navy-400">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-base font-extrabold text-navy-800 dark:text-navy-50">{value}</p>
    </div>
  );
}
