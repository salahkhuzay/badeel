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
  City,
  Currency,
  District,
  DistrictKind,
  ModerationAction,
  Settings,
} from "./types";
import { SEED_ADS, SEED_CITIES, SEED_SETTINGS } from "./seed";
import { convert, safeStorage, uid } from "./currency";
import { cleanDistrictName, districtId as makeDistrictId, guessDistrictKind } from "./geo";

/* ==========================================================================
   مخزن الحالة العام (Mock State Management)
   - React Context + useReducer
   - حفظ تلقائي في localStorage (مع fallback في الذاكرة)
   - الجغرافيا ديناميكية بالكامل: لا توجد قائمة أحياء ثابتة؛ كل منطقة
     تُنشأ من إدخال المستخدم اليدوي أو من لوحة التحكم.
   ========================================================================== */

const STORAGE_KEY = "badeel.state.v1";
const ADMIN_USER = "admin";
const ADMIN_PASS = "badeel2026";

export interface AppState {
  ads: Ad[];
  cities: City[];
  settings: Settings;
  audit: AuditEntry[];
  currency: Currency;
  theme: "light" | "dark";
  adminUser: string | null;
  hydrated: boolean;
}

const initialState: AppState = {
  ads: SEED_ADS,
  cities: SEED_CITIES,
  settings: SEED_SETTINGS,
  audit: [],
  currency: "USD",
  theme: "light",
  adminUser: null,
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
  | { type: "UPSERT_DISTRICT"; cityId: string; district: District }
  | { type: "SET_DISTRICT_KIND"; cityId: string; districtId: string; kind: DistrictKind }
  | { type: "DELETE_DISTRICT"; cityId: string; districtId: string }
  | { type: "TOGGLE_CITY"; cityId: string }
  | { type: "ADD_CITY"; city: City }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> }
  | { type: "LOGIN"; user: string }
  | { type: "LOGOUT" }
  | { type: "RESET_DEMO" };

const now = () => new Date().toISOString();

/* تطبيع الحالة القادمة من التخزين المحلي:
   - تعبئة districtLabel للإعلانات القديمة من سجل المناطق المحفوظ */
function normalize(saved: Partial<AppState>): Partial<AppState> {
  const cities = saved.cities ?? initialState.cities;
  const ads = (saved.ads ?? initialState.ads).map((ad) => {
    if (ad.districtLabel) return ad;
    const city = cities.find((c) => c.id === ad.cityId);
    const d = city?.districts.find((x) => x.id === ad.districtId);
    if (!d) return ad;
    return { ...ad, districtLabel: d.name, districtKind: ad.districtKind ?? d.kind };
  });
  return { ...saved, cities, ads };
}

function reducer(state: AppState, action: Action): AppState {
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
      const log = (ad: Ad, label: string): AuditEntry => ({
        id: uid("log"),
        adRef: ad.ref,
        action: label,
        at: now(),
      });
      let entry: AuditEntry | null = null;

      const ads = state.ads.map((a) => {
        if (a.id !== act.id) return a;
        const actor = action.actor ?? "admin";
        switch (act.type) {
          case "APPROVE":
            entry = log(a, `الموافقة على الإعلان ${a.ref}`);
            return {
              ...a,
              status: "active" as const,
              publishedAt: a.publishedAt ?? now(),
              rejectionReason: null,
              moderatedBy: actor,
            };
          case "REJECT":
            entry = log(a, `رفض الإعلان ${a.ref} — السبب: ${act.reason}`);
            return { ...a, status: "rejected" as const, rejectionReason: act.reason, moderatedBy: actor };
          case "MARK_SOLD":
            entry = log(a, `تعليم الإعلان ${a.ref} كمُباع`);
            return { ...a, status: "sold" as const, soldAt: now(), moderatedBy: actor };
          case "MARK_RENTED":
            entry = log(a, `تعليم الإعلان ${a.ref} كمؤجَّر`);
            return { ...a, status: "rented" as const, soldAt: now(), moderatedBy: actor };
          case "REOPEN":
            entry = log(a, `إعادة نشر الإعلان ${a.ref}`);
            return { ...a, status: "active" as const, soldAt: null, moderatedBy: actor };
          case "TOGGLE_FEATURED":
            entry = log(a, `${a.featured ? "إلغاء تمييز" : "تمييز"} الإعلان ${a.ref}`);
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
                ? [log(target, `حذف الإعلان ${target.ref}`), ...state.audit]
                : state.audit;
            })()
          : entry
            ? [entry, ...state.audit]
            : state.audit;

      return {
        ...state,
        ads: act.type === "DELETE_AD" ? state.ads.filter((a) => a.id !== act.id) : ads,
        audit: audit.slice(0, 60),
      };
    }

    case "UPSERT_DISTRICT":
      return {
        ...state,
        cities: state.cities.map((c) => {
          if (c.id !== action.cityId) return c;
          if (c.districts.some((d) => d.id === action.district.id)) return c;
          return { ...c, districts: [...c.districts, action.district] };
        }),
      };

    case "SET_DISTRICT_KIND":
      return {
        ...state,
        cities: state.cities.map((c) =>
          c.id === action.cityId
            ? {
                ...c,
                districts: c.districts.map((d) =>
                  d.id === action.districtId ? { ...d, kind: action.kind } : d
                ),
              }
            : c
        ),
        // تحديث نوع المنطقة في الإعلانات المرتبطة أيضاً
        ads: state.ads.map((a) =>
          a.districtId === action.districtId ? { ...a, districtKind: action.kind } : a
        ),
      };

    case "DELETE_DISTRICT":
      return {
        ...state,
        cities: state.cities.map((c) =>
          c.id === action.cityId
            ? { ...c, districts: c.districts.filter((d) => d.id !== action.districtId) }
            : c
        ),
      };

    case "TOGGLE_CITY":
      return {
        ...state,
        cities: state.cities.map((c) =>
          c.id === action.cityId ? { ...c, active: !c.active } : c
        ),
      };

    case "ADD_CITY":
      return { ...state, cities: [...state.cities, action.city] };

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case "LOGIN":
      return { ...state, adminUser: action.user };

    case "LOGOUT":
      return { ...state, adminUser: null };

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

export interface DistrictFacet {
  id: string;
  name: string;
  kind: DistrictKind;
  cityId: string;
  count: number;
}

interface StoreValue extends AppState {
  /* مشتقات جاهزة */
  publicAds: Ad[];
  pendingAds: Ad[];
  featuredAds: Ad[];
  cityById: (id: string) => City | undefined;
  districtName: (cityId: string, districtId: string) => string;
  /** اسم منطقة الإعلان — يُقرأ من الإعلان نفسه أولاً (الإدخال اليدوي) */
  districtLabelOf: (ad: Ad) => string;
  /** قائمة المناطق المشتقة من الإعلانات فعلياً + السجل الإداري، مع العدّادات */
  districtFacets: (scope?: "public" | "all") => DistrictFacet[];
  districtNames: () => string[];
  toUsd: (amount: number, from: Currency) => number;
  toSyp: (amount: number, from: Currency) => number;
  /* إجراءات */
  setCurrency: (c: Currency) => void;
  toggleTheme: () => void;
  addAd: (ad: Ad) => void;
  moderate: (action: ModerationAction) => void;
  incrementViews: (id: string) => void;
  /** إنشاء المنطقة عند أول إدخال يدوي، أو إرجاع معرّفها إن كانت موجودة */
  ensureDistrict: (cityId: string, name: string, kind?: DistrictKind) => string;
  setDistrictKind: (cityId: string, districtId: string, kind: DistrictKind) => void;
  deleteDistrict: (cityId: string, districtId: string) => void;
  toggleCity: (cityId: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* الاسترجاع من التخزين المحلي */
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
        adminUser: saved?.adminUser ?? null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* الحفظ التلقائي */
  useEffect(() => {
    if (!state.hydrated) return;
    safeStorage.set(STORAGE_KEY, {
      ads: state.ads,
      cities: state.cities,
      settings: state.settings,
      audit: state.audit,
      currency: state.currency,
      theme: state.theme,
      adminUser: state.adminUser,
    });
  }, [
    state.hydrated,
    state.ads,
    state.cities,
    state.settings,
    state.audit,
    state.currency,
    state.theme,
    state.adminUser,
  ]);

  /* تطبيق الوضع الليلي على عنصر html */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.style.colorScheme = state.theme;
  }, [state.theme]);

  /* إنشاء منطقة من إدخال يدوي (يُستدعى من نموذج الإعلان) */
  const ensureDistrict = useCallback(
    (cityId: string, name: string, kind?: DistrictKind) => {
      const clean = cleanDistrictName(name);
      const id = makeDistrictId(cityId, clean);
      const city = state.cities.find((c) => c.id === cityId);
      const existing = city?.districts.find((d) => d.id === id);
      if (!existing && clean.length >= 2) {
        dispatch({
          type: "UPSERT_DISTRICT",
          cityId,
          district: {
            id,
            name: clean,
            kind: kind ?? guessDistrictKind(clean),
            createdBy: "user",
          },
        });
      }
      return id;
    },
    [state.cities]
  );

  const value = useMemo<StoreValue>(() => {
    const cityById = (id: string) => state.cities.find((c) => c.id === id);
    const publicAds = state.ads.filter((a) =>
      ["active", "sold", "rented"].includes(a.status)
    );

    const districtName = (cityId: string, districtId: string) => {
      const c = cityById(cityId);
      return c?.districts.find((d) => d.id === districtId)?.name ?? "—";
    };

    const districtLabelOf = (ad: Ad) =>
      ad.districtLabel || districtName(ad.cityId, ad.districtId) || "منطقة غير محددة";

    /** المناطق مشتقة من الإعلانات فعلياً — لا قائمة ثابتة */
    const districtFacets = (scope: "public" | "all" = "public"): DistrictFacet[] => {
      const source = scope === "public" ? publicAds : state.ads;
      const map = new Map<string, DistrictFacet>();
      source.forEach((ad) => {
        const key = `${ad.cityId}::${ad.districtId}`;
        const city = cityById(ad.cityId);
        const reg = city?.districts.find((d) => d.id === ad.districtId);
        const name = districtLabelOf(ad);
        const kind = reg?.kind ?? ad.districtKind ?? guessDistrictKind(name);
        const prev = map.get(key);
        if (prev) prev.count += 1;
        else
          map.set(key, {
            id: ad.districtId,
            name,
            kind,
            cityId: ad.cityId,
            count: 1,
          });
      });
      return [...map.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name, "ar")
      );
    };

    const districtNames = () =>
      [...new Set(districtFacets("public").map((f) => f.name))].sort((a, b) =>
        a.localeCompare(b, "ar")
      );

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
      districtName,
      districtLabelOf,
      districtFacets,
      districtNames,
      toUsd,
      toSyp,

      setCurrency: (currency) => dispatch({ type: "SET_CURRENCY", currency }),
      toggleTheme: () => dispatch({ type: "TOGGLE_THEME" }),
      addAd: (ad) => dispatch({ type: "ADD_AD", ad }),
      moderate: (action) =>
        dispatch({ type: "MODERATE", action, actor: state.adminUser ?? "admin" }),
      incrementViews: (id) => dispatch({ type: "INC_VIEW", id }),
      ensureDistrict,
      setDistrictKind: (cityId, districtId, kind) =>
        dispatch({ type: "SET_DISTRICT_KIND", cityId, districtId, kind }),
      deleteDistrict: (cityId, districtId) =>
        dispatch({ type: "DELETE_DISTRICT", cityId, districtId }),
      toggleCity: (cityId) => dispatch({ type: "TOGGLE_CITY", cityId }),
      updateSettings: (s) => dispatch({ type: "UPDATE_SETTINGS", settings: s }),
      login: (user, pass) => {
        const ok = user.trim().toLowerCase() === ADMIN_USER && pass === ADMIN_PASS;
        if (ok) dispatch({ type: "LOGIN", user: ADMIN_USER });
        return ok;
      },
      logout: () => dispatch({ type: "LOGOUT" }),
      resetDemo: () => dispatch({ type: "RESET_DEMO" }),
    };
  }, [state, ensureDistrict]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** بيانات الدخول التجريبية للوحة التحكم */
export const DEMO_CREDENTIALS = { user: ADMIN_USER, pass: ADMIN_PASS };
