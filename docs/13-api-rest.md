# 13 · API REST

> Estado: **contrato propuesto**. Base URL: `http://localhost:3000/api` en desarrollo. Todo el contrato se implementa en `backend/` con controladores NestJS (`@Controller()`).

## 1. Convenciones generales

| Aspecto | Regla |
| --- | --- |
| Protocolo | HTTP/1.1, `Content-Type: application/json` |
| Autenticación | Cookie de sesión httpOnly enviada por el backend (`withCredentials: true`) |
| Respuesta correcta | `{ "data": ... }` y optionalmente `{ "meta": {...} }` |
| Respuesta de error | `{ "error": { "code", "message", "details"? } }` |
| Paginación | `?page=1&pageSize=20` (máximo 50) |
| CORS | Solo el origen del frontend; credenciales permitidas |
| Versionado | Implícito en `/api`; cambios incompatibles → `/api/v2` |

## 2. Resumen de endpoints

| Método | Ruta | Descripción | Roles |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Iniciar sesión y crear cookie | Público |
| `POST` | `/auth/logout` | Cerrar sesión y limpiar cookie | Autenticados |
| `GET` | `/auth/me` | Perfil y rol actuales | Autenticados |
| `POST` | `/auth/change-password` | Cambiar contraseña propia | Autenticados |
| `GET` | `/regions` | Listar departamentos/regiones | Autenticados |
| `POST` | `/regions` | Crear región | Admin |
| `PATCH` | `/regions/:id` | Editar región | Admin |
| `DELETE` | `/regions/:id` | Desactivar región | Admin |
| `GET` | `/districts?regionId=` | Listar distritos | Autenticados |
| `POST` | `/districts` | Crear distrito | Admin |
| `PATCH` | `/districts/:id` | Editar distrito | Admin |
| `DELETE` | `/districts/:id` | Desactivar distrito | Admin |
| `GET` | `/churches?regionId=&districtId=&search=&page=` | Listar iglesias | Autenticados |
| `GET` | `/churches/:id` | Detalle con jerarquía y pastor | Autenticados |
| `POST` | `/churches` | Crear iglesia | Admin, Operador |
| `PATCH` | `/churches/:id` | Editar iglesia | Admin, Operador |
| `PATCH` | `/churches/:id/lead-pastor` | Asignar pastor responsable | Admin, Operador |
| `DELETE` | `/churches/:id` | Desactivar iglesia | Admin, Operador |
| `GET` | `/pastors?churchId=&search=&page=` | Listar pastores | Autenticados |
| `GET` | `/pastors/:id` | Detalle de pastor | Autenticados |
| `POST` | `/pastors` | Crear pastor | Admin, Operador |
| `PATCH` | `/pastors/:id` | Editar pastor | Admin, Operador |
| `DELETE` | `/pastors/:id` | Desactivar pastor | Admin, Operador |
| `GET` | `/events` | Listar eventos | Autenticados |
| `POST` | `/attendances` | Registrar asistencia | Admin, Operador |
| `GET` | `/attendances?eventId=&regionId=&districtId=&churchId=&status=&page=` | Listar asistencia | Autenticados |
| `PATCH` | `/attendances/:id/cancel` | Cancelar asistencia | Admin, Operador |
| `GET` | `/reports/attendance?groupBy=region` | Reporte de asistencia | Admin, Operador, Consultor |
| `GET` | `/users` | Listar usuarios | Admin |
| `POST` | `/users` | Crear usuario y asignar rol | Admin |
| `PATCH` | `/users/:id/role` | Cambiar rol | Admin |
| `PATCH` | `/users/:id/status` | Activar/desactivar usuario | Admin |

## 3. Autenticación

### `POST /auth/login`

```json
// request
{ "email": "admin@iglesia.org", "password": "••••••••" }

// response 200
{
  "data": {
    "id": "uuid",
    "fullName": "Ana Pérez",
    "email": "admin@iglesia.org",
    "role": "admin"
  }
}
```

- Establece cookie `convencion_session` (httpOnly, Secure en producción, SameSite=Lax).
- Errores: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `403 FORBIDDEN` (perfil sin rol o inactivo).

### `GET /auth/me`

```json
{ "data": { "id": "uuid", "fullName": "Ana Pérez", "role": "admin", "churchId": null } }
```

- `401 UNAUTHORIZED` si no hay sesión válida.
- Es la fuente de verdad para los guards de Angular.

### `POST /auth/logout`

Responde `204` y elimina la cookie.

## 4. Estructura organizacional

### `POST /districts`

```json
// request
{ "regionId": "uuid-region", "name": "Distrito Central" }

// response 201
{ "data": { "id": "uuid", "regionId": "uuid-region", "name": "Distrito Central", "isActive": true } }
```

Errores: `400 VALIDATION_ERROR`, `404 NOT_FOUND` (región inexistente), `409 DUPLICATE_NAME`.

### `POST /churches`

```json
// request
{
  "districtId": "uuid-district",
  "name": "Iglesia Central Cochabamba",
  "address": "Av. Bolívar N° 123",
  "leadPastorId": "uuid-pastor"
}

// response 201
{
  "data": {
    "id": "uuid",
    "name": "Iglesia Central Cochabamba",
    "district": { "id": "uuid-district", "name": "Distrito Central" },
    "region": { "id": "uuid-region", "name": "Cochabamba" },
    "leadPastor": { "id": "uuid-pastor", "fullName": "Juan Ruiz" },
    "pastorCount": 3
  }
}
```

Errores: `400 VALIDATION_ERROR`, `404 NOT_FOUND`, `409 DUPLICATE_NAME`, `403 FORBIDDEN`.

### `GET /churches/:id`

Devuelve el mismo DTO que el ejemplo anterior. El rol `pastor` solo puede consultar su propia iglesia; en caso contrario `403 FORBIDDEN`.

## 5. Pastores

### `POST /pastors`

```json
// request
{
  "churchId": "uuid-church",
  "firstName": "Juan",
  "lastName": "Ruiz"
}

// response 201
{
  "data": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Ruiz",
    "churchId": "uuid-church",
    "registeredBy": "uuid-usuario-sesion",
    "createdAt": "2026-12-01T09:24:00.000Z",
    "isActive": true
  }
}
```

> Solo nombre y apellido son datos del pastor. `registeredBy` y `createdAt` se generan automáticamente desde la sesión; el cliente no los envía.

## 6. Asistencia

### `POST /attendances`

```json
// request
{ "eventId": "uuid-event", "pastorId": "uuid-pastor", "notes": "Registro en recepción" }

// response 201
{
  "data": {
    "id": "uuid",
    "pastorId": "uuid-pastor",
    "pastorFullName": "Juan Ruiz",
    "churchName": "Iglesia Central Cochabamba",
    "status": "registered",
    "checkedInAt": "2026-12-01T09:15:00-04:00",
    "registeredByName": "Ana Pérez"
  }
}
```

**Reglas**

- `UNIQUE(event_id, pastor_id)` en la base y verificación previa en `AttendanceService`.
- Si el pastor ya está registrado: `409 DUPLICATE_ATTENDANCE`.
- `registeredBy` se toma del usuario autenticado, nunca del body.
- El pastor autenticado solo puede registrar su propio `pastorId`.

### `GET /attendances`

Ejemplo: `GET /attendances?eventId=uuid&districtId=uuid&status=confirmed&page=1&pageSize=20`

```json
{
  "data": [ /* AttendanceDto[] */ ],
  "meta": { "total": 87, "page": 1, "pageSize": 20 }
}
```

## 7. Reportes

### `GET /reports/attendance?groupBy=region`

```json
{
  "data": [
    {
      "regionId": "uuid",
      "regionName": "Cochabamba",
      "districtName": "Distrito Central",
      "churchName": "Iglesia Central Cochabamba",
      "totalRegistered": 42,
      "totalConfirmed": 38,
      "lastCheckIn": "2026-12-02T17:40:00-04:00"
    }
  ]
}
```

`groupBy` acepta `region`, `district` o `church`. Los consultores solo tienen acceso de lectura.

## 8. Usuarios y roles

### `POST /users`

```json
// request
{ "email": "operador@iglesia.org", "fullName": "Carlos Méndez", "role": "operator" }

// response 201
{ "data": { "id": "uuid", "email": "operador@iglesia.org", "role": "operator", "isActive": true } }
```

- Implementado con el cliente admin del backend (`auth.admin.createUser`).
- Solo `admin`. Nunca se expone este cliente al frontend.

## 9. Códigos de estado

| Código | Uso |
| --- | --- |
| `200` | Consulta o actualización correcta |
| `201` | Recurso creado |
| `204` | Sin contenido (logout, desactivación) |
| `400` | Validación de entrada fallida |
| `401` | Sesión ausente, expirada o credenciales inválidas |
| `403` | Rol sin permiso o alcance insuficiente |
| `404` | Recurso no encontrado |
| `409` | Conflicto: duplicado o referencia inválida |
| `500` | Error inesperado (sin detalles internos) |

## 10. Pruebas de contrato

Cada endpoint debe tener al menos:

1. Caso feliz con el rol permitido → status y forma de `data`.
2. Sin sesión → `401`.
3. Rol no permitido → `403`.
4. Entrada inválida → `400` con `details`.
5. Conflicto de negocio → `409` con el código correcto.

Las pruebas viven en `backend/tests/integration/` y usan Supabase local.
