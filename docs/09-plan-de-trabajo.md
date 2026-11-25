# 09 · Plan de trabajo

> Estado: **Fases 0–6 implementadas en código**. Quedan tareas de endurecimiento (CI, E2E, exportación CSV, despliegue) marcadas como pendientes.

## Fase 0 — Documentación y arquitectura

**Entregable:** documentación y esqueleto de carpetas `backend/` y `frontend/`.

- [x] Contexto y alcance
- [x] Requisitos e historias de usuario
- [x] Propuesta de roles y permisos
- [x] Modelo de datos y DDL
- [x] Arquitectura MVC y contrato de API REST
- [x] Estándares de código y plan
- [x] Carpetas `backend/` y `frontend/` con su README
- [x] MSI: MVC con `backend/` y `frontend/`, NestJS, roles y reglas de pastores confirmados por el usuario
- [ ] Validación del significado de «skills de REA»

**Criterio de salida:** arquitectura y reglas de negocio acordadas.

## Fase 1 — Cimientos del proyecto

**Entregable:** backend MVC, frontend Angular MVC y migración de Supabase.

- [x] `backend/`: NestJS + TypeScript con `main.ts`/`app.module.ts` y módulos por feature
- [x] `frontend/`: Angular standalone, TypeScript estricto y SCSS
- [x] Jest en backend; adaptadores listos para Vitest/Playwright en frontend
- [x] Variables de entorno y `validateEnv()`
- [x] `SupabaseService` con cliente admin y cliente por usuario (RLS)
- [x] `supabase/migrations/0001_init.sql` y `supabase/seed.sql`
- [x] CORS, cookie de sesión, `ValidationPipe` y filtro global de errores
- [ ] ESLint + Prettier y pipeline de CI

**Criterio de salida:** `npm run build` pasa en ambos proyectos; la migración se ejecuta desde la guía [14](14-guia-supabase.md).

## Fase 2 — Autenticación y roles

**Entregable:** login funcional con redirección por rol mediante la API.

- [x] Trigger `handle_new_user` y función `current_role`
- [x] `profiles`, `roles` y políticas RLS base
- [x] `AuthService` + `AuthGuard`, `RolesGuard` y `@CurrentUser()`
- [x] Endpoints `/auth/login`, `/auth/me`, `/auth/logout` y `/users`
- [x] `AuthService` y `AuthStore` en el frontend
- [x] Login con formulario y mensajes en español
- [x] Guards `authGuard` y `roleGuard` basados en `/auth/me`
- [ ] Pruebas E2E del login

**Criterio de salida:** los cuatro roles ingresan y ven solo su destino permitido.

## Fase 3 — Estructura organizacional

**Entregable:** altas de regiones, distritos e iglesias (solo administrador).

- [x] Entidades, repositorios y servicios MVC en `backend/src/models/`
- [x] DTOs y mappers en `backend/src/views/`
- [x] Controladores `/regions`, `/districts`, `/churches`
- [x] Validación con `class-validator` y errores `AppError`
- [x] Modelos HTTP, vistas y controladores en `frontend/src/app/`
- [x] Listados con búsqueda y paginación
- [x] Formularios con estados cargando/vacío/error/éxito
- [x] RLS de escritura exclusiva para administrador

**Criterio de salida:** se puede crear `departamento/región → distrito → iglesia` desde cero.

## Fase 4 — Pastores y asignación

**Entregable:** gestión de pastores (solo nombre y apellido) y pastor responsable.

- [x] Altas, listado con búsqueda y baja lógica de pastores
- [x] Auditoría automática: `created_at` y `registered_by = auth.uid()`
- [x] Asignación de `lead_pastor_id` y restricción de una iglesia por responsable
- [x] Detalle de iglesia con jerarquía y pastor responsable
- [ ] Vista de «Mi participación» para el rol pastor

**Criterio de salida:** una iglesia muestra distrito, región y pastor responsable correctamente.

## Fase 5 — Registro de asistencia

**Entregable:** registro rápido y confiable de asistencia.

- [x] Evento semilla de la convención
- [x] `AttendanceService` con control de duplicados y endpoint `/attendances`
- [x] Búsqueda de pastor y confirmación de asistencia
- [x] Listado con filtros y estado «Cancelado»
- [x] Mensajes accesibles (`aria-live`) y estados visuales
- [x] Prueba unitaria del servicio de asistencia
- [ ] Pruebas E2E del recorrido crítico

**Criterio de salida:** registrar asistencia sin duplicados y con usuario/fecha correctos.

## Fase 6 — Reportes y pulimento

**Entregable:** panel de reportes y ajustes finales.

- [x] Vista `v_attendance_summary`
- [x] Reportes por región, distrito e iglesia (tabla + tarjetas)
- [x] Aplicación de la guía UI/UX existente (tokens, tipografías, componentes)
- [x] Revisión responsive 360/768/1440 px
- [ ] Filtros combinados y exportación CSV
- [ ] Auditoría final de accesibilidad y seguridad
- [ ] Despliegue y backup

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
3. Pasan `typecheck`, `test` y, cuando estén configurados, `lint` y `format`.
4. La documentación afectada está actualizada.
5. Fue revisada por otra persona y el PR está aprobado.
6. Está desplegada al entorno de prueba.

## Estado de verificación actual

| Proyecto | Comando | Resultado |
| --- | --- | --- |
| `backend/` | `npm run typecheck` | ✅ |
| `backend/` | `npm run build` | ✅ |
| `backend/` | `npm test -- --runInBand` | ✅ 2 pruebas |
| `frontend/` | `npm run build` | ✅ |
| `frontend/` | `npm run typecheck` | ✅ |

## Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| «Skills de REA» sin definir | Funcionalidad omitida | Confirmar con el usuario |
| «Región» vs «departamento» ambiguo | Modelo incorrecto | Implementado como `regions.kind` (ADR pendiente) |
| Conexión limitada en el venue | Fallo de registro | Borrador local y sincronización (fase futura) |
| Datos personales sensibles | Privacidad | Mínimo dato necesario (solo nombre y apellido), RLS y sin logs sensibles |
