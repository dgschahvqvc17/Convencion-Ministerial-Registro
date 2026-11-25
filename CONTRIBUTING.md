# Guía de contribución

Esta guía aplica desde la fase de documentación en adelante. Su objetivo es mantener el código predecible y fácil de revisar.

## Ramas

| Prefijo | Uso | Ejemplo |
| --- | --- | --- |
| `main` | Única rama estable, siempre desplegable | — |
| `feat/` | Funcionalidad nueva | `feat/registro-asistencia` |
| `fix/` | Corrección | `fix/validacion-correo` |
| `docs/` | Solo documentación | `docs/modelo-datos` |
| `refactor/` | Mejora sin cambio de comportamiento | `refactor/repositorios` |
| `test/` | Pruebas | `test/auth-guard` |

Los cambios se agrupan por proyecto: `backend/` (API MVC) o `frontend/` (app Angular MVC). Un PR que toque ambos debe indicarlo en la descripción.

## Commits

Se usa **Conventional Commits**:

```text
<tipo>(<alcance opcional>): <descripción en imperativo y minúsculas>

[cuerpo opcional]
[pie opcional: BREAKING CHANGE / closes #N]
```

Tipos permitidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `style`.

Ejemplos:

```text
feat(backend/distritos): agregar endpoint de creación de distrito
feat(frontend/distritos): agregar formulario de creación de distrito
docs(modelo-datos): documentar relación iglesia-pastor
fix(frontend/auth): corregir redirección después de inicio de sesión
```

## Antes de abrir un Pull Request

- [ ] La documentación relacionada fue actualizada.
- [ ] TypeScript compila en modo estricto (`strict: true`) sin `any`.
- [ ] Las reglas de lint y formato pasan sin errores.
- [ ] Hay pruebas para la lógica de negocio nueva.
- [ ] No se exponen secretos, URLs privadas ni datos reales de pastores.
- [ ] El diff es pequeño y tiene un solo propósito (un PR = un cambio).
- [ ] La descripción del PR explica **qué**, **por qué** y **cómo verificarlo**.

## Revisiones

- Se revisa primero la intención, luego la estructura y al final el estilo.
- Los comentarios se hacen sobre el código, nunca sobre la persona.
- Si un punto no es bloqueante, se marca como `nit:` y queda a criterio del autor.

## Convivencia con la documentación

Si una decisión de código contradice un documento de `docs/`, se actualiza el documento en el mismo PR. En decisiones estructurales se agrega una entrada nueva a [ADR](docs/11-registro-de-decisiones.md) en lugar de reescribir el historial.
