-- =====================================================================
--  hikaru2025 · Esquema de base de datos
--  Ejecuta este archivo completo en Supabase > SQL Editor > New query
--  (es seguro volver a ejecutarlo: no borra datos)
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Administradores: solo los usuarios de esta tabla pueden editar
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
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

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Textos generales del sitio (clave / valor)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Servicios / categorías (Páginas web, Automatización, WhatsApp…)
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title            text not null,
  short_tag        text not null default '',
  eyebrow          text not null default '',
  description      text not null default '',
  projects_heading text not null default '',
  image_url        text,
  image_caption    text not null default '',
  illustration     text not null default 'browser'
                   check (illustration in ('browser', 'flow', 'chat', 'none')),
  highlight        boolean not null default false,
  sort_order       int not null default 0,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Proyectos / ejemplos (con link directo a la página)
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid references public.services(id) on delete set null,
  title       text not null,
  description text not null default '',
  url         text,
  image_url   text,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Paquetes y precios
-- ---------------------------------------------------------------------
create table if not exists public.packages (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid references public.services(id) on delete set null,
  tag         text not null default '',
  title       text not null,
  price_label text not null default '',
  features    text not null default '',   -- una línea por elemento
  highlight   boolean not null default false,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Medios de contacto
-- ---------------------------------------------------------------------
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  value      text not null default '',
  url        text,
  sort_order int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Solicitudes enviadas desde el formulario
-- ---------------------------------------------------------------------
create table if not exists public.requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (char_length(email) between 3 and 200 and email like '%@%'),
  service_id uuid references public.services(id) on delete set null,
  category   text not null default '' check (char_length(category) <= 200),
  message    text not null default '' check (char_length(message) <= 5000),
  status     text not null default 'nueva' check (status in ('nueva', 'en_proceso', 'cerrada')),
  created_at timestamptz not null default now()
);

create index if not exists requests_created_idx on public.requests (created_at desc);

-- =====================================================================
--  Seguridad (Row Level Security)
-- =====================================================================
alter table public.admins   enable row level security;
alter table public.settings enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.packages enable row level security;
alter table public.contacts enable row level security;
alter table public.requests enable row level security;

grant select on public.settings, public.services, public.projects,
               public.packages, public.contacts to anon, authenticated;
grant insert on public.requests to anon, authenticated;
grant select, insert, update, delete on public.settings, public.services,
               public.projects, public.packages, public.contacts,
               public.requests to authenticated;
grant select on public.admins to authenticated;

drop policy if exists "admins: ver propio registro" on public.admins;
create policy "admins: ver propio registro" on public.admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "settings: lectura pública" on public.settings;
create policy "settings: lectura pública" on public.settings
  for select using (true);
drop policy if exists "settings: admin escribe" on public.settings;
create policy "settings: admin escribe" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Contenido: el público solo ve lo activo; el admin ve y edita todo
do $$
declare t text;
begin
  foreach t in array array['services', 'projects', 'packages', 'contacts'] loop
    execute format('drop policy if exists "%s: lectura" on public.%I', t, t);
    execute format('create policy "%s: lectura" on public.%I for select using (active or public.is_admin())', t, t);
    execute format('drop policy if exists "%s: admin escribe" on public.%I', t, t);
    execute format('create policy "%s: admin escribe" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- Solicitudes: cualquiera puede enviar, solo el admin puede leer/editar
drop policy if exists "requests: enviar" on public.requests;
create policy "requests: enviar" on public.requests
  for insert to anon, authenticated with check (status = 'nueva');
drop policy if exists "requests: admin lee" on public.requests;
create policy "requests: admin lee" on public.requests
  for select to authenticated using (public.is_admin());
drop policy if exists "requests: admin actualiza" on public.requests;
create policy "requests: admin actualiza" on public.requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "requests: admin borra" on public.requests;
create policy "requests: admin borra" on public.requests
  for delete to authenticated using (public.is_admin());

-- =====================================================================
--  Almacenamiento de imágenes (bucket público "media")
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media: lectura pública" on storage.objects;
create policy "media: lectura pública" on storage.objects
  for select using (bucket_id = 'media');
drop policy if exists "media: admin sube" on storage.objects;
create policy "media: admin sube" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media: admin actualiza" on storage.objects;
create policy "media: admin actualiza" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media: admin borra" on storage.objects;
create policy "media: admin borra" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
