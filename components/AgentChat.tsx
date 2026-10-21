"use client";

/* ==========================================================================
   AgentChat.tsx — ودجت «وكيل بديل» فائق السرعة لمحادثة الزوار
   --------------------------------------------------------------------------
   - إجابات فورية فائقة السرعة للأسئلة الشائعة (0ms - 120ms).
   - باقة أسئلة متنوعة وإجابات دقيقة تغطي النشر، الصرف، الأقسام، والأمان.
   - خيار الرجوع والاستعادة التامة بعد الضغط على ✕ (مسح/إغلاق) دون ضياع المحادثة.
   - زر «رجوع لقائمة الأسئلة» تحت كل إجابة وفي الرأس للتنقل السلس.
   - تدهور آمن كامل ودعم الاتصال المباشر بواتساب والإدارة 0986801032.
   ========================================================================== */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { displayPhone, supportWhatsapp } from "@/lib/currency";
import {
  ArrowRight,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  Phone,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Msg {
  me: boolean;
  text: string;
  actionUrl?: string;
  actionText?: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: string;
}

const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "all", label: "الكل", icon: "✨" },
  { id: "post", label: "النشر", icon: "📢" },
  { id: "price", label: "الأسعار والصرف", icon: "💰" },
  { id: "cats", label: "الأقسام", icon: "🏷️" },
  { id: "support", label: "التواصل", icon: "📞" },
  { id: "safety", label: "الأمان", icon: "🛡️" },
];

interface FaqItem {
  id: string;
  category: "post" | "price" | "cats" | "support" | "safety";
  icon: string;
  q: string;
  keywords: string[];
  reply: (ctx: { phone: string; waUrl: string; fbUrl: string; usdToSyp: number }) => {
    text: string;
    actionUrl?: string;
    actionText?: string;
  };
}

const FAQS: FaqItem[] = [
  {
    id: "exchange-rate",
    category: "price",
    icon: "💰",
    q: "كم سعر صرف الدولار اليوم في الموقع؟",
    keywords: ["سعر الصرف", "الدولار", "دولار", "صرف", "ليرة", "الليرة", "كم الدولار", "تصريف"],
    reply: (ctx) => ({
      text: `سعر الصرف المعتمد في منصة بديل أونلاين حالياً:\n💵 1 دولار أمريكي = ${ctx.usdToSyp.toLocaleString("en-US")} ليرة سورية.\n\n📌 يتم تحديث السعر يدوياً من قِبل إدارة بديل باستمرار ليعكس واقع حركة السوق في منبج، وتُعرض كافة أسعار الإعلانات بالدولار والليرة معاً تلقائياً.`,
      actionUrl: "/search",
      actionText: "تصفّح الإعلانات بأسعار اليوم 🔍",
    }),
  },
  {
    id: "how-to-post",
    category: "post",
    icon: "📢",
    q: "كيف أنشر إعلاناً جديداً في الموقع؟",
    keywords: ["نشر", "كيف أنشر", "أعلن", "اعلن", "بيع", "كيف أضيف", "كيف اضيف", "انشر", "اضيف اعلان"],
    reply: () => ({
      text: `النشر في بديل أونلاين مجاني وسهل وبأربع خطوات بسيطة:\n\n1️⃣ اضغط على زر «أضف إعلانك» أعلى الموقع أو في شريط التنقل.\n2️⃣ اختر القسم (عقارات، سيارات، أثاث...) واملأ المواصفات الأساسية.\n3️⃣ حدد السعر أو اختر «السعر عند الطلب»، وارفع الصور الحقيقية من معرض هاتفك.\n4️⃣ اكتب اسمك ورقم هاتفك واضغط «معاينة ونشر».\n\n✨ نصيحة: يمكنك أيضاً الاستعانة بزر «صياغة وصف مقترح تلقائياً» لكتابة تفاصيل إعلانك بضغطة واحدة!`,
      actionUrl: "/post-ad",
      actionText: "الانتقال لصفحة إضافة إعلان 🚀",
    }),
  },
  {
    id: "post-via-whatsapp",
    category: "post",
    icon: "📲",
    q: "هل يمكنني النشر عبر واتساب مباشرة؟",
    keywords: ["نشر واتساب", "واتس اب", "ارسل بالواتس", "نشر بالواتس", "ما بدي عبي", "صعب علي"],
    reply: (ctx) => ({
      text: `نعم بكل سرور! إذا كان ملء النموذج صعباً عليك:\n\n📲 أرسل صور السلعة وتفاصيلها وسعرك مباشرة إلى رقم الإدارة:\n📞 ${ctx.phone}\n\nوسيقوم فريق بديل أونلاين بصياغة الإعلان وتنسيقه ونشره لك مجاناً فوراً دون أي عناء.`,
      actionUrl: ctx.waUrl,
      actionText: "مراسلة الإدارة عبر واتساب 💬",
    }),
  },
  {
    id: "review-time",
    category: "post",
    icon: "⏱️",
    q: "كم يستغرق قبول إعلاني ومراجعته؟",
    keywords: ["موافقة", "مراجعة", "تأخر", "ما ظهر", "لم يظهر", "قبول", "كم يستغرق", "متى ينزل"],
    reply: () => ({
      text: `تتم مراجعة الإعلانات من قِبل الإدارة لضمان جودة المحتوى وحماية المشترين من الإعلانات الوهمية.\n\n⏱️ تستغرق المراجعة عادة بين 5 دقائق إلى 30 دقيقة خلال ساعات العمل اليومية.\nبمجرد الموافقة، يظهر إعلانك فوراً في مقدمة الموقع والبحث، وتلقائياً على قنواتنا الرسمية.`,
    }),
  },
  {
    id: "is-it-free",
    category: "price",
    icon: "🆓",
    q: "هل النشر مجاني أم توجد أي عمولة؟",
    keywords: ["مجاني", "رسوم", "عمولة", "تكلفة", "اشتراك", "بفلوس", "مصاري", "نسبة"],
    reply: () => ({
      text: `النشر والتصفح في بديل أونلاين مجانيان بالكامل 100% 🎉:\n\n✅ لا توجد أي رسوم على إضافة الإعلانات.\n✅ لا نأخذ أي نسبة أو عمولة من البائع أو المشتري عند إتمام الصفقة.\n✅ التواصل يتم مباشرة بين الطرفين عبر الهاتف أو الواتساب دون أي وسيط أو تكاليف خفية.`,
    }),
  },
  {
    id: "categories",
    category: "cats",
    icon: "🏷️",
    q: "ما هي أقسام وتصنيفات الموقع؟",
    keywords: ["قسم", "أقسام", "اقسام", "تصنيف", "فئات", "ماذا يوجد", "شو بتبيعو", "شو في"],
    reply: () => ({
      text: `يضم موقع بديل أونلاين 6 أقسام رئيسية تلبي كافة احتياجات السوق في منبج:\n\n🏠 عقارات: شقق، منازل، أراضٍ، محلات ومزارع للبيع والإيجار.\n🚗 سيارات ومركبات: سيارات سياحية، بيك آب، دراجات، شاحنات.\n🛋️ أثاث منزلي: غرف نوم، صالونات، مجالس، ومفروشات.\n📺 أدوات كهربائية: ثلاجات، غسالات، شاشات، وأجهزة منزلية.\n📱 هواتف: هواتف ذكية (آيفون، سامسونغ، شاومي...) وإكسسوارات.\n👕 ملابس وأزياء: ملابس رجالية، نسائية، وأطفال.\n💼 وظائف: فرص عمل وعروض توظيف وبحث عن عمل.`,
      actionUrl: "/",
      actionText: "تصفّح أقسام بديل أونلاين 🏠",
    }),
  },
  {
    id: "contact-support",
    category: "support",
    icon: "📞",
    q: "كيف أتواصل مع إدارة بديل والدعم الفني؟",
    keywords: ["تواصل", "اتصال", "هاتف", "رقم", "واتس", "دعم", "مساعدة", "مكتب", "عنوان"],
    reply: (ctx) => ({
      text: `فريق إدارة بديل أونلاين في خدمتكم ومتاح للإجابة عن أي استفسار:\n\n📞 الهاتف المباشر: ${ctx.phone}\n💬 واتساب الدعم الفني: ${ctx.phone}\n📘 صفحتنا على فيسبوك: ${ctx.fbUrl || "متاحة في أسفل الموقع"}\n\nنسعد بملاحظاتكم واستفساراتكم دائماً!`,
      actionUrl: ctx.waUrl,
      actionText: "فتح محادثة واتساب الآن 💬",
    }),
  },
  {
    id: "edit-or-delete",
    category: "safety",
    icon: "✏️",
    q: "كيف أعدل أو أحذف إعلاني بعد النشر؟",
    keywords: ["تعديل", "حذف", "الغاء", "الغي", "تغيير السعر", "انباع", "تم البيع", "مسح الاعلان"],
    reply: (ctx) => ({
      text: `إذا أردت تعديل السعر أو الصور، أو تم بيع السلعة وأردت حذف الإعلان أو تمييزه كـ «تم البيع»:\n\n💬 تواصل مع الإدارة عبر واتساب:\n📞 ${ctx.phone}\nمع إرسال رمز الإعلان الخاص بك (مثل BD-8001) أو رقم الهاتف الذي سُجّل به الإعلان، وسيتم تنفيذ طلبك فوراً.`,
      actionUrl: ctx.waUrl,
      actionText: "طلب تعديل أو حذف إعلان ✏️",
    }),
  },
  {
    id: "safety-tips",
    category: "safety",
    icon: "🛡️",
    q: "كيف أضمن حقي وأتجنب الاحتيال؟",
    keywords: ["أمان", "امان", "نصب", "احتيال", "ضمان", "حق", "فحص", "معاينة", "نصائح"],
    reply: () => ({
      text: `لحماية نفسك وضمان حقك المالي دائماً نوصي بالقواعد الذهبية التالية:\n\n1️⃣ المعاينة على أرض الواقع: لا تشترِ سلعة أو تدفع قيمتها دون فحصها شخصياً ومعاينتها.\n2️⃣ لا ترسل أي عربون مسبق: احذر من تحويل أي مبالغ مالية مسبقة لأي شخص قبل المعاينة والاستلام.\n3️⃣ الأوراق والوثائق: في العقارات والسيارات، تأكد من صحة أوراق الملكية والفراغ القانوني النظامي.\n4️⃣ اللقاء في مكان عام ومعروف: يفضل دائماً أن تتم المعاينة والتسليم في مكان آمن وواضح.`,
    }),
  },
  {
    id: "coverage-area",
    category: "cats",
    icon: "📍",
    q: "هل يخدم الموقع مناطق خارج مدينة منبج؟",
    keywords: ["مناطق", "خارج منبج", "حلب", "ريف", "مدن", "محافظات", "تغطية"],
    reply: () => ({
      text: `التركيز الأساسي لـ بديل أونلاين هو مدينة منبج وريفها لتقديم خدمة بيع وشراء محلية موثوقة وسريعة للأهالي.\n\n📍 نرحب أيضاً بنشر عروض المحافظات والمناطق المجاورة، ويتم توضيح مكان السلعة بدقة في الإعلان لسهولة التنسيق بين البائع والمشتري.`,
    }),
  },
];

/** فحص المطابقة السريعة للأسئلة الشائعة */
function findMatchingFaq(q: string): FaqItem | null {
  const t = q.toLowerCase().trim();
  for (const item of FAQS) {
    if (item.keywords.some((kw) => t.includes(kw.toLowerCase()))) {
      return item;
    }
  }
  return null;
}

/** ردود القواعد المحلية الاحتياطية الدقيقة */
function ruleReply(
  q: string,
  phone: string,
  waUrl: string,
  fb: string,
  usdToSyp: number
): { text: string; actionUrl?: string; actionText?: string } {
  const t = q.toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => t.includes(w));
  const phoneLine = phone ? `\n📞 ${phone}` : "";

  if (has("سلام", "مرحب", "هلا", "هاي", "أهلا", "اهلا", "صباح", "مساء")) {
    return {
      text: `أهلاً بك في بديل أونلاين 🌟\nأنا وكيل المنصة الذكي — اسألني عن النشر، أسعار الصرف، الأقسام، أو التواصل المباشر.`,
    };
  }

  if (has("سعر الصرف", "الدولار", "دولار", "صرف", "ليرة", "الليرة", "تصريف")) {
    return {
      text: `سعر الصرف المعتمد في المنصة حالياً:\n💵 1 دولار أمريكي = ${usdToSyp.toLocaleString("en-US")} ل.س.\n\n📌 يتم تحديث السعر يدوياً من قِبل الإدارة أولاً بأول ليعكس واقع سوق منبج، وتُعرض أسعار الإعلانات بالدولار والليرة معاً تلقائياً.`,
      actionUrl: "/search",
      actionText: "تصفّح الإعلانات بسعر اليوم 🔍",
    };
  }

  if (has("نشر", "أعلن", "اعلن", "بيع", "كيف أضيف", "كيف اضيف", "انشر", "اضيف اعلان")) {
    return {
      text: `النشر مجاني وبأربع خطوات بسيطة:\n① اضغط «أضف إعلانك» أعلى الموقع.\n② اختر القسم واملأ التفاصيل والصور من معرض جهازك.\n③ حدد السعر أو اختر «السعر عند الطلب».\n④ أرسل — ويظهر إعلانك لكل الزوار بعد موافقة الإدارة.\n\n📲 كما يمكنك إرسال إعلانك وصورك لواتساب الإدارة وننشره لك مجاناً: ${phone}`,
      actionUrl: "/post-ad",
      actionText: "الانتقال لصفحة إضافة إعلان 🚀",
    };
  }

  if (has("واتس", "واتساب", "ارسل بالواتس", "نشر بالواتس")) {
    return {
      text: `نعم! يمكنك النشر عبر واتساب مباشرة بكل سهولة:\nأرسل صورك وتفاصيل ما تريد بيعه إلى رقم الإدارة:${phoneLine}\nوسيقوم فريق بديل أونلاين بصياغته ونشره لك مجاناً فوراً.`,
      actionUrl: waUrl,
      actionText: "مراسلة الإدارة عبر واتساب 💬",
    };
  }

  if (has("موافقة", "مراجعة", "تأخر", "ما ظهر", "لم يظهر", "قبول", "كم يستغرق")) {
    return {
      text: `كل إعلان جديد يمر بمراجعة الإدارة قبل الظهور لضمان الجودة وحماية المشترين من الإعلانات الوهمية.\n\n⏱️ تستغرق المراجعة عادة بين 5 دقائق إلى 30 دقيقة خلال ساعات العمل. بمجرد الموافقة يظهر إعلانك فوراً للجميع.`,
    };
  }

  if (has("مجاني", "رسوم", "عمولة", "تكلفة", "اشتراك", "بفلوس", "مصاري")) {
    return {
      text: `النشر والتصفح في بديل أونلاين مجانيان بالكامل 100% 🎉:\n✅ لا توجد أي رسوم على إضافة الإعلانات.\n✅ لا نأخذ أي عمولة من البائع أو المشتري.\n✅ التواصل يتم مباشرة بين الطرفين دون أي وسيط.`,
    };
  }

  if (has("قسم", "أقسام", "اقسام", "تصنيف", "فئات")) {
    return {
      text: `أقسام الموقع الرئيسية في منبج:\n🏠 عقارات (بيع وإيجار) · 🚗 سيارات ومركبات · 🛋️ أثاث منزلي · 📺 أجهزة كهربائية · 📱 هواتف · 👕 ملابس · 💼 وظائف (عرض وطلب).`,
      actionUrl: "/",
      actionText: "تصفّح الأقسام الرئيسية 🏠",
    };
  }

  if (has("تعديل", "حذف", "الغاء", "الغي", "انباع", "تم البيع")) {
    return {
      text: `لتعديل إعلانك أو حذفه بعد البيع:\nراسل الإدارة على واتساب مع ذكر رمز إعلانك (مثل BD-8001):${phoneLine}\n💬 واتساب: ${waUrl}\nوسيتم التعديل أو وضع شارة «تم البيع» فوراً.`,
      actionUrl: waUrl,
      actionText: "طلب تعديل أو حذف إعلان ✏️",
    };
  }

  if (has("أمان", "امان", "نصب", "احتيال", "نصائح")) {
    return {
      text: `قواعد الأمان عند الشراء:\n① عاين السلعة أو العقار شخصياً قبل الدفع.\n② لا تقم بتحويل أي عربون مسبق قبل الاستلام والفحص.\n③ تأكد من سلامة أوراق الملكية في السيارات والعقارات.`,
    };
  }

  if (has("تواصل", "اتصال", "هاتف", "رقم", "دعم", "مساعدة")) {
    return {
      text: `الإدارة جاهزة لخدمتك يومياً:${phoneLine}\n💬 واتساب: ${waUrl}${fb ? `\n📘 فيسبوك: ${fb}` : ""}`,
      actionUrl: waUrl,
      actionText: "مراسلة الإدارة عبر واتساب 💬",
    };
  }

  if (has("فيسبوك", "صفحة")) {
    return {
      text: fb
        ? `صفحتنا الرسمية على فيسبوك:\n${fb}`
        : `صفحتنا على فيسبوك: https://www.facebook.com/share/1cmT94zzJk/`,
      actionUrl: fb || "https://www.facebook.com/share/1cmT94zzJk/",
      actionText: "زيارة صفحة فيسبوك 📘",
    };
  }

  return {
    text: `سؤال مهم! للإجابة الدقيقة يمكنك التواصل مع الإدارة مباشرة:${phoneLine}\n💬 واتساب: ${waUrl}\nأو اختر من قائمة الأسئلة السريعة المتاحة في الأعلى.`,
    actionUrl: waUrl,
    actionText: "تواصل مع الإدارة عبر واتساب 💬",
  };
}

export default function AgentChat() {
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");
  const [showQuestionsCatalog, setShowQuestionsCatalog] = useState(true);
  const [lastClearedMsgs, setLastClearedMsgs] = useState<Msg[] | null>(null);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      me: false,
      text: "أهلاً بك! أنا «وكيل بديل» الذكي 🤖\nاسألني عن النشر، أسعار الصرف، الأقسام، أو التواصل مع الإدارة، وسأجيبك فوراً وبدقة.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const phone = displayPhone(settings.contactPhone, settings.whatsappCountryCode);
  const waUrl = supportWhatsapp(settings.contactPhone, settings.whatsappCountryCode);
  const fb = String(settings.facebookUrl ?? "").trim();
  const usdToSyp = settings.usdToSyp || 15000;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, open]);

  /* تصفية الأسئلة حسب الفئة المختارة */
  const filteredFaqs = useMemo(() => {
    if (selectedCat === "all") return FAQS;
    return FAQS.filter((f) => f.category === selectedCat);
  }, [selectedCat]);

  /* النقر على سؤال سريع للإجابة الفورية */
  function handleSelectQuestion(item: FaqItem) {
    const q = item.q;
    const res = item.reply({ phone, waUrl, fbUrl: fb, usdToSyp });
    setLastClearedMsgs(null);
    setMsgs((p) => [
      ...p,
      { me: true, text: q },
      { me: false, text: res.text, actionUrl: res.actionUrl, actionText: res.actionText },
    ]);
  }

  /* الرجوع إلى قائمة الأسئلة الرئيسية */
  function handleBackToQuestions() {
    setShowQuestionsCatalog(true);
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* مسح المحادثة بالضغط على ✕ مع حفظ نسخة للتراجع */
  function handleClearChat() {
    if (msgs.length <= 1) return;
    setLastClearedMsgs(msgs);
    setMsgs([
      {
        me: false,
        text: "أهلاً بك مجدداً! تم مسح المحادثة.\nيمكنك اختيار أي سؤال من القائمة أدناه أو الضغط على «تراجع / رجوع» لاستعادة ما سبق.",
      },
    ]);
    setShowQuestionsCatalog(true);
  }

  /* استعادة المحادثة بعد الضغط على ✕ (تراجع / رجوع) */
  function handleRestoreChat() {
    if (!lastClearedMsgs) return;
    setMsgs(lastClearedMsgs);
    setLastClearedMsgs(null);
  }

  /* إرسال سؤال حر */
  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setDraft("");
    setLastClearedMsgs(null);
    setMsgs((p) => [...p, { me: true, text: q }]);
    setBusy(true);

    /* 1) مطابقة سريعة محلية (0-100ms) */
    const matchedFaq = findMatchingFaq(q);
    if (matchedFaq) {
      const res = matchedFaq.reply({ phone, waUrl, fbUrl: fb, usdToSyp });
      setTimeout(() => {
        setMsgs((p) => [
          ...p,
          { me: false, text: res.text, actionUrl: res.actionUrl, actionText: res.actionText },
        ]);
        setBusy(false);
      }, 100);
      return;
    }

    /* 2) استدعاء /api/ai بمهلة أقصاها 3.5 ثوانٍ مع تدهور آمن فوراً */
    let replyText: string | null = null;
    let actionUrl: string | undefined;
    let actionText: string | undefined;

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 3500);
      const history = msgs.slice(-6).map((m) => ({
        role: m.me ? ("user" as const) : ("assistant" as const),
        text: m.text,
      }));
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (r.ok) {
        const j = (await r.json()) as { reply?: string | null; ai?: boolean };
        if (j.ai && j.reply) replyText = j.reply;
      }
    } catch {
      /* مهلة أو خطأ شبكة — ننتقل مباشرة للرد الذكي المحلي */
    }

    if (!replyText) {
      const fallback = ruleReply(q, phone, waUrl, fb, usdToSyp);
      replyText = fallback.text;
      actionUrl = fallback.actionUrl;
      actionText = fallback.actionText;
    }

    setMsgs((p) => [...p, { me: false, text: replyText!, actionUrl, actionText }]);
    setBusy(false);
  }

  return (
    <>
      {/* الزر العائم — يمين الشاشة، فوق شريط التواصل على الجوال */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-pop transition hover:scale-105 hover:bg-emerald-500 sm:bottom-4 no-print"
        aria-label={open ? "إغلاق محادثة الوكيل" : "محادثة وكيل بديل"}
        data-qa="agent-chat-btn"
      >
        {open ? <X size={20} /> : <span className="text-xl">🤖</span>}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-4 z-40 flex h-[min(540px,78vh)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop sm:bottom-16 dark:border-slate-800 dark:bg-navy-900 no-print"
          data-qa="agent-chat-panel"
        >
          {/* الرأس */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-base shadow-sm">
                🤖
              </span>
              <div>
                <p className="text-sm font-extrabold leading-tight">وكيل بديل الذكي</p>
                <p className="text-[11px] opacity-85 leading-tight">يجيبك فوراً وبدقة — 24/7</p>
              </div>
            </div>

            {/* أدوات التحكم في الرأس: رجوع + مسح + إغلاق */}
            <div className="flex items-center gap-1.5">
              {msgs.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleBackToQuestions}
                    title="الرجوع لقائمة الأسئلة"
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-[11px] font-bold text-white transition hover:bg-white/25"
                  >
                    <ArrowRight size={12} />
                    <span>رجوع</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="مسح المحادثة (مع خيار التراجع)"
                    className="rounded-lg bg-white/15 p-1 text-white transition hover:bg-white/25"
                    aria-label="مسح المحادثة"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white/90 transition hover:bg-white/20"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* شريط استعادة المحادثة بعد الضغط على ✕ (مسح) */}
          {lastClearedMsgs && (
            <div className="flex items-center justify-between border-b border-amberBrand-200 bg-amberBrand-50 px-3 py-2 text-xs text-amberBrand-900 dark:border-amberBrand-800/60 dark:bg-amberBrand-950/40 dark:text-amberBrand-200">
              <span>تم مسح المحادثة.</span>
              <button
                type="button"
                onClick={handleRestoreChat}
                className="inline-flex items-center gap-1 font-extrabold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                <Undo2 size={13} />
                <span>↩️ تراجع / رجوع للمحادثة</span>
              </button>
            </div>
          )}

          {/* الرسائل والأسئلة السريعة */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                  m.me
                    ? "mr-auto bg-emerald-600 text-white rounded-br-sm"
                    : "ml-auto bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-bl-sm"
                }`}
                data-qa={m.me ? "agent-msg-user" : "agent-msg-bot"}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* أزرار الإجراءات السريعة والرجوع تحت رد البوت */}
                {!m.me && i > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-slate-200/70 pt-2 dark:border-slate-700/70">
                    <button
                      type="button"
                      onClick={handleBackToQuestions}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:bg-navy-900 dark:text-emerald-400 dark:hover:bg-navy-950"
                    >
                      <RotateCcw size={11} />
                      <span>↩️ رجوع لقائمة الأسئلة</span>
                    </button>

                    {m.actionUrl && (
                      <a
                        href={m.actionUrl}
                        target={m.actionUrl.startsWith("http") ? "_blank" : undefined}
                        rel={m.actionUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-500"
                      >
                        <span>{m.actionText || "زيارة الرابط"}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="ml-auto flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2 text-[12.5px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                <span>…يكتب الوكيل الذكي</span>
              </div>
            )}

            {/* كتالوج الأسئلة السريعة المتنوعة */}
            {showQuestionsCatalog && (
              <div className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-navy-800/50">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-navy-900 dark:text-white">
                    <Sparkles size={13} className="text-amberBrand-500" />
                    <span>أسئلة شائعة سريعة (اختر سؤالاً):</span>
                  </span>
                  {msgs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowQuestionsCatalog(false)}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:text-slate-400"
                    >
                      إخفاء
                    </button>
                  )}
                </div>

                {/* ألسنة التصنيفات */}
                <div className="mb-2.5 flex flex-wrap gap-1">
                  {FAQ_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCat(cat.id)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                        selectedCat === cat.id
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-200 dark:bg-navy-900 dark:text-slate-300 dark:hover:bg-navy-700"
                      }`}
                    >
                      <span>{cat.icon}</span> <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* شبكة الأسئلة */}
                <div className="grid gap-1.5">
                  {filteredFaqs.map((faq) => (
                    <button
                      type="button"
                      key={faq.id}
                      onClick={() => handleSelectQuestion(faq)}
                      className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white p-2 text-right text-[12px] font-semibold text-slate-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50/70 hover:text-emerald-900 dark:border-slate-700 dark:bg-navy-900 dark:text-slate-100 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                    >
                      <span className="text-sm shrink-0">{faq.icon}</span>
                      <span className="flex-1 leading-snug">{faq.q}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">←</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* شريط الإدخال والتبديل السريع */}
          <div className="border-t border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-navy-950/60">
            {!showQuestionsCatalog && (
              <div className="mb-1.5 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setShowQuestionsCatalog(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  <Sparkles size={12} />
                  <span>💡 إظهار قائمة الأسئلة السريعة ({FAQS.length})</span>
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اكتب استفسارك بحرية…"
                maxLength={600}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-[13px] text-slate-800 outline-none transition focus:border-emerald-600 dark:border-slate-700 dark:bg-navy-900 dark:text-slate-100"
                data-qa="agent-chat-input"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-[13px] font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50 shadow-sm"
                data-qa="agent-chat-send"
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
