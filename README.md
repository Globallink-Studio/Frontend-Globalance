# Globalance Frontend

Frontend de Globalance, una billetera virtual multimoneda orientada a freelancers que reciben pagos en diferentes divisas.

## Despliegue

- **Frontend:** https://main-eta-jet.vercel.app/
- **API de Producción:** https://backend-globalance-production-5e5a.up.railway.app
- **Documentación API (Swagger):** https://backend-globalance-production-5e5a.up.railway.app/api/docs

## Descripción

Globalance permite a los usuarios gestionar dinero en múltiples monedas dentro de una única billetera digital. Este repositorio contiene la aplicación frontend que consume la API de servicios del sistema.

En esta primera versión del frontend, orientada a la primera demostración, se ha implementado:

- Autenticación con Firebase Authentication (login, registro, login con Google y logout).
- Dashboard con saldos en tiempo real de la billetera (ARS, USD y EUR).
- Gestión y lectura de perfiles especializados para personas y empresas.
- Módulos de billetera, transferencias, conversiones, grupos y tarjetas.
- Capa de acceso a datos (`src/api/`) que abstrae los mocks locales del backend real.
- Recarga y acceso directo por URL dentro del dashboard (SPA fallback en Vercel).
- Rutas protegidas que redirigen al home cuando no hay sesión activa.
- Documentación de integración con el backend en `referencias/guia-integracion.md`.

## Tecnologías

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router 7
- Firebase SDK (Authentication)
- Recharts (gráficos)
- Lucide React (íconos)
- Vercel (Despliegue)

## Arquitectura del Proyecto

El proyecto sigue una arquitectura por capas donde cada dominio de negocio está aislado:

```
src
├── api              # Capa de acceso: lo que consumen las páginas (auth, wallets, balances, users, ...)
│   ├── auth.ts      # Autenticación (mock o Firebase + sync con el back)
│   ├── wallets.ts   # Consulta de información de la billetera
│   ├── balances.ts  # Consulta de balances de la billetera
│   ├── users.ts     # Gestión de datos de perfil (Persona/Empresa)
│   └── ...
├── components       # Componentes visuales reutilizables
│   ├── layout       # Layout del dashboard, tabs
│   └── register     # Formularios de registro (personal/empresa)
├── data             # Mocks globales del dashboard (métricas, gráficos, landing)
├── firebase         # Configuración del SDK de Firebase
├── hooks            # Hooks de lógica de estado (useAsync, useAuthForm, ...)
├── mocks            # Datos y handlers simulados para desarrollo local
│   ├── data         # Entidades y sus tipos
│   └── handlers     # Funciones async que leen/mutan los mocks
├── pages            # Páginas de la aplicación
│   ├── public       # Home, signin, signup
│   └── private      # Dashboard, wallet, transactions, groups, profile, ...
├── providers        # Estado global (AuthProvider)
├── routes           # Configuración de rutas y rutas protegidas
├── styles           # CSS global y por página
└── utils            # Utilidades (validación de formularios)
```

### Orden de dependencia entre capas

```
pages → api → mocks/handlers → mocks/data
```

Las páginas **no** importan directamente de `src/mocks/`; siempre pasan por `src/api/`. Esta separación permite reemplazar la fuente de datos (mocks o backend real) sin tocar la interfaz.

### Mocks vs. API real

La aplicación funciona con mocks locales en desarrollo y con la API real en producción. La decisión se toma según el modo de autenticación:

- `VITE_AUTH_MODE=` vacío → en dev local usa **mocks**, en el build de producción usa **Firebase + API**.
- `VITE_AUTH_MODE=mock` → fuerza los mocks incluso en build.
- `VITE_AUTH_MODE=firebase` → fuerza Firebase + API incluso en dev local.

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Globallink-Studio/Frontend-Globalance.git
cd main
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Cree un archivo `.env` en la raíz tomando como referencia el archivo `.env.example`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=
VITE_AUTH_MODE=
```

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | Clave de API del proyecto en Firebase. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación del proyecto en Firebase. |
| `VITE_FIREBASE_PROJECT_ID` | Identificador del proyecto en Firebase. |
| `VITE_FIREBASE_APP_ID` | Identificador de la aplicación web en Firebase. |
| `VITE_API_URL` | URL de la API del backend (incluye `/api`). |
| `VITE_AUTH_MODE` | `mock` (mocks locales) \| `firebase` (Firebase + API). Vacío = dev usa mock, build usa firebase. |

No usar `.env.local`: Vite le da prioridad y puede pisar valores de `.env`. En Vercel hay que repetir las variables en *Project Settings → Environment Variables* (los `.env` no suben al deploy).

## Ejecución de la Aplicación

### Modo Desarrollo (con recarga automática)

```bash
npm run dev
```

El servidor iniciará por defecto en `http://localhost:5173`.

### Modo Producción

Compilar el código TypeScript:

```bash
npm run build
```

Previsualizar la compilación localmente:

```bash
npm run preview
```

## Endpoints Consumidos de la API

Todos los endpoints requieren la cabecera de autorización con un token válido de Firebase:

```
Authorization: Bearer <Firebase ID Token>
```

### Autenticación

| Endpoint | Uso en el frontend |
|---|---|
| `POST /auth/sync` | Crea el usuario en la base de datos + billetera + balances iniciales si es la primera vez. Se llama en cada login/registro. |

### Usuarios

| Endpoint | Uso en el frontend |
|---|---|
| `GET /users/profile` | Muestra el perfil del freelancer (Persona o Empresa). |
| `PATCH /users/profile` | Completa el perfil con los datos complementarios (pendiente de integrar el flujo de registro). |

### Billetera y Cuentas

| Endpoint | Uso en el frontend |
|---|---|
| `GET /wallet` | Obtiene los metadatos y el identificador único de la billetera del usuario. |
| `GET /balances` | Obtiene el balance actual de cada divisa (ARS, USD, EUR) de la billetera. |

> El backend todavía no expone transacciones, conversiones, tarjetas, contactos ni grupos. Mientras tanto esos módulos usan mocks locales.

## Modelo de Negocio

El modelo financiero de Globalance está estructurado de la siguiente forma:

- Cada usuario posee una única billetera (wallet).
- Cada billetera tiene asociados tres balances activos fijos correspondientes a las divisas:
  - ARS (Peso Argentino)
  - USD (Dólar Estadounidense)
  - EUR (Euro)
- Las conversiones de divisas modifican el balance de las cuentas existentes; no se crean billeteras ni cuentas adicionales dinámicamente.
- La selección de cuenta Personal/Empresa en el registro aún no se persiste en el backend: el usuario se crea con `user_type: null` y el perfil se muestra con heurísticas y fallback al `displayName` de Firebase (pendiente de integración).

## Próximas Funcionalidades (Roadmap)

- Persistir el tipo de cuenta (Persona/Empresa) en el backend al registrarse (`PATCH /users/profile`).
- Historial de transacciones real conectado al backend.
- Módulo de conversión interna de divisas con tasas reales.
- Flujo de transferencias directas entre usuarios de la plataforma.
- Módulos de tarjetas, contactos y grupos conectados a la API real.
- Tests unitarios con Vitest.

## Equipo de Desarrollo

GlobalLink Studio:

- Manuela Henao
- Jazmín
- Lucía
- Fernanda
