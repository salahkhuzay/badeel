"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Clock3,
  History,
  Info,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Table2,
  User,
} from "lucide-react";
import { DEMO_CREDENTIALS, useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import Logo from "@/components/Logo";
import AdminStats from "@/components/admin/AdminStats";
import ModerationQueue from "@/components/admin/ModerationQueue";
import AdsTable from "@/components/admin/AdsTable";
import GeographyManager from "@/components/admin/GeographyManager";
import SettingsPanel from "@/components/admin/SettingsPanel";
import AuditLog from "@/components/admin/AuditLog";
import { cn } from "@/lib/currency";

type Tab = "overview" | "moderation" | "ads" | "geo" | "settings" | "audit";

export default function AdminPage() {
  const { adminUser, login, logout, pendingAds, resetDemo } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("overview");

  /* ------------------------------ شاشة الدخول ------------------------------ */
  if (!adminUser) return <LoginScreen onLogin={login} />;

  const TABS: { id: Tab; name: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", name: "نظرة عامة", icon: <BarChart3 size={16} /> },
    { id: "moderation", name: "قيد المراجعة", icon: <ListChecks size={16} />, badge: pendingAds.length },
    { id: "ads", name: "إدارة الإعلانات", icon: <Table2 size={16} /> },
    { id: "geo", name: "الأحياء والمدن", icon: <Map size={16} /> },
    { id: "settings", name: "الإعدادات", icon: <SettingsIcon size={16} /> },
    { id: "audit", name: "سجل العمليات", icon: <History size={16} /> },
  ];

  return (
    <div className="container-page py-6">
      {/* الرأس */}
      <div className="card mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-amberBrand-400 dark:bg-white dark:text-navy-900">
            <LayoutDashboard size={22} />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-navy-900 dark:text-white sm:text-xl">
              لوحة التحكم الإدارية
            </h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-navy-500 dark:text-navy-300">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emeraldBrand-500" /> الموافقة المسبقة مُفعّلة
                — لا نشر قبل المراجعة
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User size={13} /> مُسجَّل الدخول: {adminUser}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/post-ad" className="btn-ghost btn-sm">
            <Sparkles size={14} /> إضافة إعلان تجريبي
          </Link>
          <button
            onClick={() => {
              if (confirm("إعادة تعيين البيانات التجريبية بالكامل؟")) {
                resetDemo();
                toast({ type: "info", title: "تمت إعادة تعيين البيانات" });
              }
            }}
            className="btn-ghost btn-sm"
          >
            <RotateCcw size={14} /> إعادة تعيين
          </button>
          <button
            onClick={() => {
              logout();
              toast({ type: "info", title: "تم تسجيل الخروج" });
            }}
            className="btn btn-sm bg-rose-600 text-white hover:bg-rose-700"
          >
            <LogOut size={14} /> خروج
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* القائمة الجانبية */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="card flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition",
                  tab === t.id
                    ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900"
                    : "text-navy-600 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
                )}
              >
                {t.icon}
                <span className="whitespace-nowrap">{t.name}</span>
                {t.badge! > 0 && (
                  <span
                    className={cn(
                      "ms-auto badge",
                      tab === t.id
                        ? "bg-amberBrand-500 text-navy-900"
                        : "bg-amberBrand-100 text-amberBrand-700 dark:bg-amberBrand-500/20 dark:text-amberBrand-400"
                    )}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="card mt-4 hidden p-4 lg:block">
            <h4 className="flex items-center gap-2 text-[12.5px] font-extrabold text-navy-900 dark:text-white">
              <Info size={14} className="text-amberBrand-500" /> مسار النشر
            </h4>
            <ol className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-navy-500 dark:text-navy-300">
              <li className="flex gap-2">
                <span className="font-bold text-amberBrand-600">1.</span> المستخدم يُرسل الإعلان
                (pending).
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amberBrand-600">2.</span> يراجع الأدمن التفاصيل
                والصور.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amberBrand-600">3.</span> موافقة → يُنشر في الواجهة
                العامة فوراً.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amberBrand-600">4.</span> بعد البيع → تعليم الإعلان
                كمُباع.
              </li>
            </ol>
          </div>
        </aside>

        {/* المحتوى */}
        <section className="min-w-0">
          {tab === "overview" && <AdminStats onGoPending={() => setTab("moderation")} />}

          {tab === "moderation" && (
            <>
              <SectionTitle
                icon={<ListChecks size={18} className="text-amberBrand-500" />}
                title="طابور المراجعة (الموافقة المسبقة)"
                desc="الإعلانات الجديدة لا تظهر للجمهور قبل موافقتك. راجع التفاصيل ثم وافق أو ارفض مع ذكر السبب."
              />
              <ModerationQueue />
            </>
          )}

          {tab === "ads" && (
            <>
              <SectionTitle
                icon={<Table2 size={18} className="text-navy-600 dark:text-navy-200" />}
                title="إدارة جميع الإعلانات"
                desc="موافقة، رفض، تعليم كمُباع أو مؤجَّر، تمييز، وإعادة النشر — بضغطة واحدة."
              />
              <AdsTable />
            </>
          )}

          {tab === "geo" && (
            <>
              <SectionTitle
                icon={<Map size={18} className="text-emeraldBrand-500" />}
                title="إدارة الجغرافيا المحلية والتوسّع الإقليمي"
                desc="أضف أحياء وقرى منبج الجديدة، أو فعّل مدينة حلب وأضف أحياءها — كل ذلك من هنا."
              />
              <GeographyManager />
            </>
          )}

          {tab === "settings" && (
            <>
              <SectionTitle
                icon={<SettingsIcon size={18} className="text-amberBrand-500" />}
                title="إعدادات المنصة"
                desc="سعر الصرف، بيانات التواصل، وإعادة تعيين البيانات التجريبية."
              />
              <SettingsPanel />
            </>
          )}

          {tab === "audit" && (
            <>
              <SectionTitle
                icon={<History size={18} className="text-navy-600 dark:text-navy-200" />}
                title="سجل العمليات الإدارية"
                desc="تتبّع كامل لكل إجراء إداري مع الرقم المرجعي والوقت."
              />
              <AuditLog />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900 dark:text-white">
        {icon}
        {title}
      </h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">{desc}</p>
    </div>
  );
}

/* ------------------------------- شاشة الدخول ------------------------------- */
function LoginScreen({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const toast = useToast();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(user, pass);
    if (!ok) {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
      toast({ type: "error", title: "فشل تسجيل الدخول", desc: "تحقّق من البيانات التجريبية أدناه." });
    } else {
      toast({ type: "success", title: "مرحباً بك في لوحة تحكم بديل" });
    }
  };

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={54} showText={false} />
          <h1 className="mt-4 text-xl font-extrabold text-navy-900 dark:text-white">
            لوحة التحكم الإدارية
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">
            الدخول مخصّص لفريق إدارة منصة بديل لمراجعة الإعلانات وإدارة الأحياء والإعدادات.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">اسم المستخدم</label>
            <div className="relative">
              <User
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
              />
              <input
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  setError("");
                }}
                className="input pr-9"
                placeholder="admin"
                autoComplete="username"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError("");
              }}
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
              dir="ltr"
            />
            {error && <p className="error-text">{error}</p>}
          </div>

          <button type="submit" className="btn-amber w-full justify-center py-3">
            <ShieldCheck size={17} /> دخول لوحة التحكم
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-dashed border-amberBrand-300 bg-amberBrand-50/70 p-3.5 dark:border-amberBrand-500/40 dark:bg-amberBrand-500/10">
          <p className="flex items-center gap-2 text-[12px] font-extrabold text-navy-800 dark:text-navy-100">
            <Clock3 size={14} className="text-amberBrand-600" /> بيانات الدخول التجريبية
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-lg bg-white/80 p-2 dark:bg-navy-900/70">
              <span className="text-navy-400">اسم المستخدم</span>
              <p className="font-extrabold text-navy-800 dark:text-navy-50" dir="ltr">
                {DEMO_CREDENTIALS.user}
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-2 dark:bg-navy-900/70">
              <span className="text-navy-400">كلمة المرور</span>
              <p className="font-extrabold text-navy-800 dark:text-navy-50" dir="ltr">
                {DEMO_CREDENTIALS.pass}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUser(DEMO_CREDENTIALS.user);
              setPass(DEMO_CREDENTIALS.pass);
              setError("");
            }}
            className="btn-ghost btn-sm mt-3 w-full justify-center"
          >
            تعبئة البيانات تلقائياً
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-navy-500 dark:text-navy-300">
            هذه بيانات عرض تجريبي — في الإنتاج تُستبدل بمصادقة آمنة (JWT/Session + أدوار وصلاحيات).
          </p>
        </div>

        <p className="mt-5 text-center text-[11.5px] text-navy-400">
          <Link href="/" className="link">
            العودة إلى الواجهة العامة
          </Link>
        </p>
      </div>
    </div>
  );
}
