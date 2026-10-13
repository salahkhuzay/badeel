"use client";

/* ==========================================================================
   components/ShareButton.tsx — مشاركة المنصة (موجة 18)
   --------------------------------------------------------------------------
   زر مشاركة واحدة لمنصة «بديل أونلاين»: على الجوال يستخدم المشاركة الأصلية
   للنظام (navigator.share)، وعلى غيره قائمة صغيرة: واتساب / فيسبوك / نسخ
   الرابط. الهدف: انتشار السوق عبر قنوات أهالي منبج (واتساب وفيسبوك)،
   وصورة البطاقة المشاركة هي og-cover.png المولّدة في public/.
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, Facebook, MessageCircle, Share2 } from "lucide-react";
import { SITE_URL } from "@/lib/site";

const SHARE_TEXT =
  "بديل أونلاين — سوق منبج للإعلانات المبوبة: عقارات، سيارات ومركبات، هواتف، أثاث وأجهزة ووظائف. الأسعار بالدولار والليرة السورية.";

export default function ShareButton({ variant = "icon" }: { variant?: "icon" | "pill" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  /* إغلاق القائمة عند النقر خارجها */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  /* رابط المشاركة: في المتصفح أصل الصفحة الفعلي، وأثناء prerender على الخادم
     نستخدم SITE_URL لأن window غير معرّف هناك (وإلا انكسر البناء) */
  const url = () =>
    (typeof window === "undefined" ? SITE_URL : window.location.origin) + "/";

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "بديل أونلاين - Badeel Online", text: SHARE_TEXT, url: url() });
        return true;
      } catch {
        return false; /* إلغاء المستخدم — لا نفتح البديل */
      }
    }
    return false;
  };

  const onClick = async () => {
    if (!(await nativeShare())) setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* متصفح بلا clipboard — نتجاهل بهدوء */
    }
  };

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT}\n${url()}`)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`;

  if (variant === "pill") {
    return (
      <div className="relative inline-block" ref={boxRef}>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-extrabold text-white backdrop-blur hover:bg-white/20"
          title="شارك المنصة مع أهلك وناسك في منبج"
        >
          <Share2 size={15} /> شارك المنصة
        </button>
        <ShareMenu
          open={open}
          copied={copied}
          waHref={waHref}
          fbHref={fbHref}
          onCopy={copy}
          dark
        />
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={boxRef}>
      <button
        type="button"
        onClick={onClick}
        className="btn-icon text-navy-600 hover:bg-amberBrand-50 hover:text-amberBrand-700 dark:text-navy-200 dark:hover:bg-amberBrand-500/10"
        title="شارك المنصة"
        aria-label="مشاركة المنصة"
      >
        <Share2 size={16} />
      </button>
      <ShareMenu open={open} copied={copied} waHref={waHref} fbHref={fbHref} onCopy={copy} />
    </div>
  );
}

/* القائمة المنسدلة الصغيرة — تُرسم فوق المحتوى في الاتجاهين الفاتح والداكن */
function ShareMenu({
  open,
  copied,
  waHref,
  fbHref,
  onCopy,
  dark = false,
}: {
  open: boolean;
  copied: boolean;
  waHref: string;
  fbHref: string;
  onCopy: () => void;
  dark?: boolean;
}) {
  if (!open) return null;
  const base = dark
    ? "bg-navy-800 text-white border-white/15"
    : "bg-white text-navy-800 border-navy-100 dark:bg-navy-900 dark:text-navy-100 dark:border-navy-700";
  const item = dark ? "hover:bg-white/10" : "hover:bg-navy-50 dark:hover:bg-navy-800";
  return (
    <div
      className={`absolute bottom-full right-0 z-50 mb-2 w-44 overflow-hidden rounded-xl border shadow-pop ${base}`}
      role="menu"
    >
      <a href={waHref} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold ${item}`}>
        <MessageCircle size={14} className="text-emeraldBrand-500" /> واتساب
      </a>
      <a href={fbHref} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold ${item}`}>
        <Facebook size={14} className="text-sky-600" /> فيسبوك
      </a>
      <button type="button" onClick={onCopy} className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs font-bold ${item}`}>
        {copied ? <Check size={14} className="text-emeraldBrand-500" /> : <Copy size={14} />}
        {copied ? "تم النسخ" : "نسخ الرابط"}
      </button>
    </div>
  );
}
