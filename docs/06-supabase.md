# 06 · Supabase

> Estado: **implementado**. Supabase es accedido por el **backend**, nunca por el frontend. La fuente autoritativa del esquema y las políticas es [`../supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql); el SQL de este documento es referencia didáctica.

## 1. Configuración

```bash
# Fase 1
supabase init
supabase start
supabase db reset
supabase gen types typescript --local > backend/src/types/database.types.ts
```

| Elemento | Valor |
| --- | --- |
| Motor | PostgreSQL 15+ (Supabase) |
| Esquema de dominio | `public` |
| API usada | Supabase JS SDK v2 **desde el backend** |
| Auth | Email + contraseña, sesión mediada por el backend |
| Cliente por usuario | JWT reenviado al SDK → RLS activo |
| Cliente admin | clave secreta (`sb_secret_…`) solo en `backend/`, para usuarios y roles |

## 2. Variables de entorno (solo nombres)

**`backend/.env.example`**

```text
PORT=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SESSION_COOKIE_NAME=
NODE_ENV=
```

> El backend también acepta las claves heredadas `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` como respaldo, pero Supabase las retira a fin de 2026.

**`frontend/.env.example`**

```text
API_BASE_URL=
```

> La clave secreta (`sb_secret_…`, antes `service_role`) **nunca** se incluye en `frontend/` ni en el bundle de Angular.

## 3. Clientes en el backend

```ts
// backend/src/config/supabase-user.client.ts (concepto)
createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${userToken}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});
```

```ts
// backend/src/config/supabase-admin.client.ts (concepto)
createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

| Cliente | Cuándo se usa | RLS |
| --- | --- | --- |
| `supabase-user.client` | Consultas y escrituras normales de iglesias, pastores y asistencia | **Sí aplica** |
| `supabase-admin.client` | `auth.admin.createUser`, asignación de rol, desactivación de usuarios | No aplica (propósito restringido) |

## 4. Autenticación mediada por el backend

1. El frontend envía `POST /api/auth/login` con correo y contraseña.
2. El backend llama a `supabase.auth.signInWithPassword` y obtiene `access_token` y `refresh_token`.
3. El backend consulta `profiles` + `roles` y arma el DTO del usuario.
4. El backend devuelve una cookie **httpOnly, Secure, SameSite=Lax** con la sesión.
5. En cada petición, `AuthGuard` (NestJS) lee la cookie, valida el JWT con `supabase.auth.getUser(token)` y expone el perfil mediante `@CurrentUser()`.
6. `RolesGuard` comprueba el rol contra `roles` usando la metadata de `@Roles()`.
7. `POST /api/auth/logout` llama a `supabase.auth.signOut()` y limpia la cookie.

**Reglas**

- El frontend no guarda tokens en `localStorage` ni los envía en headers; usa `withCredentials: true`.
- Un usuario sin rol activo recibe `403` y la app muestra «acceso pendiente» (fail-closed).
- El refresh de sesión se hace en el backend antes de responder `401`.

## 5. Trigger de perfil y funciones de rol

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

```sql
create or replace function public.current_role()
returns text
language sql stable
security definer set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid() and p.is_active;
$$;

revoke all on function public.current_role() from public;
grant execute on function public.current_role() to authenticated;

create or replace function public.current_profile()
returns public.profiles
language sql stable
security definer set search_path = public
as $$
  select * from public.profiles
  where id = auth.uid() and is_active;
$$;
```

> El rol se guarda en tabla, no en un claim editable por el cliente. Las funciones `security definer` evitan recursión en RLS.

## 6. Habilitar RLS

```sql
alter table public.roles enable row level security;
alter table public.regions enable row level security;
alter table public.districts enable row level security;
alter table public.churches enable row level security;
alter table public.pastors enable row level security;
alter table public.events enable row level security;
alter table public.attendances enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;
```

## 7. Políticas sugeridas

```sql
-- Lectura para usuarios autenticados
create policy "roles_read" on public.roles
  for select to authenticated using (true);

create policy "regions_read" on public.regions
  for select to authenticated using (is_active);

create policy "districts_read" on public.districts
  for select to authenticated using (is_active);

create policy "churches_read" on public.churches
  for select to authenticated using (is_active);

create policy "pastors_read" on public.pastors
  for select to authenticated using (is_active);

create policy "events_read" on public.events
  for select to authenticated using (is_active);

create policy "attendance_read" on public.attendances
  for select to authenticated using (true);

-- Escritura: solo administrador en catálogos estructurales
create policy "regions_write" on public.regions
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "districts_write" on public.districts
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Iglesias: solo administrador (según la regla confirmada)
create policy "churches_write" on public.churches
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Pastores: administrador u operador, con auditoría obligatoria del usuario en sesión
create policy "pastors_write" on public.pastors
  for all to authenticated
  using (public.current_role() in ('admin', 'operator'))
  with check (
    public.current_role() in ('admin', 'operator')
    and registered_by = auth.uid()
  );

-- Asistencia: administrador u operador, con auditoría obligatoria
create policy "attendance_insert" on public.attendances
  for insert to authenticated
  with check (
    public.current_role() in ('admin', 'operator')
    and registered_by = auth.uid()
  );

create policy "attendance_write" on public.attendances
  for update to authenticated
  using (public.current_role() in ('admin', 'operator'))
  with check (public.current_role() in ('admin', 'operator'));

-- Perfiles: el usuario ve el suyo; el administrador ve todos
create policy "profiles_read_self" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles_write_admin" on public.profiles
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Auditoría: solo administrador y consultor
create policy "audit_read" on public.audit_logs
  for select to authenticated
  using (public.current_role() in ('admin', 'viewer'));
```

**Notas importantes**

- Estas políticas se aplican cuando el backend usa el **cliente con JWT del usuario**.
- El cliente admin se usa solo en `POST /api/users` y operaciones de rol; esas acciones se validan también con `authorize('admin')`.
- El alcance por iglesia/distrito del rol `pastor` se afina comparando `current_profile().church_id`.
- Cada política nueva requiere pruebas con los cuatro roles.

## 8. Vistas, funciones RPC y triggers

| Objeto | Uso |
| --- | --- |
| `v_attendance_summary` | Reporte agrupado (ver [04-modelo-de-datos.md](04-modelo-de-datos.md)) |
| `current_role()` / `current_profile()` | Autorización y alcance |
| `handle_new_user()` | Creación automática de `profiles` |
| `set_updated_at()` | Trigger genérico de `updated_at` |
| `register_attendance(...)` | RPC opcional (si se decide mover la validación de duplicado a la BD) |

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

## 9. Migraciones y seed

```text
supabase/migrations/
├── 0001_create_roles.sql
├── 0002_create_regions_districts.sql
├── 0003_create_churches_pastors.sql
├── 0004_create_events_attendances.sql
├── 0005_create_profiles_audit.sql
├── 0006_enable_rls_policies.sql
└── 0007_views_functions.sql
supabase/seed.sql
```

- Una migración aplicada es inmutable; los cambios van en una nueva.
- `seed.sql` solo contiene roles, región, distrito y evento de prueba; nunca datos personales reales.
- Regenerar `backend/src/types/database.types.ts` tras cada migración.
- El backend usa esos tipos generados **solo** en `models/repositories`.

## 10. Storage y Realtime (fase futura)

- Bucket `church-images` (público, imágenes ≤ 2 MB), escritura restringida a `admin`/`operator`.
- Realtime para contadores del panel; no necesario en la Fase 1.

## 11. Checklist de producción

- [ ] RLS activo en todas las tablas y vistas.
- [ ] Clave secreta (`sb_secret_…`) presente solo en variables del backend.
- [ ] Clave secreta ausente del bundle de Angular.
- [ ] Políticas probadas con los cuatro roles.
- [ ] Cookie de sesión httpOnly/Secure/SameSite correctamente configurada.
- [ ] CORS restringido al dominio del frontend.
- [ ] Backups automáticos configurados.
- [ ] Logs sin contraseñas, tokens, correos ni teléfonos.
- [ ] Redirecciones de Auth permitidas solo al dominio oficial.
