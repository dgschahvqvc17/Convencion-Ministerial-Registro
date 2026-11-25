-- 44° Convención Ministerial — esquema inicial
-- Ejecutar en Supabase → SQL Editor → New query → Run

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Tipos
-- ============================================================
do $$ begin
  create type public.role_name as enum ('admin', 'operator', 'pastor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.region_kind as enum ('departamento', 'region');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('registered', 'confirmed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 2. Catálogos base
-- ============================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.role_name not null unique,
  description text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id uuid references public.roles (id),
  full_name text not null,
  region_id uuid,
  district_id uuid,
  church_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.region_kind not null,
  country text not null default 'Bolivia',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions (id),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts (id),
  lead_pastor_id uuid,
  name text not null,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Solo nombre y apellido del pastor. La fecha/hora y el usuario que lo
-- registró se guardan automáticamente en created_at y registered_by.
create table if not exists public.pastors (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches (id),
  first_name text not null,
  last_name text not null,
  registered_by uuid not null references public.profiles (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  motto text,
  start_date date not null,
  end_date date not null,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint events_dates_check check (end_date >= start_date)
);

create table if not exists public.attendances (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id),
  pastor_id uuid not null references public.pastors (id),
  registered_by uuid not null references public.profiles (id),
  status public.attendance_status not null default 'registered',
  checked_in_at timestamptz not null default now(),
  notes text,
  constraint attendances_unique_pastor_event unique (event_id, pastor_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. Relaciones diferidas (resuelve la circularidad iglesia ↔ pastor)
-- ============================================================
alter table public.churches
  add constraint churches_lead_pastor_fkey
  foreign key (lead_pastor_id) references public.pastors (id);

alter table public.profiles
  add constraint profiles_region_fkey foreign key (region_id) references public.regions (id),
  add constraint profiles_district_fkey foreign key (district_id) references public.districts (id),
  add constraint profiles_church_fkey foreign key (church_id) references public.churches (id);

-- Un pastor responsable dirige como máximo una iglesia activa.
create unique index if not exists churches_one_lead_pastor
  on public.churches (lead_pastor_id)
  where lead_pastor_id is not null and is_active;

-- Unicidad de nombres dentro del padre.
create unique index if not exists regions_unique_active_name
  on public.regions (lower(name), kind, country) where is_active;
create unique index if not exists districts_unique_active_name
  on public.districts (region_id, lower(name)) where is_active;
create unique index if not exists churches_unique_active_name
  on public.churches (district_id, lower(name)) where is_active;

-- ============================================================
-- 4. Índices de consulta
-- ============================================================
create index if not exists districts_region_id_idx on public.districts (region_id);
create index if not exists churches_district_id_idx on public.churches (district_id);
create index if not exists churches_lead_pastor_id_idx on public.churches (lead_pastor_id);
create index if not exists pastors_church_id_idx on public.pastors (church_id);
create index if not exists pastors_name_idx on public.pastors (lower(last_name), lower(first_name));
create index if not exists attendances_event_pastor_idx on public.attendances (event_id, pastor_id);
create index if not exists attendances_event_date_idx on public.attendances (event_id, checked_in_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity, entity_id);

-- ============================================================
-- 5. Funciones y triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_regions_updated on public.regions;
create trigger trg_regions_updated before update on public.regions
  for each row execute function public.set_updated_at();
drop trigger if exists trg_districts_updated on public.districts;
create trigger trg_districts_updated before update on public.districts
  for each row execute function public.set_updated_at();
drop trigger if exists trg_churches_updated on public.churches;
create trigger trg_churches_updated before update on public.churches
  for each row execute function public.set_updated_at();
drop trigger if exists trg_pastors_updated on public.pastors;
create trigger trg_pastors_updated before update on public.pastors
  for each row execute function public.set_updated_at();
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea automáticamente el perfil cuando se da de alta un usuario en Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rol actual del usuario autenticado ( evita recursión en RLS ).
create or replace function public.current_role()
returns public.role_name
language sql stable security definer set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid() and p.is_active;
$$;

create or replace function public.current_profile()
returns public.profiles
language sql stable security definer set search_path = public
as $$
  select * from public.profiles where id = auth.uid() and is_active;
$$;

revoke all on function public.current_role() from public;
revoke all on function public.current_profile() from public;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_profile() to authenticated;

-- ============================================================
-- 6. Row Level Security
-- ============================================================
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.regions enable row level security;
alter table public.districts enable row level security;
alter table public.churches enable row level security;
alter table public.pastors enable row level security;
alter table public.events enable row level security;
alter table public.attendances enable row level security;
alter table public.audit_logs enable row level security;

-- Lectura
drop policy if exists "roles_read" on public.roles;
create policy "roles_read" on public.roles for select to authenticated using (true);

drop policy if exists "regions_read" on public.regions;
create policy "regions_read" on public.regions for select to authenticated using (is_active);
drop policy if exists "districts_read" on public.districts;
create policy "districts_read" on public.districts for select to authenticated using (is_active);
drop policy if exists "churches_read" on public.churches;
create policy "churches_read" on public.churches for select to authenticated using (is_active);
drop policy if exists "pastors_read" on public.pastors;
create policy "pastors_read" on public.pastors for select to authenticated using (is_active);
drop policy if exists "events_read" on public.events;
create policy "events_read" on public.events for select to authenticated using (is_active);
drop policy if exists "attendance_read" on public.attendances;
create policy "attendance_read" on public.attendances for select to authenticated using (true);

-- Escritura: SOLO administrador crea departamentos/regiones, distritos, iglesias y usuarios.
drop policy if exists "regions_write" on public.regions;
create policy "regions_write" on public.regions for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
drop policy if exists "districts_write" on public.districts;
create policy "districts_write" on public.districts for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
drop policy if exists "churches_write" on public.churches;
create policy "churches_write" on public.churches for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- Usuarios de registro (operator) crean pastores y asistencia; admin también.
drop policy if exists "pastors_write" on public.pastors;
create policy "pastors_write" on public.pastors for all to authenticated
  using (public.current_role() in ('admin', 'operator'))
  with check (
    public.current_role() in ('admin', 'operator')
    and registered_by = auth.uid()
  );

drop policy if exists "attendance_insert" on public.attendances;
create policy "attendance_insert" on public.attendances for insert to authenticated
  with check (
    public.current_role() in ('admin', 'operator')
    and registered_by = auth.uid()
  );
drop policy if exists "attendance_write" on public.attendances;
create policy "attendance_write" on public.attendances for update to authenticated
  using (public.current_role() in ('admin', 'operator'))
  with check (public.current_role() in ('admin', 'operator'));

-- Perfiles
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.current_role() = 'admin');
drop policy if exists "profiles_write" on public.profiles;
create policy "profiles_write" on public.profiles for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "audit_read" on public.audit_logs;
create policy "audit_read" on public.audit_logs for select to authenticated
  using (public.current_role() in ('admin', 'viewer'));

-- ============================================================
-- 7. Vista de reporte
-- ============================================================
create or replace view public.v_attendance_summary as
select
  r.id as region_id, r.name as region_name,
  d.id as district_id, d.name as district_name,
  c.id as church_id, c.name as church_name,
  count(a.id) filter (where a.status <> 'cancelled') as total_registered,
  count(a.id) filter (where a.status = 'confirmed') as total_confirmed,
  max(a.checked_in_at) as last_check_in
from public.regions r
join public.districts d on d.region_id = r.id and d.is_active
left join public.churches c on c.district_id = d.id and c.is_active
left join public.pastors p on p.church_id = c.id and p.is_active
left join public.attendances a on a.pastor_id = p.id
group by r.id, r.name, d.id, d.name, c.id, c.name;
