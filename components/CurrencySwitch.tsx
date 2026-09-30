"use client";

import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/currency";

/* ==========================================================================
   مفتاح العملة العام — يتحكم بعرض الأسعار في كل المنصة (شريط علوي)
   ========================================================================== */

export default function CurrencySwitch({ full = false }: { full?: boolean }) {
  const { currency, setCurrency } = useStore();

  const Btn = ({ value, label, sub }: { value: Currency; label: string; sub: string }) => {
    const active = currency === value;
    return (
      <button
        onClick={() => setCurrency(value)}
        aria-pressed={active}
        className={cn(
          "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
          active
            ? "bg-navy-900 text-white shadow-sm dark:bg-white dark:text-navy-900"
            : "text-navy-500 hover:bg-white/70 dark:text-navy-200 dark:hover:bg-navy-800"
        )}
        title={sub}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl bg-navy-100/80 p-1 dark:bg-navy-800",
        full && "w-full"
      )}
      role="group"
      aria-label="تبديل العملة"
    >
      <ArrowLeftRight size={14} className="mx-0.5 hidden text-navy-400 sm:block" />
      <Btn value="USD" label="$ دولار" sub="عرض الأسعار بالدولار الأمريكي" />
      <Btn value="SYP" label="ل.س ليرة" sub="عرض الأسعار بالليرة السورية" />
    </div>
  );
}
