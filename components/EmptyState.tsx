import React from "react";

export default function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 dark:bg-navy-800 dark:text-navy-300">
        {icon}
      </div>
      <h3 className="text-base font-extrabold text-navy-900 dark:text-white">{title}</h3>
      {desc && (
        <p className="max-w-md text-sm leading-relaxed text-navy-500 dark:text-navy-300">{desc}</p>
      )}
      {action}
    </div>
  );
}
