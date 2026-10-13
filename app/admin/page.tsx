"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  Eye,
  EyeOff,
  Fingerprint,
  History,
  Info,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogOut,
  Map,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Table2,
  Timer,
  User,
  UserCog,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import Logo from "@/components/Logo";
import AdminStats from "@/components/admin/AdminStats";
import ModerationQueue from "@/components/admin/ModerationQueue";
import AdsTable from "@/components/admin/AdsTable";
import CitiesManager from "@/components/admin/CitiesManager";
import SettingsPanel from "@/components/admin/SettingsPanel";
import AuditLog from "@/components/admin/AuditLog";
import { cn, formatNumber } from "@/lib/currency";
import { formatDuration } from "@/lib/auth";

type Tab = "overview" | "moderation" | "ads" | "geo" | "settings" | "audit";

export default function AdminPage() {
  const {
    auth,
    settings,
    pendingAds,
    login,
    logout,
    logoutAll,
    refreshSession,
    sessionMinutesLeft,
    hydrated,
  } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [tick, setTick] = useState(0);

  /* نبضة كل 20 ثانية: تحديث العدّاد وإنهاء الجلسة تلقائياً عند الانتهاء */
  useEffect(() => {
    if (!auth.loggedIn) return;
    const iv = setInterval(() => {
      setTick((t) => t + 1);
      const left = sessionMinutesLeft();
      if (left <= 0) {
        logout();
        toast({
          type: "info",
          title: "انتهت الجلسة تلقائياً",
          desc: "تسجيل الدخول مطلوب مرة أخرى لأسباب أمنية.",
        });
      }
    }, 20000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loggedIn, auth.sessionExpiresAt]);

  const minutesLeft = useMemo(() => sessionMinutesLeft(), [tick, auth.sessionExpiresAt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) {
    return (
      <div className="container-page py-16 text-center text-[13px] text-navy-400">جار التحميل...</div>
    );
  }

  /* ------------------------------ شاشة الدخول ------------------------------ */
  if (!auth.loggedIn) return <LoginScreen />;

  const TABS: { id: Tab; name: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", name: "نظرة عامة", icon: <BarChart3 size={16} /> },
    {
      id: "moderation",
      name: "قيد المراجعة",
      icon: <ListChecks size={16} />,
      badge: pendingAds.length,
    },
    { id: "ads", name: "إدارة الإعلانات", icon: <Table2 size={16} /> },
    { id: "geo", name: "المدن", icon: <Map size={16} /> },
    { id: "settings", name: "الإعدادات والأمان", icon: <SettingsIcon size={16} /> },
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
                <User size={13} /> مُسجَّل الدخول: {settings.adminUsername}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 font-bold",
                  minutesLeft < 5
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                    : "bg-navy-50 text-navy-500 dark:bg-navy-800 dark:text-navy-200"
                )}
                title="تنتهي الجلسة تلقائياً بعد هذه المدة"
              >
                <Timer size={13} /> الجلسة: {formatDuration(minutesLeft * 60000)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => refreshSession()} className="btn-ghost btn-sm" title="تمديد الجلسة">
            <Clock3 size={14} /> تمديد الجلسة
          </button>
          <Link href="/post-ad" className="btn-ghost btn-sm">
            <Sparkles size={14} /> إضافة إعلان
          </Link>
          <button
            onClick={() => {
              if (
                confirm(
                  "تحذير: سيُحذف كل إعلان في المنصة (بما فيها الإعلانات الحقيقية) وتعود الإعدادات إلى حالتها الأولى. لا يمكن التراجع — هل تريد المتابعة؟"
                )
              ) {
                resetDemoSafe();
                toast({ type: "info", title: "تمت إعادة تعيين بيانات المنصة" });
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

      {/* تنبيه تغيير كلمة المرور الافتراضية */}
      {!settings.passwordChanged && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amberBrand-300 bg-amberBrand-50 p-4 dark:border-amberBrand-500/40 dark:bg-amberBrand-500/10">
          <ShieldAlert size={20} className="shrink-0 text-amberBrand-600" />
          <p className="flex-1 text-[12.5px] font-semibold leading-relaxed text-navy-700 dark:text-navy-100">
            أنت تستخدم كلمة المرور الافتراضية. لأمان المنصة غيّرها الآن من تبويب
            <span className="font-extrabold"> «الإعدادات والأمان» ← الأمان </span>
            حتى لا يتمكن أي شخص آخر من الدخول إلى اللوحة.
          </p>
          <button onClick={() => setTab("settings")} className="btn-amber btn-sm">
            <KeyRound size={14} /> تغيير كلمة المرور
          </button>
        </div>
      )}

      {/* minmax(0,1fr) يمنع أي إزاحة أفقية على الجوال مهما اتسع محتوى الأعمدة */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[240px_1fr]">
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
                {Boolean(t.badge) && (
                  <span
                    className={cn(
                      "badge ms-auto",
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
              <li>1. المستخدم يُرسل الإعلان (pending).</li>
              <li>2. يراجع الأدمن التفاصيل والصور.</li>
              <li>3. موافقة → يُنشر في الواجهة العامة فوراً.</li>
              <li>4. بعد البيع/التأجير → تعليم الإعلان كمُباع أو مؤجَّر.</li>
            </ol>
            <div className="divider my-3" />
            <p className="text-[11px] leading-relaxed text-navy-400">
              كل إجراء إداري يُسجَّل في «سجل العمليات» مع الوقت والرقم المرجعي.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm("إبطال جميع الجلسات على كل الأجهزة وإلزام الجميع بتسجيل الدخول؟")) {
                logoutAll();
                toast({
                  type: "success",
                  title: "تم إبطال جميع الجلسات",
                  desc: "أي جهاز آخر سيحتاج كلمة المرور للدخول من جديد.",
                });
              }
            }}
            className="card mt-4 hidden w-full items-center gap-2 p-3 text-[12px] font-bold text-rose-600 transition hover:bg-rose-50 lg:flex dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <Fingerprint size={15} /> خروج من جميع الأجهزة
          </button>
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
                title="إدارة المدن والتوسّع الإقليمي"
                desc="فعّل مدينة لتصبح متاحة للنشر فوراً، أو ألغِ تفعيلها. لا حاجة لقوائم أحياء: الموقع يُوضَّح في وصف الإعلان."
              />
              <CitiesManager />
            </>
          )}

          {tab === "settings" && (
            <>
              <SectionTitle
                icon={<SettingsIcon size={18} className="text-amberBrand-500" />}
                title="الإعدادات والأمان"
                desc="سعر الصرف، بيانات التواصل والدعم، وكلمة مرور اللوحة وإعدادات الجلسة."
              />
              <SettingsPanel />
            </>
          )}

          {tab === "audit" && (
            <>
              <SectionTitle
                icon={<History size={18} className="text-navy-600 dark:text-navy-200" />}
                title="سجل العمليات الإدارية"
                desc="تتبّع كامل لكل إجراء إداري مع الرقم المرجعي والوقت — بما في ذلك محاولات الدخول."
              />
              <AuditLog />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* تعويض بسيط: resetDemo من المخزن */
function resetDemoSafe() {
  try {
    const raw = localStorage.getItem("badeel.state.v1");
    if (raw) localStorage.removeItem("badeel.state.v1");
  } catch {
    /* ignore */
  }
  location.reload();
}

/* ==========================================================================
   شاشة الدخول الآمنة — لا تُعرض كلمة المرور ولا تلميحات في الواجهة
   ========================================================================== */
function LoginScreen() {
  const { login, settings, resetLocalLogin } = useStore();
  const toast = useToast();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    if (!lockedUntil) return;
    const iv = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [lockedUntil]);

  const remaining = lockedUntil ? Math.max(0, lockedUntil - nowTs) : 0;
  const locked = remaining > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await login(user, pass);
      if (res.ok) {
        toast({ type: "success", title: "مرحباً بك في لوحة بديل", desc: "تم تسجيل الدخول بنجاح." });
        setPass("");
        return;
      }
      if (res.reason === "locked") {
        setLockedUntil(Date.now() + res.waitMs);
        setError(`تم قفل الدخول مؤقتاً بعد محاولات فاشلة متكررة.`);
      } else {
        setError(
          res.remaining > 0
            ? `بيانات الدخول غير صحيحة. المحاولات المتبقية: ${res.remaining}`
            : "بيانات الدخول غير صحيحة."
        );
      }
      setPass("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-navy-100 shadow-pop dark:border-navy-800 lg:grid-cols-[1fr_1.05fr]">
        {/* الجانب الأمني */}
        <div className="relative hidden flex-col justify-between bg-navy-900 p-8 text-white lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 15%, #F59E0B 0, transparent 45%), radial-gradient(circle at 85% 80%, #059669 0, transparent 45%)",
            }}
          />
          <div className="relative">
            <Logo size={44} showText tagline={false} />
            <h1 className="mt-6 text-2xl font-extrabold leading-snug">
              لوحة تحكم <span className="text-amberBrand-400">بديل</span>
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-navy-200">
              منطقة محمية. المراجعة والموافقة على الإعلانات، إدارة الأحياء والمدن، الإعدادات
              والأمان — لمدير المنصة فقط.
            </p>

            <ul className="mt-6 space-y-3 text-[12.5px] text-navy-200">
              <li className="flex items-start gap-2">
                <Lock size={15} className="mt-0.5 shrink-0 text-emeraldBrand-400" />
                كلمة المرور محفوظة كبصمة مشفّرة (PBKDF2-SHA256) — لا تُخزَّن كنص صريح إطلاقاً.
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amberBrand-400" />
                قفل مؤقت تلقائي بعد {settings.maxLoginAttempts} محاولات فاشلة لمدة{" "}
                {settings.lockMinutes} دقيقة.
              </li>
              <li className="flex items-start gap-2">
                <Timer size={15} className="mt-0.5 shrink-0 text-navy-200" />
                الجلسة تنتهي تلقائياً بعد {settings.sessionMinutes} دقيقة من عدم النشاط.
              </li>
            </ul>
          </div>

          <p className="relative mt-8 text-[11.5px] leading-relaxed text-navy-300">
            نسيت كلمة المرور؟ تواصل مع مالك المنصة لإعادة التعيين — لا توجد أسئلة أمان ظاهرة ولا
            تلميحات يمكن استغلالها.
          </p>
        </div>

        {/* النموذج */}
        <div className="bg-white p-7 sm:p-9 dark:bg-navy-950">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-amberBrand-400 dark:bg-white dark:text-navy-900">
            <ShieldCheck size={22} />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-navy-900 dark:text-white">دخول المسؤول</h2>
          <p className="mt-1 text-[12.5px] text-navy-500 dark:text-navy-300">
            أدخل اسم المستخدم وكلمة المرور. كل المحاولات مسجَّلة.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">اسم المستخدم</label>
              <div className="relative">
                <UserCog
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                />
                <input
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="input pr-10"
                  placeholder="اسم المستخدم"
                  autoComplete="username"
                  dir="ltr"
                  disabled={locked || busy}
                />
              </div>
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
                />
                <input
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="input px-10"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  dir="ltr"
                  disabled={locked || busy}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-navy-400 transition hover:bg-navy-100 dark:hover:bg-navy-800"
                  aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  tabIndex={-1}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            {locked && (
              <div className="rounded-xl border border-amberBrand-300 bg-amberBrand-50 px-3.5 py-3 dark:border-amberBrand-500/40 dark:bg-amberBrand-500/10">
                <p className="flex items-center gap-2 text-[12.5px] font-extrabold text-amberBrand-700 dark:text-amberBrand-400">
                  <Lock size={14} /> الدخول مقفل مؤقتاً
                </p>
                <p className="mt-1 text-[12px] text-navy-600 dark:text-navy-200">
                  يُفتح تلقائياً بعد:{" "}
                  <span className="font-extrabold tabular-nums" dir="ltr">
                    {formatDuration(remaining)}
                  </span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={locked || busy || !user || !pass}
              className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={17} />
              {busy ? "جار التحقق..." : locked ? "الدخول مقفل" : "تسجيل الدخول"}
            </button>
          </form>

          {/* استرجاع بلا خادم: المنصة لا تملك بريداً ولا خادماً لاستعادة الكلمة،
              لذا الاسترجاع الصحيح الوحيد هو تصفير دخول هذا المتصفح وحده */}
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "إعادة تعيين دخول هذا المتصفح فقط؟\n" +
                    "ستعود كلمة المرور إلى الافتراضية ويُصفّى عدّاد المحاولات والقفل في هذا المتصفح وحده،\n" +
                    "بلا أي أثر على الزوار أو على بقية أجهزتك أو على إعدادات المنصة."
                )
              ) {
                resetLocalLogin();
                toast({
                  type: "info",
                  title: "صُفّر دخول هذا المتصفح",
                  desc: "ادخل الآن باسم المستخدم وكلمة المرور الافتراضيين.",
                });
              }
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-500 transition hover:text-rose-600 dark:text-navy-300 dark:hover:text-rose-400"
          >
            <KeyRound size={13} /> نسيت كلمة المرور؟ صفّر دخول هذا المتصفح
          </button>

          <div className="mt-5 flex items-start gap-2 rounded-xl bg-navy-50/70 p-3 text-[11.5px] leading-relaxed text-navy-500 dark:bg-navy-900 dark:text-navy-300">
            <Info size={14} className="mt-0.5 shrink-0 text-amberBrand-500" />
            <span>
              لأسباب أمنية لا تُعرض بيانات الدخول في هذه الصفحة. مسؤول المنصة يحتفظ بكلمة المرور في
              مكان آمن، ويمكن تغييرها من داخل اللوحة بعد الدخول (الإعدادات ← الأمان).
            </span>
          </div>

          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-500 hover:text-amberBrand-600 dark:text-navy-300"
          >
            <X size={13} /> العودة إلى المنصة
          </Link>
        </div>
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
      <h2 className="flex items-center gap-2 text-base font-extrabold text-navy-900 dark:text-white">
        {icon}
        {title}
      </h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-300">{desc}</p>
    </div>
  );
}
