# 08 · Estándares y Clean Code

> Aplica a todo el código que se escriba en el proyecto. Se revisa en cada PR.

## 1. Principios

| Principio | Aplicación concreta |
| --- | --- |
| **Single Responsibility** | Un archivo = una responsabilidad. Un servicio del Modelo = una regla de negocio principal |
| **Open/Closed** | Nuevas fuentes de datos se agregan como repositorios, sin tocar servicios ni controladores |
| **Liskov** | Todo repositorio debe cumplir el contrato de su interfaz, incluidos los fakes de prueba |
| **Interface Segregation** | Interfaces pequeñas; no un `Repository` gigante con métodos que algunos no usan |
| **Dependency Inversion** | Los servicios dependen de interfaces de repositorio, no del SDK de Supabase |
| **DRY** | No repetir lógica de negocio; sí repetir código trivial si eso mejora la claridad |
| **KISS** | Preferir la solución simple; evitar abstracciones especulativas |
| **YAGNI** | No implementar funcionalidad futura sin requerimiento actual |
| **Fail fast** | Validar temprano y devolver errores claros |

## 1.1 Organización MVC

| Proyecto | Modelo | Vista | Controlador |
| --- | --- | --- | --- |
| `backend/` | `src/models/` (entidades, repositorios, servicios) | `src/views/` (DTOs y mappers JSON) | `src/controllers/` (HTTP) |
| `frontend/` | `src/app/models/` (servicios HTTP y estado) | `src/app/views/` (componentes presentacionales) | `src/app/controllers/` (páginas) |

Reglas específicas:

1. El backend no genera HTML; su «Vista» es la representación JSON documentada en [13-api-rest.md](13-api-rest.md).
2. Un controlador (backend o frontend) delega; nunca contiene reglas de negocio.
3. Una vista de Angular no inyecta `HttpClient`; recibe `input()` y emite `output()`.
4. El frontend no importa `@supabase/supabase-js`; solo consume `/api`.
5. Los servicios del backend pueden depender de repositorios; los repositorios dependen de Supabase. Ningún servicio depende de NestJS.

## 2. Nombres

- **Código en inglés**: `ChurchRepository`, `registerAttendance`, `isActive`.
- **UI y documentación en español**: «Registrar asistencia», «Distrito».
- Clases y tipos en `PascalCase`; variables, funciones y métodos en `camelCase`; constantes en `UPPER_SNAKE_CASE`.
- Archivos en `kebab-case.ts`, con sufijo según capa: `church.service.ts`, `church.mapper.ts`, `church.controller.ts`, `login.view.ts`, `login.controller.ts`.
- Los nombres revelan intención: `findActiveByDistrictId`, no `getData`.
- Booleanos con prefijo `is`, `has`, `can`: `isActive`, `hasRole`, `canEdit`.
- Evitar nombres genéricos: `data`, `info`, `temp`, `item`, `obj`.
- Base de datos en `snake_case` y plural: `attendances`, `district_id`.

## 3. Funciones

- Una función hace **una** cosa. Si necesita un comentario para explicar cada bloque, probablemente son varias funciones.
- Ideal ≤ 20 líneas; límite blando 30. Más de 3 parámetros → usar objeto de comando.
- Prefiere **early returns** sobre `if/else` anidados.
- Sin efectos ocultos: una función llamada `find...` no debe guardar datos.
- Funciones puras siempre que sea posible; la mutación se aísla en la capa de infraestructura.
- Un nivel de abstracción por función: no mezclar validación de formulario con SQL.

```ts
// ✔ claro
function canRegisterAttendance(profile: UserProfile): boolean {
  if (!profile.isActive) return false;
  return profile.role === 'admin' || profile.role === 'operator';
}

// ✘ oscuro
function check(u: any) {
  if (u && u.is_active) { if (u.role === 'admin' || u.role === 'operator') return 1; }
  return 0;
}
```

## 4. Comentarios

- El código debe explicarse solo; comentar el **por qué**, nunca el **qué**.
- Prohibidos comentarios de fecha, autor, código muerto o parámetros obvios.
- Los TODO llevan contexto: `// TODO(ADR-008): definir alcance del coordinador de distrito`.
- Los contratos públicos (interfaces de repositorio, servicios del Modelo) pueden tener documentación breve con errores y efectos.

## 5. Formato y herramientas

| Herramienta | Regla |
| --- | --- |
| TypeScript | `strict: true`, `noImplicitAny`, `noUncheckedIndexedAccess` recomendado |
| ESLint | Reglas de NestJS en backend y Angular en frontend + `@typescript-eslint` |
| Prettier | 2 espacios, comillas simples, 100 columnas, punto y coma |
| SCSS | BEM ligero o estilos por componente con `ViewEncapsulation.Emulated` |
| Editor | formato al guardar; CI verifica `format:check` y `lint` |

Cada proyecto tiene sus propios scripts (se crearán en la Fase 1):

```json
// backend/package.json
{
  "lint": "eslint .",
  "format:check": "prettier --check .",
  "test": "jest",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "typecheck": "tsc --noEmit"
}
```

```json
// frontend/package.json
{
  "lint": "eslint .",
  "format:check": "prettier --check .",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "typecheck": "tsc --noEmit"
}
```

## 6. Estructura de un servicio del Modelo (backend)

```ts
// backend/src/models/services/attendance.service.ts
@Injectable()
export class AttendanceService {
  constructor(private readonly attendances: AttendanceRepository) {}

  async register(request: RegisterAttendanceRequest, actorId: string): Promise<Attendance> {
    const existing = await this.attendances.exists(request.eventId, request.pastorId);
    if (existing) {
      throw new AppError('DUPLICATE_ATTENDANCE', 409);
    }

    return this.attendances.save({
      id: crypto.randomUUID(),
      eventId: request.eventId,
      pastorId: request.pastorId,
      registeredBy: actorId,
      status: 'registered',
      checkedInAt: new Date().toISOString(),
      notes: request.notes ?? null,
    });
  }
}
```

> El servicio no conoce `@Req`/`@Res` de NestJS: el controlador es quien traduce HTTP a comandos y DTOs.

## 7. Pruebas

| Regla | Detalle |
| --- | --- |
| Nomenclatura | `describe('AttendanceService')`, `it('rechaza duplicados en el mismo evento')` |
| Patrón | Arrange–Act–Assert, sin lógica condicional en la prueba |
| Doble de prueba | Repositorios `fake` en `backend/tests/unit/fakes/`, no mocks de SDK |
| Herramientas | Jest + Supertest en backend; Vitest + Testing Library en frontend |
| Cobertura | ≥ 80 % en servicios del backend; componentes críticos del frontend ≥ 60 % |
| Datos | Factories con valores por defecto y overrides explícitos |
| E2E | Un recorrido crítico: login → crear iglesia → registrar asistencia → ver reporte |
| Regresión | Todo bug corregido añade una prueba que lo reproduzca |

Ejemplo:

```ts
it('rechaza un segundo registro del mismo pastor en el mismo evento', async () => {
  const repo = new FakeAttendanceRepository([existingAttendance]);
  const service = new AttendanceService(repo);

  await expect(service.register(request, actorId)).rejects.toMatchObject({
    code: 'DUPLICATE_ATTENDANCE',
  });
});
```

## 8. Seguridad en el código

- Nunca interpolar entradas en consultas; usar parámetros del SDK/PostgREST.
- Nunca confiar en el rol que viene del cliente para autorizar en base de datos.
- Sanitizar textos mostrados en HTML (Angular escapa por defecto; evitar `[innerHTML]` con datos de usuario).
- No registrar en consola correos, teléfonos ni tokens en producción.
- Los formularios limitan longitud y tipo antes de enviar; la base también valida.

## 9. Accesibilidad y UX

- Todo input tiene `<label>` asociado y `aria-invalid` cuando corresponda.
- Errores visibles cerca del campo y resumen accesible con `role="alert"`.
- Navegación completa por teclado; foco visible con el dorado de la guía.
- Zona táctil mínima de 48 px; fuente base de 16 px.
- Contraste AA: texto claro sobre `#141B5B`, texto oscuro sobre `#F7B500`.
- Estados de carga y vacío con mensajes útiles, nunca pantallas en blanco.

## 10. Checklist antes de `git commit`

- [ ] El nombre del commit sigue Conventional Commits.
- [ ] `npm run typecheck`, `lint`, `format:check` y `test` pasan.
- [ ] No hay `any`, `console.log` ni secretos nuevos.
- [ ] La lógica de negocio está en servicios del Modelo, no en controladores ni vistas.
- [ ] Hay mensajes de error en español para los nuevos casos.
- [ ] Se actualizó la documentación afectada.
