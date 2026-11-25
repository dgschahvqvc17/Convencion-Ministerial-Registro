# 01 · Contexto y alcance

## Contexto

La Iglesia de Dios de la Profecía (Bolivia) realiza la **44° Convención Ministerial**, bajo el lema *«Testifiquemos»* (Isaías 43:10), en Cochabamba del 1 al 3 de diciembre de 2026.

Hoy la información de la estructura eclesiástica y de la asistencia de pastores se maneja de forma dispersa. El sistema propuesto centraliza:

- La **estructura jerárquica**: departamento/región → distrito → iglesia.
- El **cuerpo pastoral**: pastores y su relación con una iglesia.
- El **registro de asistencia** al evento.
- El **control de acceso** por roles desde un inicio de sesión.

La identidad visual ya está definida en [convenci_n_ministerial.md](../convenci_n_ministerial.md); este documento no la reemplaza.

## Problema que resuelve

| Situación actual | Situación deseada |
| --- | --- |
| Datos en planillas o mensajes | Una sola fuente de verdad en Supabase |
| Difícil saber a qué distrito pertenece una iglesia | Jerarquía consultable y filtrable |
| Asistencia registrada sin control | Registro auditado, con usuario y fecha |
| No hay distinción de responsabilidades | Acceso por roles con permisos explícitos |
| Reportes manuales | Consultas y paneles en la app |

## Objetivos

1. **O1** — Permitir el ingreso seguro de usuarios con roles diferenciados.
2. **O2** — Permitir al administrador mantener departamentos/regiones, distritos, iglesias y pastores.
3. **O3** — Relacionar cada iglesia con su distrito y cada distrito con su departamento/región.
4. **O4** — Asignar un pastor responsable a cada iglesia.
5. **O5** — Registrar y consultar la asistencia de pastores al evento.
6. **O6** — Producir reportes básicos por departamento/región, distrito e iglesia.
7. **O7** — Cumplir buenas prácticas: Clean Code, SOLID, tipado estricto y pruebas.

## Alcance (incluido)

- App web responsiva (móvil, tablet y escritorio).
- Autenticación con correo y contraseña gestionada por el backend con Supabase Auth.
- API REST documentada y consumida por el frontend Angular.
- Catálogos geográficos-eclesiásticos y de pastores.
- Registro de asistencia con estado y trazabilidad.
- Panel de consultas y reportes simples.
- Políticas de seguridad a nivel de fila (RLS) en Supabase.

## Fuera de alcance (por ahora)

- Pagos, inscripciones costosas ni pasarelas de pago.
- Generación e impresión de credenciales físicas o QR (se podrá agregar después).
- Notificaciones por SMS/WhatsApp.
- Aplicación nativa móvil.
- Importación masiva desde hojas de cálculo (fase posterior).
- Multi-evento complejo: se modela un `evento`, sin calendario avanzado.

## Actores

| Actor | Responsabilidad principal |
| --- | --- |
| Administrador | Configurar la estructura y los usuarios; supervisar todo |
| Operador / Secretaría | Registrar asistencia y mantener datos de iglesias y pastores |
| Pastor | Consultar sus datos y confirmar su presencia (si se habilita) |
| Consultor / Auditor | Solo lectura de reportes |

> Los roles son una propuesta; ver [03-roles-y-permisos.md](03-roles-y-permisos.md) y [10-glosario-y-supuestos.md](10-glosario-y-supuestos.md).

## Restricciones

- La base de datos es **Supabase/PostgreSQL**; no se cambiará de motor sin un ADR.
- El frontend es **Angular con TypeScript estricto**, en la carpeta `frontend/`.
- El backend es **NestJS + TypeScript**, en la carpeta `backend/`, con API REST bajo `/api`.
- Frontend y backend se comunican por HTTP/JSON; el frontend **no** accede a Supabase directamente.
- La arquitectura es **MVC** en ambos proyectos (ver [05-arquitectura.md](05-arquitectura.md)).
- Los textos de la interfaz serán en **español**.
- Los nombres de identificadores en código serán en **inglés** (ver ADR-004).
- No se almacenarán secretos en el repositorio; solo nombres de variables de entorno.

## Métricas de éxito sugeridas

| Métrica | Meta |
| --- | --- |
| Tiempo de registro de un pastor | < 60 s desde el inicio de sesión |
| Datos duplicados de iglesias | 0 (restricción única por distrito + nombre) |
| Registros sin usuario responsable | 0 (columna obligatoria) |
| Cobertura de pruebas de lógica de negocio | ≥ 80 % |
| Accesos no autorizados | 0 (RLS activo en todas las tablas) |
