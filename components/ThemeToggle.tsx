"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useStore();
  const dark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={
        compact
          ? "btn-icon"
          : "inline-flex h-9 items-center gap-2 rounded-lg border border-navy-200 px-3 text-xs font-semibold text-navy-600 transition hover:bg-navy-50 dark:border-navy-700 dark:text-navy-200 dark:hover:bg-navy-800"
      }
      title={dark ? "الوضع النهاري" : "الوضع الليلي"}
      aria-label={dark ? "تشغيل الوضع النهاري" : "تشغيل الوضع الليلي"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {!compact && <span>{dark ? "نهاري" : "ليلي"}</span>}
    </button>
  );
}
