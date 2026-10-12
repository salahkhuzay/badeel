"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type {
  Ad,
  AuditEntry,
  AuthState,
  City,
  Currency,
  ModerationAction,
  Settings,
} from "./types";
import { SEED_ADS, SEED_CITIES, SEED_SETTINGS } from "./seed";
import { convert, safeStorage, uid } from "./currency";
import { contactDigits, migrateContactPhone } from "./contact";
import { ADMIN_USERNAME, hashPassword, safeEqual } from "./auth";

/* ==========================================================================
   مخزن الحالة العام — بديل | Badeel
   Context + useReducer + حفظ في localStorage (مع fallback في الذاكرة)
   المدينة فقط (أُلغيت الأحياء والمناطق) + جلسة إدارية آمنة.
   ========================================================================== */

const STORAGE_KEY = "badeel.state.v1";

const initialAuth: AuthState = {
  loggedIn: false,
  sessionExpiresAt: null,
  sessionEpoch: 1,
  failedAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
};

export interface AppState {
  ads: Ad[];
  cities: City[];
  settings: Settings;
  auth: AuthState;
  audit: AuditEntry[];
  currency: Currency;
  theme: "light" | "dark";
  hydrated: boolean;
}

const initialState: AppState = {
  ads: SEED_ADS,
  cities: SEED_CITIES,
  settings: SEED_SETTINGS,
  auth: initialAuth,
  audit: [],
  currency: "USD",
  theme: "light",
  hydrated: false,
};

type Action =
  | { type: "HYDRATE"; payload: Partial<AppState> }
  | { type: "SET_CURRENCY"; currency: Currency }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_THEME"; theme: "light" | "dark" }
  | { type: "ADD_AD"; ad: Ad }
  | { type: "MODERATE"; action: ModerationAction; actor?: string }
  | { type: "INC_VIEW"; id: string }
  | { type: "TOGGLE_CITY"; cityId: string }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> }
  | { type: "AUTH_LOGGED_IN"; minutes: number }
  | { type: "AUTH_FAIL"; lockedUntil: string | null; attempts: number }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_REFRESH"; minutes: number }
  | { type: "AUTH_LOGOUT_ALL" }
  | { type: "LOG"; entry: AuditEntry }
  | { type: "RESET_DEMO" };

const now = () => new Date().toISOString();
const plusMinutes = (m: number) => new Date(Date.now() + m * 60000).toISOString();

function normalize(saved: Partial<AppState>): Partial<AppState> {
  const cities = saved.cities ?? initialState.cities;
  const ads = (saved.ads ?? initialState.ads).map((ad) => {
    /* ترحيل: إزالة حقول المنطقة القديمة من الإعلانات المحفوظة سابقاً */
    const { districtId, districtLabel, districtKind, ...rest } = ad as Ad & {
      districtId?: string;
      districtLabel?: string;
      districtKind?: string;
    };
    return rest as Ad;
  });
  /* دمج إعدادات الأمان الجديدة إن كانت النسخة المحفوظة أقدم */
  const settings = { ...SEED_SETTINGS, ...(saved.settings ?? {}) };
  /* ترحيل أرقام التواصل (التفاصيل في lib/contact.ts):
     - رقم افتراضي قديم مخزَّن بأي صيغة كتابة → يُحدَّث للافتراضي الحالي تلقائياً.
     - أي رقم ضبطه المسؤول بنفسه (custom) → لا يُمسّ أبداً. */
  settings.contactPhone = migrateContactPhone(
    settings.contactPhone,
    settings.contactPhoneSource,
    SEED_SETTINGS.contactPhone
  );
  /* الوسم الافتراضي لمن سبق هذا الحقل: يطابق الافتراضي الحالي ⇒ «default»، وغيره ⇒ «custom» حمايةً له */
  if (!settings.contactPhoneSource) {
    settings.contactPhoneSource =
      contactDigits(settings.contactPhone) === contactDigits(SEED_SETTINGS.contactPhone)
        ? "default"
        : "custom";
  }
  /* ترحيل رابط فيسبوك: العنصر النائب القديم (أو الفراغ) → الصفحة الرسمية.
     أي رابط ضبطه المسؤول بنفسه من اللوحة لا يُمسّ أبداً. */
  const fbNow = String(settings.facebookUrl ?? "").trim();
  const PLACEHOLDER_FB = ["", "https://www.facebook.com", "https://www.facebook.com/"];
  if (PLACEHOLDER_FB.includes(fbNow)) settings.facebookUrl = SEED_SETTINGS.facebookUrl;
  const auth = { ...initialAuth, ...(saved.auth ?? {}) };
  /* إن كان الإعداد القديم يحتوي authUser فقد أُلغيت هذه الحالة */
  return { ...saved, cities, ads, settings, auth };
}

function reducer(state: AppState, action: Action): AppState {
  const log = (entry: Omit<AuditEntry, "id" | "at">): AuditEntry => ({
    id: uid("log"),
    at: now(),
    ...entry,
  });

  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };

    case "SET_CURRENCY":
      return { ...state, currency: action.currency };

    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };

    case "SET_THEME":
      return { ...state, theme: action.theme };

    case "ADD_AD":
      return { ...state, ads: [action.ad, ...state.ads] };

    case "INC_VIEW":
      return {
        ...state,
        ads: state.ads.map((a) => (a.id === action.id ? { ...a, views: a.views + 1 } : a)),
      };

    case "MODERATE": {
      const act = action.action;
      let entry: AuditEntry | null = null;
      const ads = state.ads.map((a) => {
        if (a.id !== act.id) return a;
        const actor = action.actor ?? "admin";
        switch (act.type) {
          case "APPROVE":
            entry = log({ adRef: a.ref, action: `الموافقة على الإعلان ${a.ref}`, kind: "ad" });
            return {
              ...a,
              status: "active" as const,
              publishedAt: a.publishedAt ?? now(),
              rejectionReason: null,
              moderatedBy: actor,
            };
          case "REJECT":
            entry = log({
              adRef: a.ref,
              action: `رفض الإعلان ${a.ref} — السبب: ${act.reason}`,
              kind: "ad",
            });
            return {
              ...a,
              status: "rejected" as const,
              rejectionReason: act.reason,
              moderatedBy: actor,
            };
          case "MARK_SOLD":
            entry = log({ adRef: a.ref, action: `تعليم الإعلان ${a.ref} كمُباع`, kind: "ad" });
            return { ...a, status: "sold" as const, soldAt: now(), moderatedBy: actor };
          case "MARK_RENTED":
            entry = log({ adRef: a.ref, action: `تعليم الإعلان ${a.ref} كمؤجَّر`, kind: "ad" });
            return { ...a, status: "rented" as const, soldAt: now(), moderatedBy: actor };
          case "REOPEN":
            entry = log({ adRef: a.ref, action: `إعادة نشر الإعلان ${a.ref}`, kind: "ad" });
            return { ...a, status: "active" as const, soldAt: null, moderatedBy: actor };
          case "TOGGLE_FEATURED":
            entry = log({
              adRef: a.ref,
              action: `${a.featured ? "إلغاء تمييز" : "تمييز"} الإعلان ${a.ref}`,
              kind: "ad",
            });
            return { ...a, featured: !a.featured, moderatedBy: actor };
          default:
            return a;
        }
      });

      const audit =
        act.type === "DELETE_AD"
          ? (() => {
              const target = state.ads.find((a) => a.id === act.id);
              return target
                ? [log({ adRef: target.ref, action: `حذف الإعلان ${target.ref}`, kind: "ad" }), ...state.audit]
                : state.audit;
            })()
          : entry
            ? [entry, ...state.audit]
            : state.audit;

      return {
        ...state,
        ads: act.type === "DELETE_AD" ? state.ads.filter((a) => a.id !== act.id) : ads,
        audit: audit.slice(0, 80),
      };
    }

    case "TOGGLE_CITY":
      return {
        ...state,
        cities: state.cities.map((c) =>
          c.id === action.cityId ? { ...c, active: !c.active } : c
        ),
      };

    case "UPDATE_SETTINGS": {
      const nextSettings = { ...state.settings, ...action.settings };
      /* إن ضبط المسؤول الرقم بنفسه ⇒ يُعلَّم «مخصّصاً» فلا يمسّه أي ترحيل تلقائي أبداً */
      if (action.settings.contactPhone !== undefined) {
        nextSettings.contactPhoneSource =
          contactDigits(nextSettings.contactPhone) === contactDigits(SEED_SETTINGS.contactPhone)
            ? "default"
            : "custom";
      }
      return {
        ...state,
        settings: nextSettings,
        audit: [
          log({ adRef: "—", action: "تحديث إعدادات المنصة", kind: "settings" }),
          ...state.audit,
        ].slice(0, 80),
      };
    }

    /* ------------------------------- الأمان ------------------------------- */
    case "AUTH_LOGGED_IN":
      return {
        ...state,
        auth: {
          ...state.auth,
          loggedIn: true,
          sessionExpiresAt: plusMinutes(action.minutes),
          failedAttempts: 0,
          lockedUntil: null,
          lastLoginAt: now(),
        },
        audit: [
          log({ adRef: "—", action: "تسجيل دخول ناجح إلى لوحة التحكم", kind: "auth" }),
          ...state.audit,
        ].slice(0, 80),
      };

    case "AUTH_FAIL":
      return {
        ...state,
        auth: {
          ...state.auth,
          failedAttempts: action.attempts,
          lockedUntil: action.lockedUntil,
        },
        audit: [
          log({
            adRef: "—",
            action: action.lockedUntil
              ? `محاولات دخول فاشلة (${action.attempts}) — تم قفل اللوحة مؤقتاً`
              : `محاولة دخول فاشلة (${action.attempts})`,
            kind: "auth",
          }),
          ...state.audit,
        ].slice(0, 80),
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        auth: { ...state.auth, loggedIn: false, sessionExpiresAt: null },
      };

    case "AUTH_REFRESH":
      return {
        ...state,
        auth: { ...state.auth, sessionExpiresAt: plusMinutes(action.minutes) },
      };

    case "AUTH_LOGOUT_ALL":
      return {
        ...state,
        auth: {
          ...state.auth,
          loggedIn: false,
          sessionExpiresAt: null,
          sessionEpoch: state.auth.sessionEpoch + 1,
        },
        audit: [
          log({ adRef: "—", action: "خروج من جميع الجلسات (إبطال كل الأجهزة)", kind: "auth" }),
          ...state.audit,
        ].slice(0, 80),
      };

    case "LOG":
      return { ...state, audit: [action.entry, ...state.audit].slice(0, 80) };

    case "RESET_DEMO":
      return {
        ...initialState,
        theme: state.theme,
        currency: state.currency,
        hydrated: true,
      };

    default:
      return state;
  }
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "locked"; waitMs: number }
  | { ok: false; reason: "credentials"; remaining: number };

interface StoreValue extends AppState {
  publicAds: Ad[];
  pendingAds: Ad[];
  featuredAds: Ad[];
  cityById: (id: string) => City | undefined;
  toUsd: (amount: number, from: Currency) => number;
  toSyp: (amount: number, from: Currency) => number;
  setCurrency: (c: Currency) => void;
  toggleTheme: () => void;
  addAd: (ad: Ad) => void;
  moderate: (action: ModerationAction) => void;
  incrementViews: (id: string) => void;
  toggleCity: (cityId: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  resetDemo: () => void;
  /* الأمان */
  login: (user: string, pass: string) => Promise<LoginResult>;
  logout: () => void;
  logoutAll: () => void;
  refreshSession: () => void;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  sessionMinutesLeft: () => number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = safeStorage.get<Partial<AppState>>(STORAGE_KEY);
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    dispatch({
      type: "HYDRATE",
      payload: {
        ...normalize(saved ?? {}),
        theme: saved?.theme ?? (prefersDark ? "dark" : "light"),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    safeStorage.set(STORAGE_KEY, {
      ads: state.ads,
      cities: state.cities,
      settings: state.settings,
      auth: state.auth,
      audit: state.audit,
      currency: state.currency,
      theme: state.theme,
    });
  }, [
    state.hydrated,
    state.ads,
    state.cities,
    state.settings,
    state.auth,
    state.audit,
    state.currency,
    state.theme,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.style.colorScheme = state.theme;
  }, [state.theme]);

  const value = useMemo<StoreValue>(() => {
    const cityById = (id: string) => state.cities.find((c) => c.id === id);
    const publicAds = state.ads.filter((a) => ["active", "sold", "rented"].includes(a.status));

    const toUsd = (amount: number, from: Currency) =>
      convert(amount, from, "USD", state.settings.usdToSyp);
    const toSyp = (amount: number, from: Currency) =>
      convert(amount, from, "SYP", state.settings.usdToSyp);

    return {
      ...state,
      publicAds,
      pendingAds: state.ads.filter((a) => a.status === "pending"),
      featuredAds: publicAds.filter((a) => a.featured && a.status === "active"),
      cityById,
      toUsd,
      toSyp,

      setCurrency: (currency) => dispatch({ type: "SET_CURRENCY", currency }),
      toggleTheme: () => dispatch({ type: "TOGGLE_THEME" }),
      addAd: (ad) => dispatch({ type: "ADD_AD", ad }),
      moderate: (action) =>
        dispatch({ type: "MODERATE", action, actor: state.settings.adminUsername }),
      incrementViews: (id) => dispatch({ type: "INC_VIEW", id }),
      toggleCity: (cityId) => dispatch({ type: "TOGGLE_CITY", cityId }),
      updateSettings: (s) => dispatch({ type: "UPDATE_SETTINGS", settings: s }),
      resetDemo: () => dispatch({ type: "RESET_DEMO" }),

      /* ------------------------------ الأمان ------------------------------ */
      login: async (user, pass) => {
        const wait = state.auth.lockedUntil
          ? new Date(state.auth.lockedUntil).getTime() - Date.now()
          : 0;
        if (wait > 0) return { ok: false, reason: "locked", waitMs: wait };

        const userOk = user.trim().toLowerCase() === state.settings.adminUsername.toLowerCase();
        const hash = await hashPassword(pass, state.settings.adminSalt);
        const passOk = safeEqual(hash, state.settings.adminHash);

        if (userOk && passOk) {
          dispatch({ type: "AUTH_LOGGED_IN", minutes: state.settings.sessionMinutes });
          return { ok: true };
        }

        const attempts = state.auth.failedAttempts + 1;
        const shouldLock = attempts >= state.settings.maxLoginAttempts;
        const lockedUntil = shouldLock ? plusMinutes(state.settings.lockMinutes) : null;
        dispatch({
          type: "AUTH_FAIL",
          attempts: shouldLock ? 0 : attempts,
          lockedUntil,
        });
        if (shouldLock)
          return { ok: false, reason: "locked", waitMs: state.settings.lockMinutes * 60000 };
        return { ok: false, reason: "credentials", remaining: state.settings.maxLoginAttempts - attempts };
      },

      logout: () => dispatch({ type: "AUTH_LOGOUT" }),
      logoutAll: () => dispatch({ type: "AUTH_LOGOUT_ALL" }),
      refreshSession: () => dispatch({ type: "AUTH_REFRESH", minutes: state.settings.sessionMinutes }),

      changePassword: async (current, next) => {
        const currentHash = await hashPassword(current, state.settings.adminSalt);
        if (!safeEqual(currentHash, state.settings.adminHash))
          return { ok: false, error: "كلمة المرور الحالية غير صحيحة." };

        const salt = Array.from(
          typeof crypto !== "undefined" && crypto.getRandomValues
            ? crypto.getRandomValues(new Uint8Array(16))
            : new Uint8Array(16).map(() => Math.floor(Math.random() * 256))
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        const hash = await hashPassword(next, salt);
        dispatch({
          type: "UPDATE_SETTINGS",
          settings: { adminSalt: salt, adminHash: hash, passwordChanged: true },
        });
        dispatch({
          type: "LOG",
          entry: {
            id: uid("log"),
            adRef: "—",
            at: now(),
            action: "تغيير كلمة مرور لوحة التحكم",
            kind: "auth",
          },
        });
        return { ok: true };
      },

      sessionMinutesLeft: () => {
        if (!state.auth.sessionExpiresAt) return 0;
        return Math.max(0, (new Date(state.auth.sessionExpiresAt).getTime() - Date.now()) / 60000);
      },
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** اسم مستخدم لوحة التحكم (لا تُعرض كلمة المرور في الواجهة إطلاقاً) */
export const ADMIN_USER = ADMIN_USERNAME;
