import React from "react";
import { STATUS_META } from "@/lib/taxonomy";
import type { AdStatus } from "@/lib/types";

/** شارة حالة الإعلان (قيد المراجعة / منشور / مرفوض / تم البيع...) */
export default function StatusBadge({
  status,
  className = "",
}: {
  status: AdStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span className={`badge ${meta.className} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.name}
    </span>
  );
}
