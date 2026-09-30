"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

/* نظام إشعارات خفيف (Toasts) — بدون أي مكتبة خارجية */

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  type: ToastType;
  title: string;
  desc?: string;
}

const ToastContext = createContext<{
  push: (t: Omit<Toast, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4200);
  }, []);

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-6 sm:translate-x-0">
        {items.map((t) => {
          const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? XCircle : Info;
          const tone =
            t.type === "success"
              ? "border-emeraldBrand-500/40 bg-white text-emeraldBrand-700 dark:bg-navy-900 dark:text-emeraldBrand-400"
              : t.type === "error"
                ? "border-rose-500/40 bg-white text-rose-700 dark:bg-navy-900 dark:text-rose-400"
                : "border-navy-200 bg-white text-navy-700 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100";
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex animate-fade-up items-start gap-3 rounded-xl border p-3 shadow-pop ${tone}`}
              role="status"
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{t.title}</p>
                {t.desc && (
                  <p className="mt-0.5 text-xs leading-relaxed text-navy-500 dark:text-navy-300">
                    {t.desc}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="rounded p-1 text-navy-400 transition hover:bg-navy-50 dark:hover:bg-navy-800"
                aria-label="إغلاق"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.push;
}
