-- ==========================================================================
-- بديل أونلاين — جسر الإعلانات (موجة 25) · يُنفَّذ مرة واحدة في Supabase:
-- لوحة المشروع ← SQL Editor ← لصق ← Run
-- ==========================================================================

-- جدول الإعلانات: فهرسة خفيفة + جسم الإعلان كاملاً في jsonb
-- (يستوعب تطوّر حقول الإعلان مستقبلاً بلا ترحيل جدول)
create table if not exists public.ads (
  id         text primary key,
  ref        text not null,
  status     text not null default 'pending',
  created_at timestamptz not null default now(),
  data       jsonb not null
);
create index if not exists ads_status_idx  on public.ads (status);
create index if not exists ads_created_idx on public.ads (created_at desc);

-- سلة الصور العامة (روابط الصور تُخدم من CDN تخزين Supabase)
insert into storage.buckets (id, name, public)
values ('ads', 'ads', true)
on conflict (id) do nothing;

-- سياسات التخزين: قراءة عامة للصور، وكتابة/حذف لدور الخدمة فقط
drop policy if exists "ads public read"   on storage.objects;
drop policy if exists "ads service write" on storage.objects;
drop policy if exists "ads service del"   on storage.objects;
create policy "ads public read"   on storage.objects for select using (bucket_id = 'ads');
create policy "ads service write" on storage.objects for insert to service_role with check (bucket_id = 'ads');
create policy "ads service del"   on storage.objects for delete to service_role using (bucket_id = 'ads');

-- ملاحظة: الوصول للجدول يتم بمفتاح service role من خادم Next فقط
-- (SUPABASE_SERVICE_ROLE_KEY) فلا تُكشف سياسات الجدول للعامة.
