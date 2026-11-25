# Índice de documentación

Documento vivo. Estado: **arquitectura MVC definida; esqueleto de carpetas creado**.

| # | Documento | Propósito | Estado |
| --- | --- | --- | --- |
| — | [README](../README.md) | Vista general y enlaces | Acordado en estructura |
| — | [CONTRIBUTING](../CONTRIBUTING.md) | Flujo de trabajo y commits | Borrador |
| — | [Guía UI/UX](../convenci_n_ministerial.md) | Colores, tipografías y componentes | Existente |
| — | [Backend](../backend/README.md) | Estructura MVC del servidor | Esqueleto |
| — | [Frontend](../frontend/README.md) | Estructura MVC de la app | Esqueleto |
| 00 | Índice (este archivo) | Mapa documental | Borrador |
| 01 | [Contexto y alcance](01-contexto-y-alcance.md) | Por qué existe el sistema y qué cubre | Borrador |
| 02 | [Requisitos](02-requisitos.md) | RF, RNF e historias de usuario | Borrador |
| 03 | [Roles y permisos](03-roles-y-permisos.md) | RBAC + mapeo a RLS | Borrador (propuesta) |
| 04 | [Modelo de datos](04-modelo-de-datos.md) | Tablas, relaciones y DDL sugerido | Borrador (propuesta) |
| 05 | [Arquitectura MVC](05-arquitectura.md) | Backend/frontend, capas y flujos | **Reescrita** |
| 06 | [Supabase](06-supabase.md) | Auth vía backend, RLS, migraciones | **Actualizada** |
| 07 | [Contratos y tipos](07-contratos-y-tipos.md) | TS types, DTOs y errores de API | **Actualizada** |
| 08 | [Estándares y Clean Code](08-estandares-y-clean-code.md) | Convenciones y pruebas | Actualizada |
| 09 | [Plan de trabajo](09-plan-de-trabajo.md) | Fases y criterios de aceptación | Actualizada |
| 10 | [Glosario y supuestos](10-glosario-y-supuestos.md) | Vocabulario y preguntas abiertas | Actualizada |
| 11 | [Registro de decisiones](11-registro-de-decisiones.md) | ADR (incluye ADR-010…012) | Actualizada |
| 12 | [Pantallas y flujos](12-pantallas-y-flujos.md) | Inventario UI y navegación | Borrador |
| 13 | [API REST](13-api-rest.md) | Endpoints, respuestas y errores | Nuevo |

## Cómo usar esta documentación

1. Leer **01** y **02** para entender el producto.
2. Leer **03**, **04** y **12** para entender el dominio y las pantallas.
3. Leer **05**, **06**, **07** y **13** antes de escribir código.
4. Consultar **08** en cada PR y **11** cuando cambie una decisión técnica.

## Cambio de arquitectura

La versión anterior de este proyecto proponía Clean Architecture por capas (`domain`, `application`, `infrastructure`) sin servidor propio. Fue **reemplazada** por MVC con `backend/` y `frontend/` según el requerimiento del usuario. El cambio está registrado en [ADR-010](11-registro-de-decisiones.md).

## Convención de estado

| Estado | Significado |
| --- | --- |
| Borrador | Propuesto, pendiente de validación con el usuario |
| Acordado | Validado, se puede implementar |
| Esqueleto | Carpetas creadas, sin código de aplicación |
| Obsoleto | Reemplazado por otro documento o ADR |
