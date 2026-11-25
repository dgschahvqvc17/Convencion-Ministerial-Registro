# 07 · Contratos y tipos

> Estado: **actualizado a MVC con backend/frontend**. Los tipos canónicos viven en `backend/`; el frontend replica los que consume.

## 1. Reglas generales

- TypeScript estricto en ambos proyectos. Prohibido `any`; usar `unknown` y estrechar con validadores.
- `backend/src/types/database.types.ts` se **genera** desde Supabase y solo se usa en `models/repositories`.
- `frontend/src/app/models/api.types.ts` define la forma de las respuestas HTTP; no conoce tablas de base de datos.
- Entidades en `camelCase`; filas de Supabase en `snake_case`; conversión exclusivamente en `backend/src/views/mappers`.
- Las entidades son `readonly`. Los DTO de entrada son clases con `class-validator`, aplicadas por el `ValidationPipe` global de NestJS.
- Los errores de negocio son `AppError` en el backend y se serializan al formato de [13-api-rest.md](13-api-rest.md).

## 2. Ubicación de los tipos

| Tipo | Ubicación | Consumido por |
| --- | --- | --- |
| Entidades de dominio | `backend/src/models/entities/` | Services, repositories y mappers |
| Filas de Supabase | `backend/src/types/database.types.ts` (generado) | Repositories |
| DTO de respuesta | `backend/src/views/dtos/` | Controllers |
| Contrato HTTP | `frontend/src/app/models/api.types.ts` | Services del frontend |
| Errores | `backend/src/errors/app-error.ts` | Middleware de errores |
| DTO de entrada | `backend/src/views/dtos/` | Validación de `body` / `query` con `class-validator` |

## 3. Entidades (backend)

```ts
export type RoleName = 'admin' | 'operator' | 'pastor' | 'viewer';
export type RegionKind = 'departamento' | 'region';
export type AttendanceStatus = 'registered' | 'confirmed' | 'cancelled';

export interface Region {
  readonly id: string;
  readonly name: string;
  readonly kind: RegionKind;
  readonly country: string;
  readonly isActive: boolean;
}

export interface District {
  readonly id: string;
  readonly regionId: string;
  readonly name: string;
  readonly isActive: boolean;
}

export interface Church {
  readonly id: string;
  readonly districtId: string;
  readonly leadPastorId: string | null;
  readonly name: string;
  readonly address: string | null;
  readonly isActive: boolean;
}

export interface Pastor {
  readonly id: string;
  readonly churchId: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly registeredBy: string;
  readonly createdAt: string;
  readonly isActive: boolean;
}

export interface Event {
  readonly id: string;
  readonly name: string;
  readonly motto: string | null;
  readonly startDate: string;
  readonly endDate: string;
  readonly city: string | null;
  readonly isActive: boolean;
}

export interface Attendance {
  readonly id: string;
  readonly eventId: string;
  readonly pastorId: string;
  readonly registeredBy: string;
  readonly status: AttendanceStatus;
  readonly checkedInAt: string;
  readonly notes: string | null;
}

export interface UserProfile {
  readonly id: string;
  readonly role: RoleName | null;
  readonly fullName: string;
  readonly regionId: string | null;
  readonly districtId: string | null;
  readonly churchId: string | null;
  readonly isActive: boolean;
}
```

## 4. Tipos del contrato HTTP

```ts
// frontend/src/app/models/api.types.ts
export interface ApiSuccess<T> {
  readonly data: T;
  readonly meta?: PaginationMeta;
}

export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface ApiError {
  readonly error: {
    readonly code: ApiErrorCode;
    readonly message: string;
    readonly details?: Readonly<Record<string, string>>;
  };
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_NAME'
  | 'DUPLICATE_ATTENDANCE'
  | 'MISSING_PARENT'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';
```

### Mensajes en español

| Código | Mensaje |
| --- | --- |
| `VALIDATION_ERROR` | «Revise los campos marcados» |
| `INVALID_CREDENTIALS` | «Correo o contraseña incorrectos» |
| `UNAUTHORIZED` | «Inicie sesión para continuar» |
| `FORBIDDEN` | «No tiene permisos para realizar esta acción» |
| `NOT_FOUND` | «No se encontró el registro solicitado» |
| `DUPLICATE_NAME` | «Ya existe un registro con ese nombre en esta ubicación» |
| `DUPLICATE_ATTENDANCE` | «El pastor ya está registrado en este evento» |
| `MISSING_PARENT` | «Debe seleccionar la región/distrito superior» |
| `CONFLICT` | «El registro no puede eliminarse porque tiene datos asociados» |
| `INTERNAL_ERROR` | «Ocurrió un error inesperado. Intente nuevamente» |

## 5. DTOs de entrada (validados en el backend)

```ts
export class LoginRequest {
  @IsEmail({}, { message: 'Ingrese un correo electrónico válido' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  password!: string;
}

export class CreateChurchRequest {
  @IsUUID()
  districtId!: string;

  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsUUID()
  leadPastorId?: string | null;
}

export class RegisterAttendanceRequest {
  @IsUUID()
  eventId!: string;

  @IsUUID()
  pastorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class AssignRoleRequest {
  @IsUUID()
  userId!: string;

  @IsIn(['admin', 'operator', 'pastor', 'viewer'])
  role!: RoleName;
}
```

> `ValidationPipe({ whitelist: true, transform: true })` se configura en `main.ts`; los mensajes de `class-validator` se mapean a `details` en `ApiError`.

## 6. DTOs de salida (backend `views/dtos`)

```ts
export interface ChurchDetailDto {
  id: string;
  name: string;
  address: string | null;
  district: { id: string; name: string };
  region: { id: string; name: string };
  leadPastor: { id: string; fullName: string } | null;
  pastorCount: number;
}

export interface AttendanceDto {
  id: string;
  pastorId: string;
  pastorFullName: string;
  churchName: string | null;
  status: AttendanceStatus;
  checkedInAt: string;
  registeredByName: string;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: RoleName | null;
  isActive: boolean;
}
```

### Mapper (único lugar de conversión)

```ts
// backend/src/views/mappers/church.mapper.ts (concepto)
type ChurchRow = {
  id: string;
  district_id: string;
  lead_pastor_id: string | null;
  name: string;
  address: string | null;
  is_active: boolean;
};

export function toChurch(row: ChurchRow): Church {
  return {
    id: row.id,
    districtId: row.district_id,
    leadPastorId: row.lead_pastor_id,
    name: row.name,
    address: row.address,
    isActive: row.is_active,
  };
}
```

## 7. Contratos de servicios

### Backend (`models/services`)

```ts
@Injectable()
export class AttendanceService {
  constructor(private readonly attendances: AttendanceRepository) {}

  async register(request: RegisterAttendanceRequest, actorId: string): Promise<Attendance> {
    const exists = await this.attendances.exists(request.eventId, request.pastorId);
    if (exists) {
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

### Frontend (`models/`)

```ts
export interface AttendanceModel {
  register(request: RegisterAttendanceRequest): Promise<AttendanceDto>;
  list(filter: AttendanceFilter): Promise<ApiSuccess<AttendanceDto[]>>;
}

// implementación: AttendanceHttpService usa HttpClient con API_BASE_URL
```

## 8. Errores

```ts
export class AppError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
    readonly details?: Readonly<Record<string, string>>,
  ) {
    super(code);
    this.name = 'AppError';
  }
}
```

`AllExceptionsFilter` (`backend/src/filters/`) convierte cualquier `AppError` o `HttpException` de Nest en:

```json
{
  "error": {
    "code": "DUPLICATE_ATTENDANCE",
    "message": "El pastor ya está registrado en este evento"
  }
}
```

Los errores de `class-validator` se mapean a `VALIDATION_ERROR` con `details` por campo. Los errores no previstos se registran en logs del backend y se responden como `INTERNAL_ERROR` sin exponer stack traces.

## 9. Filtros y paginación

```ts
export interface AttendanceFilter {
  eventId?: string;
  regionId?: string;
  districtId?: string;
  churchId?: string;
  status?: AttendanceStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;    // default 1
  pageSize?: number; // default 20, máximo 50
}
```

## 10. Reglas de versionado del contrato

1. Cambiar la forma de una respuesta existente requiere un nuevo prefijo (`/api/v2`) o un ADR.
2. Agregar campos opcionales es compatible; quitar o renombrar campos no lo es.
3. Todo endpoint nuevo se documenta en [13-api-rest.md](13-api-rest.md) antes de implementarse.
4. Los tipos del frontend se actualizan en el mismo PR que el backend.
