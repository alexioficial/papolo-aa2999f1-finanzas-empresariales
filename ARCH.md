# ARCH — Sistema de Gestion de Finanzas Empresariales

## Resumen Ejecutivo

Sistema full-stack para gestion de ingresos/egresos empresariales con dashboard, CRUD de transacciones y categorias, autenticacion por roles y exportacion de reportes. Stack: SvelteKit full-stack + MongoDB, desplegado en Coolify.

## Stack Tecnologico

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| Frontend | SvelteKit 5 + TypeScript | SSR, server routes, runes reactivos |
| Estilos | Tailwind CSS 4 | Utilidades, design tokens con `@theme` |
| Backend | SvelteKit server routes (full-stack) | Un solo deploy, sin backend separado |
| DB | MongoDB (cluster compartido) | Documental, flexible, schemas con mongoose |
| Auth | bcryptjs + crypto.randomUUID() + cookies httpOnly | Sessions manuales, sin librerias de terceros |
| Deploy | Coolify + adapter-node + Dockerfile | Puerto 3000, buildpack dockerfile |

## Modelo de Datos

### User
```
{
  _id: ObjectId,
  email: string (unique, lowercase),
  passwordHash: string,
  name: string,
  role: 'admin' | 'user',
  active: boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
Indexes: { email: 1 } unique
```

### Session
```
{
  _id: ObjectId,
  sessionId: string (unique),
  userId: ObjectId -> User,
  expiresAt: Date,
  createdAt: Date
}
Indexes: { sessionId: 1 } unique, { expiresAt: 1 } TTL
```

### Category
```
{
  _id: ObjectId,
  name: string (unique, trim),
  type: 'income' | 'expense' | 'both',
  description: string?,
  color: string? (hex),
  isDefault: boolean,
  active: boolean (default: true),
  createdBy: ObjectId? -> User,
  createdAt: Date,
  updatedAt: Date
}
Indexes: { name: 1 } unique, { type: 1 }, { active: 1 }
```

### Transaction
```
{
  _id: ObjectId,
  type: 'income' | 'expense',
  amount: number (min: 0.01),
  category: ObjectId -> Category,
  description: string (max 500),
  date: Date,
  createdBy: ObjectId -> User,
  notes: string? (max 1000),
  createdAt: Date,
  updatedAt: Date
}
Indexes: { createdBy: 1, date: -1 }, { category: 1 }, { date: -1 }
```

## Rutas API / Server Routes

### Auth
- `POST /api/auth/login` → login con email+password, setea cookie
- `POST /api/auth/logout` → borra session y cookie
- `GET /api/auth/me` → usuario actual (o null)

### Transacciones
- `GET /api/transacciones` → listar (paginado, filtros por fecha/tipo/categoria/search)
- `POST /api/transacciones` → crear (auth required)
- `GET /api/transacciones/[id]` → detalle
- `PUT /api/transacciones/[id]` → editar (dueño o admin)
- `DELETE /api/transacciones/[id]` → eliminar (dueño o admin)

### Categorias (admin only)
- `GET /api/categorias` → listar todas (filtro por tipo)
- `POST /api/categorias` → crear
- `PUT /api/categorias/[id]` → editar
- `DELETE /api/categorias/[id]` → soft-delete (active=false)

### Dashboard
- `GET /api/dashboard` → resumen: balance, ingresos, egresos, ultimas transacciones, categorias agregadas

### Reportes
- `GET /api/reportes/exportar?desde=&hasta=&tipo=` → CSV export

## Autenticacion y Roles

Estrategia: Session-based con cookies httpOnly.

- `hooks.server.ts` lee cookie `session`, valida contra MongoDB, setea `event.locals.user`
- `requireAuth(locals)` → redirect a `/login` si no hay usuario
- `requireAdmin(locals)` → 403 si no es admin
- Roles: **admin** (CRUD categorias, ve todo) y **user** (solo sus transacciones, ve dashboard propio)
- Sliding sessions: se renueva expiracion a 7d en cada request valido

## Flujo de Datos

1. Usuario login → POST /api/auth/login → valida credenciales → crea session en Mongo → setea cookie → redirect a /dashboard
2. Dashboard carga → load function llama GET /api/dashboard (usa locals.user) → aggregation pipeline Mongo → devuelve stats + ultimas transacciones
3. Nueva transaccion → form POST a /api/transacciones → valida server-side (monto>0, categoria existe) → guarda en Mongo → redirect a listado
4. Listado transacciones → load function con query params (page, desde, hasta, tipo, categoria, search) → MongoDB query con filtros → respuesta paginada

## Decisiones y Tradeoffs

| Decision | Elegido | Alternativa | Tradeoff |
|----------|---------|-------------|----------|
| ORM | Mongoose | Driver nativo | Mas boilerplate pero validacion + populate out of the box |
| Session storage | MongoDB | Redis | Sin dependencia extra, mas latencia en cada request |
| Soft-delete categorias | active=false | Hard delete | Transacciones viejas mantienen referencia valida |
| SPA routing | SSR (SvelteKit default) | Full SPA | SEO irrelevante, mejor UX de carga inicial |
| Charts | SVG inline casero | Chart.js | Sin dependencia, menos features graficas |

## Riesgos y Mitigaciones

1. **MONGODB_URI no configurada** → app no arranca. Validacion en hooks con try-catch y log claro.
2. **Cookies rotas en subdominio** → auth no funciona. Usar `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`.
3. **Categoria eliminada con transacciones** → soft-delete con advertencia.
4. **Dashboard lento con muchas transacciones** → indices en `createdBy + date` y `category`. Limitar periodo default a 12 meses.
5. **DB connection eager al boot** → NUNCA. Conexion lazy on-demand.

## Plan de Implementacion

1. **Scaffold**: SvelteKit + dependencias + estructura directorios + Dockerfile
2. **Modelos**: Mongoose schemas (User, Session, Category, Transaction)
3. **Conexion DB**: lazy singleton + env vars
4. **Auth system**: hash/verify, sessions, hooks, API endpoints
5. **API Categorias**: CRUD con soft-delete
6. **API Transacciones**: CRUD con filtros y paginacion
7. **API Dashboard**: aggregation pipeline
8. **UI Layout**: header, sidebar, navegacion responsive
9. **UI Login**: form con validacion
10. **UI Dashboard**: cards + ultimas transacciones + chart por categoria
11. **UI Transacciones**: listado con filtros + form nueva/editar
12. **UI Categorias**: CRUD inline (admin)
13. **UI Reportes**: tabla + export CSV
14. **Seed data**: admin default + categorias + transacciones ejemplo
15. **Deploy**: GitHub repo + Coolify + smoke test
