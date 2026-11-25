# Frontend

Aplicación web Angular. Arquitectura **MVC** adaptada a Angular: `models/` (estado + servicios HTTP), `views/` (componentes presentacionales) y `controllers/` (componentes contenedores de página).

> Estado: carpeta de arquitectura. El código se escribirá en la Fase 1.

## Estructura MVC

```text
frontend/
├── public/                 # assets estáticos
└── src/app/
    ├── core/               # interceptores, guards, tokens, configuración
    ├── shared/             # componentes y utilidades reutilizables
    ├── models/             # MODEL: interfaces, servicios HTTP y stores (signals)
    ├── views/              # VIEW: componentes presentacionales con template
    ├── controllers/        # CONTROLLER: páginas que coordinan eventos y estado
    ├── routes/             # definición de rutas lazy
    └── app.*
```

## Reglas

1. Las vistas no inyectan `HttpClient` ni conocen Supabase: reciben datos por `input()` y emiten eventos por `output()`.
2. Los controladores manejan eventos de usuario, llaman a `models/` y preparan el estado para la vista.
3. Los modelos son la única puerta de comunicación con el backend (`/api`).
4. Todo listado contempla cuatro estados: cargando, vacío, error y éxito.
5. Los textos visibles son en español; los identificadores de código en inglés.

## API

El frontend consume el backend en `/api` con cookies de sesión (`withCredentials: true`). Contrato en [`../docs/13-api-rest.md`](../docs/13-api-rest.md).
