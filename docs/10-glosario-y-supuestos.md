# 10 · Glosario y supuestos

## 1. Glosario

| Término | Definición en el sistema |
| --- | --- |
| Región / Departamento | Unidad territorial superior. Se modela en `regions` con `kind`. |
| Distrito | Agrupación de iglesias dependiente de una región. |
| Iglesia | Congregación perteneciente a un distrito. |
| Pastor | Persona ministerial asociada a una iglesia. |
| Pastor responsable | Pastor a cargo de una iglesia (`churches.lead_pastor_id`). |
| Asistencia | Registro de presencia de un pastor en un evento. |
| Evento | Convención a la que se asocia la asistencia. |
| Perfil | Fila de `profiles` vinculada a un usuario de Supabase Auth. |
| Rol | Conjunto de permisos asignado a un perfil. |
| RLS | Row Level Security: políticas de PostgreSQL que limitan filas por usuario. |
| Caso de uso | Operación de negocio orquestada en la capa `application`. |
| Puerto | Interfaz que define cómo se accede a un recurso externo. |
| Adaptador | Implementación concreta de un puerto (Supabase). |
| DTO | Objeto de transferencia usado en el límite de entrada/salida. |
| ADR | Architecture Decision Record: registro de una decisión técnica. |
| Fail-closed | Comportamiento seguro por defecto: sin permiso explícito, se niega. |

## 2. Supuestos adoptados

Estos supuestos permitieron escribir la documentación. **Deben confirmarse** antes de implementar.

| # | Supuesto | Si es incorrecto… |
| --- | --- | --- |
| S-01 | «Departamento» y «región» son variantes del mismo nivel (`regions.kind`) | Se crean dos entidades separadas y se ajusta el modelo |
| S-02 | La lista de roles es: administrador, operador, pastor y consultor | Se reemplaza por la lista real y se actualiza la matriz RLS |
| S-03 | Un usuario tiene un solo rol | Se modela `user_roles` N:N |
| S-04 | Una iglesia tiene un solo pastor responsable; puede tener otros pastores | Se permite múltiples responsables con tabla puente |
| S-05 | El pastor pertenece a una iglesia; puede estar temporalmente sin ella | Se hace obligatorio el `church_id` |
| S-06 | La asistencia la registra el operador; el pastor solo consulta | Se habilita auto-registro con su política RLS |
| S-07 | Se usa un solo evento (la convención 2026) con soporte para otros | Se simplifica a una tabla sin `events` |
| S-08 | No se eliminan filas de la estructura, solo se desactivan | Se define política de borrado físico con historial |
| S-09 | El nombre de iglesia es único dentro del distrito | Se cambia la restricción única |
| S-10 | La app es 100 % en español y el código en inglés | Se define idioma de identifier alternativo |
| S-11 | Autenticación solo correo/contraseña | Se agrega OAuth o magic links |
| S-12 | Arquitectura MVC con carpetas `backend/` y `frontend/` | **Confirmado por el usuario**; no requiere cambio |
| S-13 | Backend en NestJS + TypeScript, respetando MVC | **Confirmado por el usuario**; reemplaza la propuesta Express |
| S-14 | Sesión en cookie httpOnly gestionada por el backend | Se usa token en memoria/localStorage con otro flujo |

> S-12 y S-13 ya no son supuestos: fueron confirmados al pedir MVC con carpetas `backend/` y `frontend/` y al elegir NestJS. S-14 sigue siendo propuesta.

## 3. Preguntas abiertas

### 3.1 Sobre «skills de REA»

El requerimiento original pide «usar skills de REA». El término no está definido en el contexto recibido. Posibles interpretaciones:

1. **Habilidades de ingeniería de requisitos** (análisis, historias, criterios de aceptación) → ya se reflejan en [02-requisitos.md](02-requisitos.md).
2. **Buenas prácticas de arquitectura** (Clean Architecture, SOLID, ADR) → ya se reflejan en [05-arquitectura.md](05-arquitectura.md) y [11-registro-de-decisiones.md](11-registro-de-decisiones.md).
3. **Una metodología o herramienta específica llamada REA** → se necesita el nombre exacto o un enlace para documentarla e integrarla.

> Hasta confirmarlo, se aplican interpretaciones 1 y 2. No se inventa una herramienta nueva.

### 3.2 Sobre la jerarquía

- ¿Existe el nivel «región» **además** de «departamento», o son sinónimos?
- ¿Los distritos pueden pertenecer directamente a la Iglesia Nacional sin un departamento?
- ¿Una iglesia puede cambiar de distrito con el tiempo? ¿Se conserva el histórico?

### 3.3 Sobre los roles

- ¿Quién crea al primer administrador?
- ¿El administrador puede registrar asistencia o solo supervisar?
- ¿Se requiere un coordinador de distrito con permisos parciales?

### 3.4 Sobre la operación

- ¿Cuántos pastores se esperan registrar (define paginación y performance)?
- ¿Habrá conexión a internet estable durante la convención?
- ¿Se imprimirán credenciales con QR o código?
- ¿Se requiere firma digital del pastor al confirmar asistencia?

## 4. Convenciones de este documento

- Los supuestos se numeran `S-01`… y se marcan como **confirmados** o **rechazados** cuando el usuario responde.
- Una respuesta que cambie un supuesto implica actualizar todos los documentos que lo referencian y crear un ADR si es estructural.
- Las preguntas resueltas se eliminan de «Preguntas abiertas» y se registra la decisión en [11](11-registro-de-decisiones.md).
