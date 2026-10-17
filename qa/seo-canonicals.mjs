/* ============================================================================
   فحص SEO — موجة 23: كل صفحة تعلن رابطها القانوني، والرئيسية تبدأ
   بـ«عقارات وسيارات»، والصفائح الرقيقة/القانونية مستبعدة من الفهرسة.
   التشغيل: node qa/seo-canonicals.mjs [url]
   ========================================================================== */
const BASE = process.argv[2] || "http://localhost:3000";
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`✅ ${name}`); }
  else { fail++; console.log(`❌ ${name} — ${extra}`); }
};
const head = async (path) => {
  const html = await fetch(`${BASE}${path}`, { cache: "no-store" }).then((r) => r.text());
  const g = (re) => (html.match(re) || [])[1] || "";
  return {
    title: g(/<title>([^<]*)<\/title>/),
    canonical: g(/<link rel="canonical" href="([^"]+)"/),
    robots: g(/<meta name="robots" content="([^"]+)"/),
    desc: g(/<meta name="description" content="([^"]*)"/),
  };
};

const home = await head("/");
ok(
  "عنوان الرئيسية يبدأ بـ«عقارات وسيارات»",
  home.title.startsWith("عقارات وسيارات"),
  home.title
);
ok("وصف الرئيسية يبدأ بـ«عقارات وسيارات»", home.desc.startsWith("عقارات وسيارات"), home.desc.slice(0, 40));
ok("canonical الرئيسية = الجذر", /vercel\.app\/?$|localhost:3000\/?$/.test(home.canonical), home.canonical);
ok("الرئيسية مفهرسة", !/noindex/.test(home.robots), home.robots);

for (const p of ["/privacy", "/terms", "/cookies"]) {
  const m = await head(p);
  ok(`${p}: noindex + canonical خاص`, /noindex/.test(m.robots) && m.canonical.endsWith(p), `${m.robots} | ${m.canonical}`);
}

for (const p of ["/category/furniture", "/category/real-estate", "/category/vehicles", "/about", "/how-it-works", "/car-types"]) {
  const m = await head(p);
  ok(`${p}: canonical = نفسه ومفهرس`, m.canonical.endsWith(p) && !/noindex/.test(m.robots), m.canonical);
}

for (const p of ["/post-ad", "/search", "/offline", "/ad/BD-8001"]) {
  const m = await head(p);
  ok(`${p}: مستبعد من الفهرسة`, /noindex/.test(m.robots), m.robots);
}

/* لا صفحة تحمل canonical الجذر سوى الرئيسية */
for (const p of ["/privacy", "/category/furniture", "/about"]) {
  const m = await head(p);
  ok(`${p}: لا يسند canonical الرئيسية`, !/vercel\.app\/"|localhost:3000\/"$/.test(m.canonical), m.canonical);
}

console.log(`\n══ النتيجة: ${pass} نجاح · ${fail} فشل ══`);
process.exit(fail ? 1 : 0);
