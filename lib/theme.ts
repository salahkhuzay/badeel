/* ==========================================================================
   ألوان وأيقونات التصنيفات — أصناف Tailwind مكتوبة نصياً (لا توليد ديناميكي)
   ========================================================================== */

import type { MainCategory } from "./types";

export interface CategoryTheme {
  /** تدرّج الخلفية للأيقونات الكبيرة */
  grad: string;
  /** خلفية فاتحة + لون نص للشرائح */
  soft: string;
  /** لون نص فقط */
  text: string;
  /** حدّ ملوّن */
  border: string;
}

export const CATEGORY_THEME: Record<MainCategory, CategoryTheme> = {
  "real-estate": {
    grad: "from-emeraldBrand-500 to-emeraldBrand-700",
    soft: "bg-emeraldBrand-50 text-emeraldBrand-700 dark:bg-emeraldBrand-500/10 dark:text-emeraldBrand-400",
    text: "text-emeraldBrand-600 dark:text-emeraldBrand-400",
    border: "border-emeraldBrand-300 dark:border-emeraldBrand-500/40",
  },
  vehicles: {
    grad: "from-amberBrand-500 to-amberBrand-700",
    soft: "bg-amberBrand-50 text-amberBrand-700 dark:bg-amberBrand-500/10 dark:text-amberBrand-400",
    text: "text-amberBrand-600 dark:text-amberBrand-400",
    border: "border-amberBrand-300 dark:border-amberBrand-500/40",
  },
  furniture: {
    grad: "from-rose-500 to-rose-700",
    soft: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-300 dark:border-rose-500/40",
  },
  appliances: {
    grad: "from-sky-500 to-sky-700",
    soft: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-300 dark:border-sky-500/40",
  },
  clothing: {
    grad: "from-violet-500 to-violet-700",
    soft: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-300 dark:border-violet-500/40",
  },
  phones: {
    grad: "from-indigo-500 to-indigo-700",
    soft: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-300 dark:border-indigo-500/40",
  },
  jobs: {
    grad: "from-navy-600 to-navy-900",
    soft: "bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-100",
    text: "text-navy-700 dark:text-navy-100",
    border: "border-navy-300 dark:border-navy-700",
  },
};

export const themeOf = (c: MainCategory) => CATEGORY_THEME[c];
