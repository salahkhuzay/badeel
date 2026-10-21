"use client";

import React from "react";
import type { Ad } from "./types";
import { bodyTypeOfAd } from "./vehicleBodies";
import { BodyIconShapes } from "@/components/VehicleBodyIcon";

/* ==========================================================================
   رسوم الإعلانات المدمجة — بديل | Badeel
   كل إعلان يُعرض برسم SVG مرسوم داخل الصفحة (بلا صور خارجية ولا ملفات):
   - يناسب كل فئة: عقارات (منزل/شقة/محل/أرض) · مركبات (بحسب نوع الهيكل) ·
     هواتف · أثاث · أجهزة · ملابس · وظائف
   - ألوان متغيّرة ثابتة لكل إعلان (من معرّفه) لتنويع الشبكة
   - يُستخدم تلقائياً حين لا يكون للمُعلن صورة حقيقية مرفوعة
   ========================================================================== */

type Palette = { sky: [string, string]; ground: string; main: string; accent: string; soft: string };

/* لوحات مرتّبة: 0 أزرق · 1 أخضر · 2 دافئ · 3 بنفسجي · 4 فيروزي · 5 وردي */
const FALLBACK_PALETTES = [0, 1, 2, 3, 4, 5];

/** لكل فئة لوحاتها المناسبة — فتبدو الألوان مقصودة لا عشوائية */
const PALETTES_BY_CATEGORY: Record<string, number[]> = {
  "real-estate": [0, 4, 3, 1],
  vehicles: [0, 3, 2, 1, 5],
  phones: [3, 4, 0],
  furniture: [2, 0, 5],
  appliances: [4, 0, 3],
  clothing: [5, 3, 2],
  jobs: [1, 0, 4],
  other: [1, 2, 0],
};


const PALETTES: Palette[] = [
  { sky: ["#DBEAFE", "#F8FAFC"], ground: "#E2E8F0", main: "#1E293B", accent: "#F59E0B", soft: "#93C5FD" },
  { sky: ["#DCFCE7", "#F7FEE7"], ground: "#E7E5E4", main: "#0F172A", accent: "#059669", soft: "#86EFAC" },
  { sky: ["#FEF3C7", "#FFFBEB"], ground: "#EDE9FE", main: "#1F2937", accent: "#EA580C", soft: "#FCD34D" },
  { sky: ["#E0E7FF", "#EEF2FF"], ground: "#E2E8F0", main: "#111827", accent: "#7C3AED", soft: "#A5B4FC" },
  { sky: ["#CCFBF1", "#F0FDFA"], ground: "#E5E7EB", main: "#0B1220", accent: "#0891B2", soft: "#67E8F9" },
  { sky: ["#FCE7F3", "#FDF2F8"], ground: "#E5E7EB", main: "#18181B", accent: "#DB2777", soft: "#F9A8D4" },
];

/** مفتاح ثابت من معرّف الإعلان (لتثبيت الشكل واللون لكل إعلان) */
function hashKey(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** هل في الإعلان صورة حقيقية مرفوعة؟ (رفع من الجهاز data: · روابط خارجية · مجلد رفع) */
export function hasUploadedPhoto(ad: Ad): boolean {
  const src = ad.images?.[0];
  if (!src) return false;
  if (src.startsWith("art:")) return false;
  return (
    src.startsWith("data:image/") || /^https?:\/\//i.test(src) || src.startsWith("/uploads/")
  );
}

/* ------------------------------ عناصر مشتركة ------------------------------ */

const Sun = ({ color = "#FDE68A" }: { color?: string }) => (
  <g>
    <circle cx="332" cy="56" r="26" fill={color} opacity="0.95" />
    <circle cx="332" cy="56" r="38" fill={color} opacity="0.28" />
  </g>
);

const Clouds = () => (
  <g fill="#FFFFFF" opacity="0.82">
    <ellipse cx="86" cy="54" rx="36" ry="15" />
    <ellipse cx="112" cy="46" rx="22" ry="11" />
    <ellipse cx="252" cy="38" rx="28" ry="12" />
  </g>
);

const Tree = ({ x, p, s = 1 }: { x: number; p: Palette; s?: number }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <rect x="-3" y="196" width="6" height="30" rx="3" fill="#92400E" opacity="0.75" />
    <circle cx="0" cy="188" r="21" fill={p.accent} opacity="0.85" />
    <circle cx="-14" cy="197" r="14" fill={p.accent} opacity="0.7" />
    <circle cx="15" cy="197" r="15" fill={p.accent} opacity="0.7" />
  </g>
);

/** مركبة مرسومة من مجموعة أيقونات أنواع السيارات نفسها */
const Vehicle = ({ type, p }: { type: ReturnType<typeof bodyTypeOfAd>; p: Palette }) => (
  <g transform="translate(76 104)" style={{ color: p.main }}>
    <g transform="scale(5.2)">
      <BodyIconShapes type={type} />
    </g>
  </g>
);

/* -------------------------------- المشاهد -------------------------------- */

function SceneHouse({ p }: { p: Palette }) {
  return (
    <g>
      <Tree x={58} p={p} s={0.9} />
      <path d="M150 226v-70l70-46 70 46v70Z" fill="#F8FAFC" stroke={p.main} strokeWidth="3" strokeLinejoin="round" />
      <path d="M138 158l82-54 82 54" fill={p.accent} opacity="0.9" stroke={p.main} strokeWidth="3" strokeLinejoin="round" />
      <rect x="198" y="186" width="30" height="40" rx="3" fill={p.main} opacity="0.85" />
      <rect x="162" y="176" width="24" height="20" rx="3" fill={p.soft} stroke={p.main} strokeWidth="2" />
      <rect x="238" y="176" width="24" height="20" rx="3" fill={p.soft} stroke={p.main} strokeWidth="2" />
      <circle cx="206" cy="206" r="2" fill="#F8FAFC" />
    </g>
  );
}

function SceneApartment({ p }: { p: Palette }) {
  const rows = [0, 1, 2];
  const cols = [0, 1, 2];
  return (
    <g>
      <rect x="112" y="58" width="176" height="168" rx="6" fill="#F8FAFC" stroke={p.main} strokeWidth="3" />
      {rows.map((r) =>
        cols.map((c) => (
          <rect
            key={`${r}-${c}`}
            x={130 + c * 52}
            y={78 + r * 50}
            width="34"
            height="30"
            rx="3"
            fill={(r + c) % 3 === 0 ? p.soft : p.accent}
            opacity={(r + c) % 3 === 0 ? 0.75 : 0.45}
            stroke={p.main}
            strokeWidth="1.6"
          />
        ))
      )}
      <rect x="182" y="196" width="36" height="30" rx="3" fill={p.main} opacity="0.85" />
      <rect x="112" y="52" width="176" height="8" rx="4" fill={p.main} opacity="0.8" />
      <Tree x={70} p={p} s={0.85} />
    </g>
  );
}

function SceneShop({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="116" y="96" width="168" height="130" rx="5" fill="#F8FAFC" stroke={p.main} strokeWidth="3" />
      <path d="M104 96h192l-10 26H114Z" fill={p.accent} stroke={p.main} strokeWidth="2.5" strokeLinejoin="round" />
      <g fill="#FFFFFF" opacity="0.9">
        <path d="M118 98h22l-10 24h-22Z" />
        <path d="M162 98h22l-10 24h-22Z" />
        <path d="M206 98h22l-10 24h-22Z" />
        <path d="M250 98h22l-10 24h-22Z" />
      </g>
      <rect x="128" y="140" width="60" height="52" rx="4" fill={p.soft} stroke={p.main} strokeWidth="2" />
      <rect x="204" y="140" width="44" height="74" rx="4" fill={p.main} opacity="0.85" />
      <rect x="212" y="150" width="28" height="24" rx="3" fill="#F8FAFC" opacity="0.35" />
    </g>
  );
}

function SceneLand({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M40 226c40-26 90-40 160-40s120 14 160 40Z" fill={p.soft} opacity="0.55" />
      <g stroke={p.accent} strokeWidth="3" opacity="0.75" strokeLinecap="round">
        <path d="M70 226c0-12 2-22 6-30" />
        <path d="M100 226c0-12 2-22 6-30" />
        <path d="M130 226c0-12 2-22 6-30" />
        <path d="M160 226c0-12 2-22 6-30" />
      </g>
      <g stroke="#92400E" strokeWidth="3" opacity="0.7" strokeLinecap="round">
        <path d="M240 222v-22M262 222v-22M284 222v-22M306 222v-22" />
        <path d="M234 208h78M234 218h78" />
      </g>
      <Tree x={330} p={p} s={1.05} />
      <path d="M120 200h150" stroke={p.main} strokeWidth="2" opacity="0.25" />
    </g>
  );
}

function ScenePhone({ p }: { p: Palette }) {
  return (
    <g>
      <circle cx="200" cy="150" r="86" fill={p.soft} opacity="0.35" />
      <rect x="158" y="52" width="84" height="160" rx="16" fill={p.main} />
      <rect x="166" y="62" width="68" height="132" rx="10" fill="#F8FAFC" />
      <rect x="166" y="62" width="68" height="34" rx="10" fill={p.accent} opacity="0.85" />
      <g fill={p.main} opacity="0.35">
        <rect x="176" y="108" width="48" height="7" rx="3.5" />
        <rect x="176" y="124" width="34" height="7" rx="3.5" />
        <rect x="176" y="140" width="42" height="7" rx="3.5" />
      </g>
      <circle cx="200" cy="204" r="6" fill={p.main} opacity="0.5" />
      <rect x="186" y="46" width="28" height="5" rx="2.5" fill="#F8FAFC" opacity="0.5" />
    </g>
  );
}

function SceneSofa({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="96" y="150" width="208" height="52" rx="12" fill={p.accent} opacity="0.85" />
      <rect x="86" y="132" width="34" height="70" rx="12" fill={p.accent} />
      <rect x="280" y="132" width="34" height="70" rx="12" fill={p.accent} />
      <rect x="120" y="126" width="160" height="34" rx="10" fill={p.accent} opacity="0.7" />
      <rect x="104" y="200" width="12" height="24" rx="5" fill="#78350F" />
      <rect x="284" y="200" width="12" height="24" rx="5" fill="#78350F" />
      <rect x="150" y="114" width="34" height="20" rx="7" fill={p.soft} opacity="0.9" />
      <rect x="216" y="114" width="34" height="20" rx="7" fill={p.soft} opacity="0.9" />
      <rect x="60" y="212" width="280" height="6" rx="3" fill={p.main} opacity="0.15" />
    </g>
  );
}

function SceneFridge({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="144" y="52" width="112" height="176" rx="12" fill="#F1F5F9" stroke={p.main} strokeWidth="3" />
      <rect x="144" y="52" width="112" height="62" rx="12" fill={p.soft} opacity="0.5" />
      <path d="M144 118h112" stroke={p.main} strokeWidth="3" />
      <rect x="232" y="82" width="6" height="26" rx="3" fill={p.main} opacity="0.75" />
      <rect x="232" y="132" width="6" height="34" rx="3" fill={p.main} opacity="0.75" />
      <rect x="160" y="140" width="34" height="20" rx="4" fill={p.accent} opacity="0.5" />
    </g>
  );
}

function SceneShirt({ p }: { p: Palette }) {
  return (
    <g>
      <path
        d="M164 78l-42 24 18 34 20-10v100h80V126l20 10 18-34-42-24-26 18Z"
        fill={p.accent}
        opacity="0.9"
        stroke={p.main}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M164 78l26 18 26-18" fill="none" stroke={p.main} strokeWidth="3" />
      <g fill={p.main} opacity="0.5">
        <circle cx="200" cy="128" r="3" />
        <circle cx="200" cy="150" r="3" />
        <circle cx="200" cy="172" r="3" />
      </g>
    </g>
  );
}

function SceneBriefcase({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="118" y="112" width="164" height="112" rx="12" fill={p.main} opacity="0.92" />
      <path d="M170 112V96a14 14 0 0 1 14-14h32a14 14 0 0 1 14 14v16" fill="none" stroke={p.main} strokeWidth="6" />
      <rect x="118" y="146" width="164" height="14" fill={p.accent} />
      <rect x="188" y="138" width="24" height="30" rx="4" fill={p.accent} />
      <circle cx="160" cy="204" r="5" fill="#F8FAFC" opacity="0.5" />
    </g>
  );
}

/* --------------------------- اختيار المشهد والتكوين --------------------------- */

/** مفتاح الرسم المختار من «مكتبة الرسوم» في نموذج النشر (art:house مثلاً) */
export function artKeyOf(ad: Ad): string | null {
  const src = ad.images?.[0];
  return typeof src === "string" && src.startsWith("art:") ? src.slice(4) : null;
}

/** مفاتيح الرسوم المتاحة في نموذج النشر */
export const ART_OPTIONS = [
  "house",
  "apartment",
  "land",
  "shop",
  "sedan",
  "suv",
  "pickup",
  "truck",
  "lighttruck",
  "motorcycle",
  "tractor",
  "phone",
  "sofa",
  "fridge",
  "shirt",
  "briefcase",
] as const;

export type ArtOption = (typeof ART_OPTIONS)[number];

function sceneKind(ad: Ad): string {
  const chosen = artKeyOf(ad);
  if (chosen && (ART_OPTIONS as readonly string[]).includes(chosen)) return chosen;
  const t = `${ad.title ?? ""} ${ad.subtypeId ?? ""}`;
  if (ad.category === "real-estate") {
    if (/أرض|مزرعة|دونم|حقل/.test(t)) return "land";
    if (/محل|مستودع|تجاري|معرض/.test(t)) return "shop";
    if (/شقة|طابق|استوديو/.test(t)) return "apartment";
    return "house";
  }
  if (ad.category === "vehicles") return bodyTypeOfAd(ad);
  if (ad.category === "phones") return "phone";
  if (ad.category === "furniture") return /سرير|غرفة نوم|خزانة/.test(t) ? "sofa" : "sofa";
  if (ad.category === "appliances") return "fridge";
  if (ad.category === "clothing") return "shirt";
  if (ad.category === "jobs") return "briefcase";
  if (ad.category === "other") return "shop";
  return "house";
}

export default function AdArtwork({
  ad,
  className = "",
  showSky = true,
}: {
  ad: Ad;
  className?: string;
  showSky?: boolean;
}) {
  const key = hashKey(ad.id ?? ad.ref ?? ad.title ?? "badeel");
  const choices = PALETTES_BY_CATEGORY[ad.category] ?? FALLBACK_PALETTES;
  const p = PALETTES[choices[key % choices.length] % PALETTES.length];
  const kind = sceneKind(ad);
  const gid = `art${key.toString(36)}`;

  const scene = (() => {
    switch (kind) {
      case "apartment":
        return <SceneApartment p={p} />;
      case "shop":
        return <SceneShop p={p} />;
      case "land":
        return <SceneLand p={p} />;
      case "phone":
        return <ScenePhone p={p} />;
      case "sofa":
        return <SceneSofa p={p} />;
      case "fridge":
        return <SceneFridge p={p} />;
      case "shirt":
        return <SceneShirt p={p} />;
      case "briefcase":
        return <SceneBriefcase p={p} />;
      case "house":
        return <SceneHouse p={p} />;
      default: {
        /* مركبة: إن اختار المستخدم رسم مركبة من المكتبة نرسمه بعينه، وإلا نوع هيكل الإعلان */
        const chosen = artKeyOf(ad);
        const vehicleKinds = ["sedan", "suv", "pickup", "truck", "lighttruck", "motorcycle", "tractor"];
        const type = (chosen && vehicleKinds.includes(chosen)
          ? chosen
          : bodyTypeOfAd(ad)) as ReturnType<typeof bodyTypeOfAd>;
        return (
          <g>
            <Vehicle type={type} p={p} />
          </g>
        );
      }
    }
  })();

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={ad.title ? `رسم توضيحي: ${ad.title}` : "رسم توضيحي للإعلان"}
    >
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gid}-sky)`} />
      {showSky && (
        <>
          <Sun color={p.soft} />
          <Clouds />
        </>
      )}
      <rect y="226" width="400" height="74" fill={p.ground} />
      {kind === "land" || kind === "house" || kind === "apartment" ? null : (
        <path d="M0 226h400" stroke={p.main} strokeWidth="2" opacity="0.12" />
      )}
      {scene}
    </svg>
  );
}
