# Backend

API REST **MVC** sobre **NestJS + TypeScript**. Supabase es la capa de datos y autenticación.

> Estado: **implementado**. `npm run typecheck`, `npm run build` y `npm test` pasan correctamente.

## Ejecutar

```bash
cp .env.example .env   # completes las claves de Supabase
npm install
npm run start:dev
```

API: http://localhost:3000/api · Health: `GET /api/health`

## Estructura implementada

```text
src/
├── main.ts                     # bootstrap: /api, CORS, cookie, ValidationPipe, filtro, interceptor
├── app.module.ts               # módulo raíz + guards globales
├── config/
│   ├── env.ts                  # variables y validateEnv()
│   └── supabase.service.ts     # cliente admin y cliente por usuario (RLS)
├── modules/
│   ├── core.module.ts          # proveedores globales (repositorios + servicios)
│   ├── auth.module.ts
│   ├── structure.module.ts
│   └── registration.module.ts
├── models/
│   ├── entities/               # tipos del dominio
│   ├── repositories/           # único acceso a Supabase
│   └── services/               # reglas de negocio (@Injectable)
├── views/
│   ├── dtos/                   # class-validator + contratos de respuesta
│   └── mappers/                # entidad → DTO público
├── controllers/                # endpoints HTTP (@Controller)
├── guards/                     # AuthGuard + RolesGuard (APP_GUARD)
├── decorators/                 # @Public, @Roles, @CurrentUser
├── interceptors/               # envoltura { data }
├── filters/                    # AppError / HttpException → ApiError
├── errors/                     # AppError y códigos
└── types/                      # (reservado para database.types.ts)
```

## Correspondencia MVC

| Letra | Implementación |
| --- | --- |
| Model | `models/services` + `models/repositories` + `models/entities` |
| View | `views/dtos` + `views/mappers` (JSON, no HTML) |
| Controller | `controllers/` con decoradores de NestJS |

## Reglas

1. Controladores delgados: validan y delegan en un service.
2. La lógica de negocio vive en `models/services`.
3. Solo `models/repositories` importa `@supabase/supabase-js`.
4. Las vistas solo transforman entidades a JSON.
5. La validación usa `class-validator` + `ValidationPipe` global.
6. `AppError` se serializa en `AllExceptionsFilter`.
7. `@Public()` permite `login`, `logout` y `health` sin sesión.

## Seguridad

- Cookie httpOnly/Secure/SameSite=Lax con Access + Refresh token de Supabase.
- `AuthGuard` valida el JWT y adjunta `req.user`; `RolesGuard` lee `@Roles()`.
- Cliente `service_role` solo para Auth y perfiles; nunca se envía al frontend.
- Los repositorios usan el JWT del usuario para que RLS se aplique.

## Pruebas

```bash
npm test            # Jest (unitarias de servicios)
npm run typecheck   # tsc --noEmit
npm run build       # nest build
```

Contrato detallado: [`../docs/13-api-rest.md`](../docs/13-api-rest.md).
Base de datos: [`../docs/14-guia-supabase.md`](../docs/14-guia-supabase.md).
