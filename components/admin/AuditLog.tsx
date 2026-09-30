"use client";

import React from "react";
import { History } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate, timeAgo } from "@/lib/currency";

/** سجل العمليات الإدارية (كل موافقة/رفض/بيع/حذف تُسجَّل هنا) */
export default function AuditLog() {
  const { audit } = useStore();

  if (audit.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 p-10 text-center">
        <History size={26} className="text-navy-300" />
        <p className="text-[13px] font-bold text-navy-700 dark:text-navy-100">
          لا توجد عمليات مسجّلة بعد
        </p>
        <p className="max-w-sm text-[12px] leading-relaxed text-navy-400">
          كل إجراء تتخذه من طابور المراجعة أو جدول الإعلانات (موافقة، رفض، تعليم كمُباع، تمييز، حذف)
          سيُسجَّل هنا مع الوقت والرقم المرجعي للإعلان.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-navy-100 p-4 dark:border-navy-800">
        <History size={16} className="text-amberBrand-500" />
        <h3 className="text-[14px] font-extrabold text-navy-900 dark:text-white">
          سجل العمليات ({audit.length})
        </h3>
      </div>
      <ul className="divide-y divide-navy-100 dark:divide-navy-800">
        {audit.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="badge bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
                {a.adRef}
              </span>
              <span className="text-[12.5px] text-navy-700 dark:text-navy-100">{a.action}</span>
            </div>
            <span className="text-[11px] text-navy-400" title={formatDate(a.at)}>
              {timeAgo(a.at)} · {formatDate(a.at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
