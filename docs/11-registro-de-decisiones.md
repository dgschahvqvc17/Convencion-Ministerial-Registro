# 11 · Registro de decisiones (ADR)

Formato breve: contexto → decisión → consecuencias. Los ADR son inmutables; para cambiar uno se crea otro que lo supera.

## ADR-001 — Angular standalone con TypeScript estricto

- **Estado:** propuesto
- **Contexto:** se requiere una app web mantenible, con buenas prácticas y trabajo en equipo.
- **Decisión:** Angular en su modalidad standalone, sin NgModules de feature, con `strict: true` y señales para estado local.
- **Consecuencias:** menos ceremonia y mejor tree-shaking; exige disciplina con tipados y async desde el inicio.

## ADR-002 — Supabase como backend

- **Estado:** propuesto
- **Contexto:** se necesita base de datos, autenticación, API y permisos sin construir un backend propio.
- **Decisión:** usar Supabase (PostgreSQL + Auth + PostgREST + RLS) con el SDK JS v2.
- **Consecuencias:** desarrollo rápido y seguridad a nivel de fila; acoplamiento al SDK mitigado con repositorios. La clave `service_role` queda prohibida en el frontend.

## ADR-003 — Clean Architecture en el frontend

- **Estado:** reemplazado por ADR-010
- **Contexto:** el dominio (jerarquía iglesias/pastores/asistencia) debe sobrevivir a cambios de UI o proveedor.
- **Decisión:** capas `domain`, `application`, `infrastructure`, `presentation`, con puertos e inyección de dependencias.
- **Consecuencias:** más archivos al inicio; pruebas de negocio sin base de datos y posibilidad de cambiar de adaptador.

## ADR-004 — Código en inglés, interfaz en español

- **Estado:** propuesto
- **Contexto:** el equipo hispanohablante necesita legibilidad, y Angular/TS convencionalmente usan inglés.
- **Decisión:** identificadores, nombres de archivos y mensajes de error internos en inglés; textos visibles y documentación en español.
- **Consecuencias:** consistencia con el ecosistema; se documenta el glosario bilingüe para evitar confusión.

## ADR-005 — Modelo de roles propuesto

- **Estado:** propuesto (pendiente de confirmación)
- **Contexto:** el requerimiento menciona roles pero solo detalla al administrador.
- **Decisión:** iniciar con `admin`, `operator`, `pastor` y `viewer`, un rol por perfil, guardado en tabla `roles`.
- **Consecuencias:** matriz RLS clara; si el usuario confirma otros roles, se agrega un ADR que reemplaza este.

## ADR-006 — Región y departamento en una sola tabla

- **Estado:** propuesto (pendiente de confirmación)
- **Contexto:** ambos términos aparecen como nivel superior del distrito.
- **Decisión:** tabla `regions` con columna `kind` (`departamento` | `region`).
- **Consecuencias:** esquema simple; si son niveles jerárquicos distintos, se separa en dos tablas con migración nueva.

## ADR-007 — Estilos con variables CSS de la guía existente

- **Estado:** propuesto
- **Contexto:** existe `convenci_n_ministerial.md` con paleta y tipografías definidas.
- **Decisión:** reutilizar esos tokens en `:root` y componentes SCSS; no introducir librería UI que los contradiga.
- **Consecuencias:** identidad visual consistente; se mantiene un solo archivo de tokens como fuente de verdad.

## ADR-008 — Borrado lógico en catálogos

- **Estado:** propuesto
- **Contexto:** las iglesias y pastores pueden dejar de estar activos, pero hay registros históricos de asistencia.
- **Decisión:** columna `is_active` en catálogos; las consultas filtran por defecto y se evita `DELETE`.
- **Consecuencias:** se conserva auditoría; las políticas RLS de lectura usan `is_active`.

## ADR-009 — Pruebas con Vitest y Playwright

- **Estado:** propuesto
- **Contexto:** se requiere cobertura de lógica de negocio y un recorrido crítico confiable.
- **Decisión:** Vitest para unitarias/integración, Angular Testing Library para componentes y Playwright para E2E.
- **Consecuencias:** stack moderno y rápido; se configura en la Fase 1 antes de escribir funcionalidad.

## ADR-010 — MVC con proyectos `backend/` y `frontend/`

- **Estado:** aceptado (solicitado por el usuario)
- **Contexto:** se pidió explícitamente arquitectura MVC con carpetas separadas para backend y frontend. La propuesta anterior sin servidor propio ya no aplica.
- **Decisión:** dividir el repositorio en `backend/` (MVC) y `frontend/` (Angular MVC), comunicados por API REST `/api`. Backend: `models/` (entidades, repositorios, servicios), `views/` (DTOs y mappers), `controllers/` (HTTP). Frontend: `models/` (HTTP + estado), `views/` (componentes presentacionales), `controllers/` (páginas). El framework del backend se precisa en ADR-013.
- **Consecuencias:** estructura clara y familiar; los controladores deben mantenerse delgados para no convertir MVC en lógica mezclada. Reemplaza ADR-003 y la parte de ADR-001 relativa a capas (Angular standalone se mantiene).

## ADR-011 — Node.js + Express + TypeScript en el backend

- **Estado:** reemplazado por ADR-013
- **Contexto:** el requerimiento original menciona JavaScript; se necesita un servidor HTTP para la API MVC.
- **Decisión:** usar Node.js con Express y TypeScript (JavaScript tipado), manteniendo `strict: true`.
- **Consecuencias:** ecosistema maduro y curva baja; si se prefiere NestJS, se adopta otro ADR conservando el MVC.

## ADR-012 — Sesión en cookie httpOnly gestionada por el backend

- **Estado:** propuesto
- **Contexto:** Supabase Auth emite tokens; guardarlos en `localStorage` expone a XSS y el frontend no debe conocerlos.
- **Decisión:** el backend realiza login con Supabase Auth, establece una cookie httpOnly/Secure/SameSite y valida el JWT en cada petición. El frontend usa `withCredentials: true`.
- **Consecuencias:** mejor seguridad; el backend debe implementar refresh y CSRF se mitiga con SameSite + origen restringido.

## ADR-013 — NestJS como framework del backend

- **Estado:** aceptado (solicitado por el usuario)
- **Contexto:** se propuso inicialmente Express, pero el usuario pidió migrar a otro framework manteniendo MVC.
- **Decisión:** usar **NestJS + TypeScript** en `backend/`. La correspondencia MVC queda: Model = `@Injectable()` services + repositorios Supabase; View = DTOs y mappers JSON; Controller = clases `@Controller()`. Las rutas se declaran en los controladores y los módulos por feature agrupan controladores y providers. Validación con `class-validator` + `ValidationPipe`; errores con `AllExceptionsFilter`; autorización con `AuthGuard`/`RolesGuard` y `@CurrentUser()`.
- **Consecuencias:** DI nativa y estructura modular; se eliminó la carpeta `routes/`; la curva de aprendizaje es mayor que con Express. Reemplaza ADR-011. Pruebas: Jest + Supertest en backend (Vitest se mantiene en frontend).

## Plantilla para nuevos ADR

```md
## ADR-0XX — <título>

- **Estado:** propuesto | aceptado | rechazado | reemplazado por ADR-0YY
- **Contexto:** <qué problema se resolvía y bajo qué restricciones>
- **Decisión:** <qué se decidió hacer>
- **Consecuencias:** <qué ganamos y qué sacrificamos>
```
