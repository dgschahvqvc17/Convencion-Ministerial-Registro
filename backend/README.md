# Backend

API REST del sistema de registro. Arquitectura **MVC** sobre **NestJS + TypeScript** (JavaScript tipado). Supabase es la capa de datos y autenticación.

> Estado: carpeta de arquitectura. El código se escribirá en la Fase 1.

## Estructura MVC con NestJS

```text
backend/
├── src/
│   ├── main.ts                    # bootstrap de NestJS
│   ├── app.module.ts              # módulo raíz
│   ├── config/                    # variables de entorno y clientes Supabase
│   ├── modules/                   # módulos por feature (auth, churches, etc.)
│   ├── models/                    # MODEL: entidades, repositorios y servicios
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── views/                     # VIEW: DTOs de salida y mappers JSON
│   │   ├── dtos/
│   │   └── mappers/
│   ├── controllers/               # CONTROLLER: endpoints HTTP (@Controller)
│   ├── guards/                    # autenticación y autorización por rol
│   ├── pipes/                     # validación de entrada (class-validator)
│   ├── interceptors/              # respuesta { data } y logging
│   ├── filters/                   # AppError → JSON de error
│   ├── middlewares/               # cookie-parser y middleware de Nest
│   ├── decorators/                # @CurrentUser, @Roles
│   ├── errors/                    # AppError y códigos
│   └── types/                     # tipos generados de Supabase
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .env.example
```

## Correspondencia MVC

| Letra | Implementación NestJS |
| --- | --- |
| Model | `@Injectable()` services + repositorios que usan el SDK de Supabase |
| View | DTOs de respuesta y mappers `snake_case → camelCase` (JSON, no HTML) |
| Controller | Clases `@Controller()` con `@Get`, `@Post`, `@Patch`, `@Delete` |

Las rutas se declaran en los controladores; por eso no existe una carpeta `routes/` separada. Los módulos en `src/modules/` agrupan controladores y providers por feature.

## Reglas

1. Los controladores son delgados: validan la entrada y delegan en `models/services`.
2. La lógica de negocio vive en `models/services` (`@Injectable()`).
3. `views/` solo transforma entidades a JSON; no consulta la base de datos.
4. Las consultas a Supabase se concentran en `models/repositories`.
5. `AppError` se lanza en servicios y se serializa en `filters/all-exceptions.filter.ts`.
6. La validación de entrada usa DTO con `class-validator` y el `ValidationPipe` global.

## Variables de entorno

Ver `.env.example`. La clave `service_role` **solo** existe aquí, nunca en `frontend/`.

## API

Base: `/api`. Contrato detallado en [`../docs/13-api-rest.md`](../docs/13-api-rest.md).
