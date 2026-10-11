"use client";

import React from "react";
import { Briefcase, Building2, Car, Plug, Shirt, Smartphone, Sofa } from "lucide-react";
import type { MainCategory } from "@/lib/types";
import { themeOf } from "@/lib/theme";
import { cn } from "@/lib/currency";

/* أيقونة التصنيف في مكان واحد — تُستخدم في الرئيسية ورأس التصنيف والقوائم */

export const CATEGORY_ICON: Record<MainCategory, React.ReactNode> = {
  "real-estate": <Building2 />,
  vehicles: <Car />,
  furniture: <Sofa />,
  appliances: <Plug />,
  clothing: <Shirt />,
  phones: <Smartphone />,
  jobs: <Briefcase />,
};

export function categoryIcon(id: MainCategory, size = 24, className = "") {
  return React.cloneElement(CATEGORY_ICON[id] as React.ReactElement, { size, className });
}

/** مربّع أيقونة بتدرّج لون التصنيف */
export default function CategoryTile({
  id,
  size = 56,
  iconSize = 26,
  className = "",
}: {
  id: MainCategory;
  size?: number;
  iconSize?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
        themeOf(id).grad,
        className
      )}
      style={{ width: size, height: size }}
    >
      {categoryIcon(id, iconSize)}
    </span>
  );
}
