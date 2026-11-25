# 14 · Guía para crear la base de datos en Supabase

Sigue estos pasos en orden. No necesitas instalar Supabase en tu computadora: todo se hace en el panel web.

## 1. Crear el proyecto

1. Entra a https://supabase.com y pulsa **New project**.
2. Elige una organización, un nombre (por ejemplo `convencion-ministerial`) y una contraseña segura para la base de datos.
3. Selecciona la región más cercana (por ejemplo `South America (São Paulo)`) y espera a que el proyecto esté listo.

## 2. Ejecutar la migración

1. En el menú lateral, entra a **SQL Editor**.
2. Pulsa **+ New query**.
3. Abre el archivo [`../supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql), copia **todo** su contenido y pégalo en el editor.
4. Pulsa **Run** (o `Ctrl + Enter`).
5. Debe terminar con `Success. No rows returned`. Si aparece un error, cópialo y revísalo antes de continuar.

> La migración crea tablas, índices, triggers, políticas RLS y la vista de reportes. Es seguro ejecutarla una sola vez en un proyecto nuevo.

## 3. Cargar los datos iniciales

1. En **SQL Editor**, crea otra query nueva.
2. Pega el contenido de [`../supabase/seed.sql`](../supabase/seed.sql).
3. Pulsa **Run**.

Esto crea los 4 roles, el departamento Cochabamba, el Distrito Central y el evento de la convención.

## 4. Crear al administrador

1. Ve a **Authentication → Users → Add user → Create new user**.
2. Ingresa el correo y contraseña del administrador y marca **Auto Confirm user**.
3. Pulsa **Create user**.
4. Vuelve a **SQL Editor** y ejecuta (cambia el correo por el real):

```sql
update public.profiles p
set role_id = r.id
from public.roles r, auth.users u
where p.id = u.id
  and u.email = 'admin@convencion.org'
  and r.name = 'admin';
```

5. Verifica el resultado:

```sql
select u.email, r.name as rol, p.is_active
from public.profiles p
join auth.users u on u.id = p.id
left join public.roles r on r.id = p.role_id;
```

Debe mostrar `admin` en la columna `rol`.

## 5. Obtener las claves del proyecto

1. Ve a **Project Settings → API**.
2. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (solo backend; **nunca** en el frontend)

## 6. Configurar el backend

Copia `backend/.env.example` a `backend/.env` y completa:

```text
PORT=3000
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
SESSION_COOKIE_NAME=convencion_session
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
```

## 7. Configurar el frontend

Angular no lee archivos `.env` directamente. Abre `frontend/src/environments/environment.ts` y confirma la URL de la API:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
};
```

Si el backend está en otra dirección, cambia `apiBaseUrl` y vuelve a compilar (`npm start` o `npm run build`). El archivo `frontend/.env.example` es solo una referencia documental.

## 8. Ejecutar la aplicación

En dos terminales separadas:

```bash
cd backend
npm install
npm run start:dev
```

```bash
cd frontend
npm install
npm start
```

Abre http://localhost:4200 e inicia sesión con el administrador.

## 9. Flujo recomendado de alto de datos

1. El **administrador** crea: departamento/región → distrito → iglesia → usuarios de registro.
2. El **usuario de registro** crea pastores (solo nombre y apellido) y registra la asistencia.
3. La fecha/hora y el usuario que registró se guardan **automáticamente** (`created_at` y `registered_by`).

## 10. Verificación rápida desde SQL

```sql
-- Pastores con fecha y usuario que los registró
select p.first_name, p.last_name, p.created_at, u.email as registrado_por
from public.pastors p
join public.profiles pr on pr.id = p.registered_by
join auth.users u on u.id = pr.id
order by p.created_at desc;

-- Asistencia por iglesia
select * from public.v_attendance_summary order by church_name;
```

## 11. Notas de seguridad

- El `service_role` se usa **solo en el backend** para crear usuarios y consultar perfiles.
- Las demás operaciones usan el JWT del usuario, por lo que **RLS** se aplica en cada consulta.
- El administrador es el único que puede crear departamentos/regiones, distritos, iglesias y usuarios.
- Los usuarios de registro (`operator`) solo crean pastores y asistencia.
- Si necesitas reiniciar el esquema en un proyecto de prueba, ejecuta la migración en un proyecto nuevo; no edites una migración ya aplicada.
