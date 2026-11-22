-- PİKAM Dergi — Supabase şeması
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın. Tekrar çalıştırmak güvenlidir.

-- 1) Site içeriği: her anahtar (articles, authors, issues, hero, sections, nav,
--    kunye, header, footer, notes) tek bir JSON belgesi olarak tutulur.
create table if not exists public.content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2) Yöneticiler: buraya eklenen auth kullanıcıları /admin paneline girebilir.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 3) Okur profilleri (Supabase Auth ile kayıt olan kullanıcılar)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  interests text not null default '',
  created_at timestamptz not null default now()
);

-- Yeni kayıt olan her kullanıcı için profil satırı otomatik oluşur.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, interests)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'interests', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Yazı yorumları
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  article_title text not null default '',
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_article_idx on public.comments (article_id, created_at desc);

-- 5) Bülten aboneleri
create table if not exists public.newsletter (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- ---------- Satır düzeyi güvenlik (RLS) ----------
alter table public.content    enable row level security;
alter table public.admins     enable row level security;
alter table public.profiles   enable row level security;
alter table public.comments   enable row level security;
alter table public.newsletter enable row level security;

drop policy if exists "content public read"  on public.content;
drop policy if exists "content admin write"  on public.content;
create policy "content public read" on public.content for select using (true);
create policy "content admin write" on public.content for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins for select using (user_id = auth.uid());

drop policy if exists "profiles own or admin read" on public.profiles;
drop policy if exists "profiles own update"        on public.profiles;
drop policy if exists "profiles admin delete"      on public.profiles;
create policy "profiles own or admin read" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles admin delete" on public.profiles for delete using (public.is_admin());

drop policy if exists "comments public read"   on public.comments;
drop policy if exists "comments member insert" on public.comments;
drop policy if exists "comments owner or admin delete" on public.comments;
create policy "comments public read" on public.comments for select using (true);
create policy "comments member insert" on public.comments for insert
  to authenticated with check (user_id = auth.uid());
create policy "comments owner or admin delete" on public.comments for delete
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "newsletter anyone subscribe" on public.newsletter;
drop policy if exists "newsletter admin read"       on public.newsletter;
drop policy if exists "newsletter admin delete"     on public.newsletter;
create policy "newsletter anyone subscribe" on public.newsletter for insert with check (true);
create policy "newsletter admin read"   on public.newsletter for select using (public.is_admin());
create policy "newsletter admin delete" on public.newsletter for delete using (public.is_admin());

-- ---------- Dosya deposu: kapaklar, görseller, PDF'ler ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media public read"  on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ---------- İlk yöneticiyi ekleme ----------
-- 1. Authentication > Users > "Add user" ile yönetici e-posta/şifresini oluşturun.
-- 2. Sonra şunu çalıştırın (e-postayı değiştirin):
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'yonetici@ornek.com'
--    on conflict do nothing;
