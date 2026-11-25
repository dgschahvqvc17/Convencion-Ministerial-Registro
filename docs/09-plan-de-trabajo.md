# 09 · Plan de trabajo

> Estimación inicial en fases. Cada fase termina con algo verificable y documentado.

## Fase 0 — Documentación y arquitectura (estado actual)

**Entregable:** documentación y esqueleto de carpetas `backend/` y `frontend/`.

- [x] Contexto y alcance
- [x] Requisitos e historias de usuario
- [x] Propuesta de roles y permisos
- [x] Modelo de datos y DDL sugerido
- [x] Arquitectura MVC y contrato de API REST
- [x] Estándares de código y plan
- [x] Carpetas `backend/` y `frontend/` con su README
- [ ] Validación de supuestos por el usuario (ver [10](10-glosario-y-supuestos.md))

**Criterio de salida:** el usuario confirma roles, jerarquía y significado de «REA».

## Fase 1 — Cimientos del proyecto

**Entregable:** backend MVC, frontend Angular MVC y Supabase local ejecutables.

- [ ] `backend/`: proyecto NestJS + TypeScript con `main.ts`/`app.module.ts` y módulos por feature
- [ ] `frontend/`: `ng new` con standalone, TypeScript estricto y SCSS
- [ ] ESLint, Prettier, Jest + Supertest en backend; Vitest + Playwright en frontend
- [ ] Variables de entorno en `backend/.env.example` y `frontend/.env.example`
- [ ] Clientes `supabase-user.client.ts` y `supabase-admin.client.ts`
- [ ] `supabase init`, primeras migraciones y seed
- [ ] Generación de `backend/src/types/database.types.ts`
- [ ] CORS, cookie de sesión, ValidationPipe y filtro global de errores
- [ ] Pipeline de CI: typecheck + lint + tests

**Criterio de salida:** `npm run dev` levanta backend y frontend; `supabase db reset` carga el esquema; `GET /api/health` responde 200.

## Fase 2 — Autenticación y roles

**Entregable:** login funcional con redirección por rol mediante la API.

- [ ] Trigger `handle_new_user` y función `current_role`
- [ ] `profiles`, `roles` y políticas RLS base
- [ ] `AuthService` en backend + `AuthGuard`, `RolesGuard` y `@CurrentUser()`
- [ ] Endpoints `/auth/login`, `/auth/me`, `/auth/logout` y `/users`
- [ ] Modelo `auth.service.ts` y store en el frontend
- [ ] Login con Reactive Forms y mensajes en español
- [ ] Guards `authGuard` y `roleGuard` basados en `/auth/me`
- [ ] Pruebas unitarias, de contrato y E2E del login

**Criterio de salida:** los cuatro roles (o los confirmados) ingresan y ven solo su destino permitido.

## Fase 3 — Estructura organizacional

**Entregable:** ABM de regiones, distritos e iglesias.

- [ ] Entidades, repositorios y servicios MVC en `backend/src/models/`
- [ ] DTOs y mappers en `backend/src/views/`
- [ ] Controladores y rutas `/regions`, `/districts`, `/churches`
- [ ] Validación con `class-validator` y errores `AppError` uniformes
- [ ] Modelos HTTP, vistas y controladores en `frontend/src/app/`
- [ ] Pantallas de listado con búsqueda y paginación
- [ ] Formularios con estados cargando/vacío/error/éxito
- [ ] RLS de escritura por rol
- [ ] Pruebas de servicios e integración

**Criterio de salida:** se puede crear `región → distrito → iglesia` desde cero y consultar la jerarquía.

## Fase 4 — Pastores y asignación

**Entregable:** gestión de pastores y pastor responsable.

- [ ] ABM de pastores con búsqueda por nombre
- [ ] Asignación de `lead_pastor_id` con validación de una iglesia por responsable
- [ ] Detalle de iglesia con jerarquía y pastor
- [ ] Vista de «Mi participación» para el rol pastor
- [ ] Ajuste de RLS por alcance

**Criterio de salida:** una iglesia muestra distrito, región y pastor responsable correctamente.

## Fase 5 — Registro de asistencia

**Entregable:** registro rápido y confiable de asistencia.

- [ ] Evento semilla de la convención
- [ ] `AttendanceService` con control de duplicados y endpoint `/attendances`
- [ ] Búsqueda de pastor y confirmación de asistencia
- [ ] RPC `register_attendance` (opcional) con auditoría
- [ ] Listado de asistentes con filtros
- [ ] States y mensajes accesibles
- [ ] Pruebas unitarias + E2E del recorrido crítico

**Criterio de salida:** registrar 100 asistentes sin duplicados y con usuario/fecha correctos.

## Fase 6 — Reportes y pulimento

**Entregable:** panel de reportes y ajustes finales.

- [ ] Vista `v_attendance_summary`
- [ ] Reportes por región, distrito e iglesia (tabla + tarjetas)
- [ ] Filtros combinados y exportación CSV (C)
- [ ] Aplicación de la guía UI/UX existente (tokens, tipografías, componentes)
- [ ] Revisión responsive 360/768/1440 px
- [ ] Auditoría de accesibilidad y seguridad
- [ ] Prueba de carga ligera y backup

**Criterio de salida:** un consultor obtiene totales correctos y la app cumple la guía visual.

## Matriz de trazabilidad

| Objetivo | Requisitos | Fase |
| --- | --- | --- |
| O1 Login | RF-01, RF-02, RF-03 | 2 |
| O2 Estructura | RF-04, RF-05, RF-06 | 3 |
| O3 Jerarquía | RF-05, RF-06, RF-12 | 3 |
| O4 Pastor responsable | RF-07, RF-08 | 4 |
| O5 Asistencia | RF-09, RF-10 | 5 |
| O6 Reportes | RF-11, RF-13 | 6 |
| O7 Calidad | RNF-01…RNF-13 | Todas |

## Definición de terminado (DoD)

Una historia se considera terminada cuando:

1. Cumple sus criterios de aceptación.
2. Tiene pruebas automáticas que cubren el camino feliz y el error principal.
3. Pasan `typecheck`, `lint`, `format` y `test`.
4. La documentación afectada está actualizada.
5. Fue revisada por otra persona y el PR está aprobado.
6. Está desplegada al entorno de prueba.

## Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Roles no confirmados | Retrabajo en RLS y guards | Confirmar en Fase 0 antes de escribir código |
| «Región» vs «departamento» ambiguo | Modelo incorrecto | Definir `kind` o separar tablas con ADR |
| Fecha del evento ajustada | Reportes mal etiquetados | Parametrizar `events`, no hardcodear fechas |
| Conexión limitada en el venue | Fallo de registro | Guardar formularios en borrador local y sincronizar (fase futura) |
| Datos personales sensibles | Privacidad | RLS + mínimo dato necesario + sin logs sensibles |

## Hitos sugeridos

| Hito | Fecha orientativa |
| --- | --- |
| Documentación validada | Antes de iniciar código |
| Cimientos listos | Semana 1 |
| Login y roles | Semana 2 |
| Estructura y pastores | Semanas 3–4 |
| Asistencia | Semana 5 |
| Reportes y entrega | Semana 6 |

> Las fechas son orientativas y deben ajustarse al calendario real del equipo.
