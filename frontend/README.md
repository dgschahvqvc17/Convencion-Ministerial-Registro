# Frontend

Aplicación web Angular standalone. Arquitectura **MVC**: `models/` (estado + servicios HTTP), `views/` (componentes presentacionales) y `controllers/` (páginas que coordinan).

> Estado: **implementado**. `npm run build` y `npm run typecheck` pasan correctamente.

## Ejecutar

```bash
npm install
npm start
```

App: http://localhost:4200 · El backend debe estar en http://localhost:3000.

Para apuntar a otro servidor, cambie `apiBaseUrl` en `src/environments/environment.ts`.

## Estructura implementada

```text
src/
├── index.html                  # fuentes Montserrat / Inter / Pacifico
├── styles.scss                 # sistema de diseño (paleta de la guía visual)
├── environments/environment.ts # URL de la API
└── app/
    ├── app.component.ts
    ├── app.config.ts           # router, HttpClient, interceptor, APP_INITIALIZER
    ├── core/
    │   ├── api.config.ts
    │   ├── guards/             # auth.guard.ts, role.guard.ts
    │   └── interceptors/       # api.interceptor.ts (cookie + errores)
    ├── models/
    │   ├── api.types.ts
    │   ├── auth/               # auth.service.ts, auth.store.ts
    │   ├── structure/          # structure.service.ts
    │   ├── registration/       # registration.service.ts
    │   └── reports/            # reports.service.ts
    ├── views/
    │   ├── shared/             # page-header, stat-card, state-block
    │   ├── login/
    │   ├── shell/
    │   ├── dashboard/
    │   ├── structure/
    │   ├── pastors/
    │   ├── attendance/
    │   ├── reports/
    │   └── users/
    ├── controllers/            # login, shell, dashboard, estructura, pastores, asistencia, reportes, usuarios
    └── routes/app.routes.ts    # rutas lazy + guards
```

## Correspondencia MVC

| Letra | Implementación |
| --- | --- |
| Model | `models/` (servicios `HttpClient` + stores con `signal`) |
| View | `views/` (templates y SCSS, sin HTTP) |
| Controller | `controllers/` (eventos → llamadas al Modelo → estado) |

## Reglas

1. Las vistas no inyectan `HttpClient`: reciben `input()` y emiten `output()`.
2. Los controladores traducen eventos en llamadas al Modelo.
3. Los modelos son la única puerta de comunicación con `/api`.
4. Los listados contemplan cargando, vacío, error y éxito.
5. El interceptor agrega `withCredentials: true` y normaliza errores.
6. Los guards se basan en `GET /api/auth/me` y en el rol del perfil.
7. Ningún componente importa `@supabase/supabase-js`.

## Diseño

Identidad visual tomada de [`../convenci_n_ministerial.md`](../convenci_n_ministerial.md): azul real profundo, dorado, tricolor boliviano, tipografías Montserrat/Inter/Pacifico, glassmorphism, animaciones sutiles y accesibilidad (`aria-live` en estados).

Contrato de API: [`../docs/13-api-rest.md`](../docs/13-api-rest.md).
