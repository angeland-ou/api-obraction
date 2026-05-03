# Obraction — Backend API

API REST para la gestión integral de obras y proyectos de construcción. Backend de la aplicación SaaS multi-tenant **Obraction**, desarrollada como proyecto final de ciclo de Desarrollo de Aplicaciones Web.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| **Node.js** | Entorno de ejecución |
| **Express** | Servidor HTTP |
| **Prisma ORM** | Acceso a base de datos y migraciones |
| **PostgreSQL** | Base de datos relacional (via Supabase) |
| **JWT** | Autenticación stateless |
| **bcrypt** | Hash de contraseñas |
| **Zod** | Validación de inputs |
| **Resend** | Envío de emails transaccionales |
| **Multer** | Gestión de subida de archivos |
| **Supabase Storage** | Almacenamiento de archivos en la nube |
| **Helmet** | Seguridad HTTP |
| **express-rate-limit** | Protección contra fuerza bruta |
| **cors** | Control de origen de peticiones |
| **morgan** | Logs de peticiones HTTP |
| **swagger-ui-express** | Documentación de la API |

---

## Requisitos previos

- Node.js 18 o superior
- npm
- Docker Desktop (para entorno local con Supabase CLI)
- Supabase CLI

---

## Instalación y puesta en marcha en local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/obraction-api.git
cd obraction-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y rellena los valores:

```bash
cp .env.example .env.local
```

Variables necesarias:

```bash
NODE_ENV=development
PORT=3000

# Base de datos (Supabase local)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Supabase
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=tu_publishable_key_local
SUPABASE_SERVICE_KEY=tu_secret_key_local

# JWT
JWT_SECRET=genera_un_secret_seguro_con_crypto
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_DOMAIN=localhost

# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TEST_TO_EMAIL=tu_email@gmail.com

# Frontend
FRONTEND_URL=http://localhost:5173

# Storage
STORAGE_PROVIDER=supabase

# bcrypt
BCRYPT_SALT_ROUNDS=12
```

Para generar un JWT_SECRET seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Arrancar Supabase en local

```bash
supabase start
```

Los valores de `SUPABASE_URL`, `SUPABASE_KEY` y `SUPABASE_SERVICE_KEY` aparecerán en la salida del comando. También puedes consultarlos con:

```bash
supabase status
```

### 5. Aplicar las migraciones

```bash
./node_modules/.bin/dotenv -e .env.local -- npx prisma migrate dev
```

### 6. Generar el cliente de Prisma

```bash
./node_modules/.bin/dotenv -e .env.local -- npx prisma generate
```

### 7. Crear los buckets de Storage

Desde Supabase Studio en `http://127.0.0.1:54323`, ve a **Storage** y crea dos buckets:

- `documents` — para documentos de movimientos y proyectos
- `tenants` — para logos de empresa

### 8. Arrancar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

La documentación de la API (Swagger) estará disponible en `http://localhost:3000/api/docs`.

---

## Scripts disponibles

```bash
npm run dev      # Arranca el servidor con nodemon (desarrollo)
npm start        # Arranca el servidor (producción)
```

---

## Estructura del proyecto

```
src/
├── app.js                  # Configuración de Express
├── server.js               # Arranque del servidor
├── config/
│   ├── db.js               # Conexión a Prisma
│   ├── multer.js           # Configuración de subida de archivos
│   └── misc/
│       ├── constants.js    # Variables de entorno centralizadas
│       └── errors.js       # Errores personalizados
├── docs/                   # Documentación Swagger
├── middlewares/
│   ├── auth.middleware.js  # Verificación JWT
│   ├── tenant.middleware.js # Aislamiento multi-tenant
│   └── errorHandler.js     # Gestión centralizada de errores
├── modules/
│   ├── auth/               # Registro, login, logout, activación
│   ├── clients/            # Gestión de clientes
│   ├── projects/           # Gestión de proyectos
│   ├── tasks/              # Gestión de tareas
│   ├── movements/          # Gestión de movimientos económicos
│   └── tenant/             # Datos de empresa y balance global
├── routes/
│   └── index.js            # Enrutador principal
├── services/
│   ├── email/              # Servicio de email con Resend
│   └── storage/            # Abstracción de almacenamiento
└── utils/                  # Utilidades (JWT, hash, slug...)
prisma/
├── schema.prisma           # Modelo de datos
└── migrations/             # Historial de migraciones SQL
```

---

## Despliegue en producción (Render)

### 1. Crear un nuevo servicio Web en Render

Conecta el repositorio de GitHub y configura:

- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start`

### 2. Configurar variables de entorno en Render

Añade todas las variables del `.env.example` con los valores de producción. Las más importantes:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://postgres:PASSWORD@db.XXXX.supabase.co:5432/postgres
SUPABASE_URL=https://XXXX.supabase.co
SUPABASE_KEY=tu_publishable_key_produccion
SUPABASE_SERVICE_KEY=tu_secret_key_produccion
JWT_SECRET=secret_seguro_produccion
CORS_ORIGIN=https://api.obraction.com
COOKIE_DOMAIN=obraction.com
FRONTEND_URL=https://obraction.com
```

### 3. Aplicar migraciones en producción

Desde tu máquina local, con las variables de producción:

```bash
dotenv -e .env.production -- npx prisma migrate deploy
```

---

## Entornos

| Entorno | Base de datos | Storage | URL API |
|---|---|---|---|
| Local | Supabase local (Docker) | Supabase local (Docker) | `http://localhost:3000` |
| Staging | Supabase staging | Supabase staging | — |
| Producción | Supabase producción | Supabase producción | `https://api.obraction.com` |

---

## Documentación de la API

La API está documentada con OpenAPI 3.0 y disponible en `/api/docs` cuando el servidor está en marcha.

---

## Autor

Ángela — Proyecto Final de Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web
