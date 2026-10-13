"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  LogOut,
  Save,
  ShieldAlert,
  ShieldCheck,
  Timer,
  UserCog,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { checkPassword, formatDuration } from "@/lib/auth";
import { cn, formatDate } from "@/lib/currency";

/* ==========================================================================
   لوحة الأمان — تغيير كلمة المرور وتقوية الدخول إلى لوحة التحكم
   كل شيء محلي (Mock): البصمة تُخزَّن مشفّرة في حالة المنصة (لفتحها على API لاحقاً)
   ========================================================================== */

const scoreColors = ["bg-rose-500", "bg-rose-400", "bg-amberBrand-500", "bg-lime-500", "bg-emeraldBrand-500"];

export default function SecurityPanel() {
  const { settings, updateSettings, changePassword, logoutAll, auth } = useStore();
  const toast = useToast();

  const [username, setUsername] = useState(settings.adminUsername);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const [sessionMinutes, setSessionMinutes] = useState(String(settings.sessionMinutes));
  const [maxAttempts, setMaxAttempts] = useState(String(settings.maxLoginAttempts));
  const [lockMinutes, setLockMinutes] = useState(String(settings.lockMinutes));

  const check = useMemo(() => checkPassword(next), [next]);
  const mismatch = confirmPw.length > 0 && confirmPw !== next;

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!current) return toast({ type: "error", title: "أدخل كلمة المرور الحالية" });
    if (!check.ok) {
      return toast({
        type: "error",
        title: "كلمة المرور الجديدة ضعيفة",
        desc: check.issues.slice(0, 2).join(" · "),
      });
    }
    if (mismatch) return toast({ type: "error", title: "تأكيد كلمة المرور غير مطابق" });

    setBusy(true);
    const res = await changePassword(current, next);
    setBusy(false);

    if (!res.ok) {
      toast({ type: "error", title: res.error ?? "تعذّر تغيير كلمة المرور" });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirmPw("");
    toast({
      type: "success",
      title: "تم تغيير كلمة المرور",
      desc: "احفظها في مكان آمن. تُخزَّن الآن كبصمة مشفّرة فقط، ولا يمكن استخراجها من الملف.",
    });
  }

  function savePolicy(e: React.FormEvent) {
    e.preventDefault();
    const un = username.trim();
    if (un.includes(" ") || un.includes("\n")) {
      return toast({ type: "error", title: "اسم المستخدم بلا مسافات", desc: "استخدم حروفاً وأرقاماً ورموزاً بلا فراغات." });
    }
    const sm = Number(sessionMinutes);
    const ma = Number(maxAttempts);
    const lm = Number(lockMinutes);
    if (sm < 5 || sm > 240) return toast({ type: "error", title: "مدة الجلسة بين 5 و240 دقيقة" });
    if (ma < 3 || ma > 10) return toast({ type: "error", title: "عدد المحاولات بين 3 و10" });
    if (lm < 1 || lm > 120) return toast({ type: "error", title: "مدة القفل بين دقيقة و120 دقيقة" });

    updateSettings({
      adminUsername: un || "admin",
      sessionMinutes: sm,
      maxLoginAttempts: ma,
      lockMinutes: lm,
    });
    toast({ type: "success", title: "تم حفظ سياسة الأمان", desc: `الجلسة ${sm} دقيقة · القفل ${ma} محاولات / ${lm} دقيقة.` });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ------------------------- تغيير كلمة المرور ------------------------- */}
      <form onSubmit={submitPassword} className="card p-5">
        <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
          <KeyRound size={17} className="text-amberBrand-500" /> تغيير كلمة مرور اللوحة
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
          كلمة المرور لا تُخزَّن كنص صريح: تُحوَّل إلى بصمة PBKDF2-SHA256 بملح خاص ونحو 120 ألف
          تكرار. حتى لو فُتح ملف البيانات، لا يمكن استرجاع كلمة المرور منه.
        </p>

        <div className="divider my-4" />

        <div className="grid gap-3">
          <div>
            <label className="label">كلمة المرور الحالية *</label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type={showPw ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="input pr-9"
                dir="ltr"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div>
            <label className="label">كلمة المرور الجديدة *</label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type={showPw ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="input px-9"
                dir="ltr"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
                tabIndex={-1}
                aria-label={showPw ? "إخفاء" : "إظهار"}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {next.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        i < check.score + 1 ? scoreColors[check.score] : "bg-navy-100 dark:bg-navy-800"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-[11.5px] font-bold text-navy-500 dark:text-navy-300">
                  القوة: {check.label}
                  {check.issues.length > 0 && (
                    <span className="font-semibold text-navy-400">
                      {" "}
                      — ناقص: {check.issues.join("، ")}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="label">تأكيد كلمة المرور الجديدة *</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={cn("input", mismatch && "border-rose-400 focus:border-rose-500")}
              dir="ltr"
              autoComplete="new-password"
            />
            {mismatch && (
              <p className="error-text">
                <AlertTriangle size={12} /> غير مطابقة لكلمة المرور الجديدة
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={busy || !current || !check.ok || mismatch}
          className="btn-amber mt-4 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} /> {busy ? "جار التحقق..." : "حفظ كلمة المرور الجديدة"}
        </button>

        {settings.passwordChanged ? (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emeraldBrand-600 dark:text-emeraldBrand-400">
            <CheckCircle2 size={12} /> تم تغيير كلمة المرور الافتراضية مسبقاً
          </p>
        ) : (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-amberBrand-600 dark:text-amberBrand-400">
            <ShieldAlert size={12} /> لا تزال كلمة المرور الافتراضية قيد الاستخدام
          </p>
        )}
      </form>

      {/* --------------------------- سياسة الدخول --------------------------- */}
      <div className="space-y-4">
        <form onSubmit={savePolicy} className="card p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
            <ShieldCheck size={17} className="text-emeraldBrand-500" /> سياسة الجلسة والقفل
          </h3>
          <p className="mt-1.5 text-[12px] leading-relaxed text-navy-500 dark:text-navy-300">
            اضبط المدة التي تبقى فيها اللوحة مفتوحة، وعدد المحاولات المسموح بها قبل القفل المؤقت.
          </p>

          {/* اسم المستخدم يعيش هنا لأن زر هذا النموذج هو ما يحفظه فعلاً */}
          <div className="mt-4">
            <label className="label">اسم المستخدم للأدمن</label>
            <div className="relative">
              <UserCog size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input pr-9"
                dir="ltr"
                autoComplete="username"
              />
            </div>
            <p className="hint">
              يُستخدم مع كلمة المرور لتسجيل الدخول إلى /admin — يُحفظ بزر «حفظ سياسة الأمان» في
              أسفل هذه البطاقة.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">
                <Timer size={12} className="me-1 inline" /> مدة الجلسة (دقيقة)
              </label>
              <input
                type="number"
                min={5}
                max={240}
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(e.target.value)}
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">
                <AlertTriangle size={12} className="me-1 inline" /> محاولات قبل القفل
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">
                <Lock size={12} className="me-1 inline" /> مدة القفل (دقيقة)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={lockMinutes}
                onChange={(e) => setLockMinutes(e.target.value)}
                className="input"
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-4 w-full justify-center">
            <Save size={16} /> حفظ سياسة الأمان
          </button>
        </form>

        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900 dark:text-white">
            <Fingerprint size={16} className="text-rose-500" /> إبطال الجلسات
          </h3>
          <ul className="mt-3 space-y-2 text-[12.5px] text-navy-500 dark:text-navy-300">
            <li className="flex items-center justify-between gap-3 border-b border-navy-100 pb-2 dark:border-navy-800">
              <span>آخر تسجيل دخول</span>
              <span className="font-bold text-navy-700 dark:text-navy-100">
                {auth.lastLoginAt ? formatDate(auth.lastLoginAt) : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-navy-100 pb-2 dark:border-navy-800">
              <span>تنتهي الجلسة الحالية بعد</span>
              <span className="font-bold text-navy-700 dark:text-navy-100">
                {auth.sessionExpiresAt
                  ? formatDuration(new Date(auth.sessionExpiresAt).getTime() - Date.now())
                  : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span>محاولات دخول فاشلة حالياً</span>
              <span className="font-bold text-navy-700 dark:text-navy-100">
                {auth.failedAttempts} / {settings.maxLoginAttempts}
              </span>
            </li>
          </ul>

          <button
            type="button"
            onClick={() => {
              if (confirm("إبطال جميع الجلسات؟ سيتم تسجيل الخروج من هذا الجهاز أيضاً.")) {
                logoutAll();
                toast({
                  type: "success",
                  title: "تم إبطال جميع الجلسات",
                  desc: "لن يعمل أي جهاز آخر مسجَّل دخول بصلاحيات قديمة.",
                });
              }
            }}
            className="btn-danger mt-4 w-full justify-center"
          >
            <LogOut size={15} /> خروج من جميع الأجهزة
          </button>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-navy-400">
            مفيد إذا شككت بأن جهازاً آخر ما زال مسجَّلاً للدخول إلى اللوحة.
          </p>
        </div>
      </div>
    </div>
  );
}
