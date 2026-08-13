# 🌍 Globalance Frontend

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://main-eta-jet.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest)](https://vitest.dev/)

> Frontend de **Globalance**, una billetera virtual multimoneda pensada para freelancers y profesionales que reciben pagos en diferentes divisas y necesitan gestionarlos en un solo lugar.

---

## 🚀 Demo

| Entorno | URL |
|---|---|
| **Frontend** | [https://main-eta-jet.vercel.app/](https://main-eta-jet.vercel.app/) |
| **API de Producción** | [https://backend-globalance-production-5e5a.up.railway.app](https://backend-globalance-production-5e5a.up.railway.app) |
| **Documentación API (Swagger)** | [https://backend-globalance-production-5e5a.up.railway.app/api/docs](https://backend-globalance-production-5e5a.up.railway.app/api/docs) |

---

## ✨ ¿Qué es Globalance?

**Globalance** permite a los usuarios:

- Tener una **billetera única con múltiples divisas** (ARS, USD, EUR).
- Ver su **saldo unificado** en la moneda que prefieran.
- **Depositar, transferir, convertir y solicitar pagos** de forma sencilla.
- Gestionar **contactos, tarjetas y categorías**.
- Consultar un **asistente de IA** para cotizaciones y dudas frecuentes.
- Revisar un **dashboard con métricas reales**, gráfico mensual y resumen inteligente.

Este repositorio contiene únicamente la **aplicación frontend**, desarrollada con React, TypeScript y Vite, que consume la API REST del backend.

---

## 🛠️ Tecnologías

- **React 19** + **React DOM 19**
- **TypeScript** para tipado estático
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS 4** para estilos utilitarios
- **React Router 7** para navegación SPA
- **Firebase SDK** para autenticación (email, Google)
- **Recharts** para gráficos interactivos
- **Lucide React** para iconografía
- **Vitest** + **Testing Library** para tests
- **Vercel** para despliegue continuo

---

## ⚡ Funcionalidades principales

### 🔐 Autenticación y registro

- Registro con email y contraseña: crea el **perfil completo** (Persona o Empresa) en el backend y deja la sesión iniciada.
- Login con email y contraseña.
- Login con Google (Firebase Authentication) con flujo de **completar perfil** (Persona o Empresa) al primer ingreso.
- Cierre de sesión.
- Rutas protegidas: el dashboard no es accesible sin sesión activa.

### 📊 Dashboard

- Saldo total unificado con selección de moneda de visualización.
- Métricas reales del mes: ingresos, gastos y saldo total.
- Gráfico de evolución diaria del mes actual.
- Resumen dinámico generado por el asistente de IA.
- Listado rápido de balances por divisa.

### 💰 Billetera

- Visualización del **saldo unificado** y de cada divisa.
- Tarjetas de moneda con código, nombre, monto y tipo de cuenta.
- Acciones rápidas: **Cargar saldo, Transferir, Cobrar, Convertir**.
- Carrusel de **tarjetas físicas** (Apple Wallet style).
- Sección de retiros con estado "Próximamente".
- Últimos movimientos de la billetera.

### 💸 Transferencias

- Transferir a contactos o por alias/número de cuenta.
- Wizard de 2 pasos con revisión antes de confirmar.
- Validaciones de monto y destinatario.

### 💰 Cobrar (solicitudes de pago)

- Solicitar un pago a un contacto o por alias/número de cuenta.
- Estados de la solicitud: pendiente, pagada, cancelada.
- Las solicitudes se registran en el backend (`POST /payment-requests`).

### 🔄 Conversiones

- Conversión entre divisas con cotizaciones en tiempo real.
- Visualización del resultado estimado.
- Sin comisión oculta.
- Historial de cotizaciones en gráfico.

### 📜 Historial de transacciones

- Tabla paginada de movimientos.
- Filtros por tipo, moneda, estado, fechas y búsqueda por concepto.
- Chips de filtro rápido.
- Modal de detalle de transacción.
- Transferencias identificadas como **recibidas** o **enviadas**, con el signo (+/−) correcto según la dirección.

### 👥 Contactos

- Listado de contactos con avatar, alias y categoría.
- Favoritos.
- Crear, editar y eliminar contactos.
- Categorías personalizadas.
- Transferencia rápida desde la tarjeta de contacto.

### 👤 Perfil

- Edición de datos personales/empresariales.
- Gestión de tarjetas (añadir, bloquear, desbloquear, eliminar).
- Configuración de notificaciones.
- Términos y condiciones / Política de privacidad.

### 🤖 Asistente IA

- Chat integrado para consultar cotizaciones de divisas.
- Respuestas simuladas en modo mock y respuestas reales del backend en modo Firebase.
- Mensajes de error amigables ante fallos de red o sesión.

### 🔔 Notificaciones

- Panel desplegable desde la campana.
- Notificaciones de transferencias, depósitos y conversiones.
- Toasts de confirmación.

### 📱 Responsive

- Layout adaptable a escritorio, tablet y mobile.
- Menú hamburguesa con cierre automático al navegar.
- Tablas y filtros adaptados a pantallas chicas.
- Chat optimizado para mobile.

---

## 📁 Arquitectura del proyecto

```
src
├── api                 # Capa de acceso a datos (lo que consumen las páginas)
│   ├── auth.ts         # Autenticación: mock o Firebase + sync con backend
│   ├── balances.ts     # Balances y saldo unificado
│   ├── wallets.ts      # Información de la billetera
│   ├── users.ts        # Perfil de usuario (Persona/Empresa)
│   ├── transactions.ts # Transacciones, depósitos, conversiones y solicitudes
│   ├── exchangeRates.ts# Cotizaciones y conversión de divisas
│   ├── contacts.ts     # Contactos y categorías
│   ├── cards.ts        # Tarjetas del usuario
│   ├── paymentMethods.ts # Métodos de pago / cuentas vinculadas
│   ├── notifications.ts# Notificaciones locales
│   └── assistant.ts    # Asistente de IA
├── components          # Componentes visuales reutilizables
│   ├── layout          # DashboardLayout, topbar, sidebar
│   └── register        # Formularios de registro
├── data                # Mocks globales del dashboard y landing
├── firebase            # Configuración del SDK de Firebase
├── hooks               # Hooks de lógica de estado
├── mocks               # Datos y handlers simulados para desarrollo local
│   ├── data            # Entidades y tipos
│   └── handlers        # Funciones que leen/mutan mocks
├── pages               # Páginas de la aplicación
│   ├── public          # Home, login, registro
│   └── private         # Dashboard, wallet, transactions, profile, assistant, ...
├── providers           # Estado global (AuthProvider)
├── routes              # Configuración de rutas y rutas protegidas
├── styles              # CSS global, por página y por componente
├── test                # Tests unitarios con Vitest
└── utils               # Utilidades (validación de formularios, etc.)
```

### Orden de dependencia

```
pages → api → mocks/handlers → mocks/data
```

Las páginas **nunca** importan directamente desde `src/mocks/`. Siempre pasan por `src/api/`. Esto permite cambiar la fuente de datos (mocks locales o backend real) sin tocar la interfaz de usuario.

---

## 🔀 Modos de ejecución

La aplicación puede funcionar con **mocks locales** o con la **API real + Firebase**. El modo se controla con la variable `VITE_AUTH_MODE`.

| Modo | Descripción |
|---|---|
| `VITE_AUTH_MODE=` vacío | En desarrollo usa **mocks**. En el build de producción usa **Firebase + API**. |
| `VITE_AUTH_MODE=mock` | Fuerza el uso de mocks incluso en el build. |
| `VITE_AUTH_MODE=firebase` | Fuerza el uso de Firebase + API incluso en desarrollo local. |

> **Tip:** Usá `mock` para desarrollar sin depender del backend. Usá `firebase` cuando quieras probar contra la API real.

---

## 🚀 Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Globallink-Studio/Frontend-Globalance.git
cd Frontend-Globalance
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiá el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env
```

```env
# Firebase (obtenido desde console.firebase.google.com)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=

# API del backend
VITE_API_URL=https://backend-globalance-production-5e5a.up.railway.app

# Modo de autenticación: 'mock' | 'firebase' | vacío
VITE_AUTH_MODE=mock
```

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | Clave de API del proyecto de Firebase. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación de Firebase. |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto de Firebase. |
| `VITE_FIREBASE_APP_ID` | ID de la aplicación web en Firebase. |
| `VITE_API_URL` | URL base del backend (sin `/api` al final, ya que se agrega en la capa `fetchApi`). |
| `VITE_AUTH_MODE` | `mock` (mocks locales), `firebase` (Firebase + API), vacío (automático). |

> **Importante:** no uses `.env.local` en Vite. Le da prioridad y puede pisar valores de `.env`. En Vercel las variables se configuran directamente en **Project Settings → Environment Variables**.

### 4. Levantar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 🧪 Tests

El proyecto usa **Vitest** con **Testing Library**. Hay tests por dominio separando los modos `mock` y `firebase`.

```bash
# Ejecutar todos los tests una vez
npm run test

# Ejecutar en modo watch
npm run test:watch
```

> Actualmente el proyecto cuenta con **215 tests** que cubren autenticación, balances, transacciones, solicitudes de cobro, contactos, cotizaciones, dashboard y mensajes de error.

---

## 🚀 Despliegue en Vercel

### Opción A: deploy automático con Git

1. Crear un proyecto en [Vercel](https://vercel.com/).
2. Conectar el repositorio de GitHub.
3. Configurar el **Framework Preset** como `Vite`.
4. Agregar las variables de entorno en **Settings → Environment Variables**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_API_URL`
   - `VITE_AUTH_MODE` (normalmente vacío para que el deploy use Firebase + API)
5. Cada push a la rama configurada genera un nuevo deploy.

### Opción B: deploy manual con Vercel CLI

```bash
# Instalar Vercel CLI si no lo tenés
npm i -g vercel

# Login y deploy
vercel
```

### SPA fallback

Como es una Single Page Application (SPA) con React Router, Vercel necesita redirigir todas las rutas a `index.html`. Esto ya está configurado en `vercel.json` (si existe) o se maneja automáticamente por el preset de Vite.

---

## 🔌 Endpoints consumidos por el frontend

Todos los endpoints reales requieren el token de Firebase en la cabecera:

```
Authorization: Bearer <Firebase ID Token>
```

| Módulo | Endpoint | Uso en el frontend |
|---|---|---|
| **Auth** | `POST /auth/sync` | Crea/actualiza el usuario en el backend, genera billetera y balances iniciales. |
| **Auth** | `GET /auth/me` | Obtiene el usuario autenticado (se usa al restaurar la sesión). |
| **Users** | `POST /users/profile` | Crea el perfil (Persona o Empresa) al registrarse con email o al completar el perfil. |
| **Users** | `GET /users/profile` | Obtiene el perfil completo del usuario. |
| **Users** | `PATCH /users/profile` | Actualiza los datos del perfil. |
| **Users** | `DELETE /users/profile` | Elimina la cuenta del usuario. |
| **Wallets** | `GET /wallet` | Obtiene la billetera del usuario. |
| **Balances** | `GET /balances` | Obtiene los balances por divisa. El saldo unificado se calcula en el frontend con las cotizaciones. |
| **Transactions** | `GET /transactions` | Historial de transacciones. |
| **Transactions** | `POST /transactions/income` | Carga saldo (depósito) en una divisa. |
| **Transactions** | `POST /transactions/transfers/internal` | Transfiere a otro usuario (por alias o número de cuenta). |
| **Transactions** | `POST /transactions/exchange` | Convierte entre divisas. |
| **Transactions** | `POST /payment-requests` | Solicita un cobro a otro usuario (por alias o número de cuenta). |
| **Transactions** | `GET /payment-requests` | Solicitudes de cobro enviadas/recibidas. |
| **Transactions** | `GET /payment-requests/{token}` | Consulta una solicitud de cobro. |
| **Transactions** | `POST /payment-requests/{token}/pay` | Paga una solicitud de cobro recibida. |
| **Transactions** | `PATCH /payment-requests/{id}/cancel` | Cancela una solicitud de cobro. |
| **Contacts** | `GET /contacts` | Lista de contactos. |
| **Contacts** | `POST /contacts` | Crear contacto. |
| **Contacts** | `DELETE /contacts/:id` | Eliminar contacto. |
| **Exchange** | `GET /exchange/rates` | Cotizaciones actuales. |
| **Exchange** | `GET /exchange/rates/history` | Histórico de cotizaciones para el gráfico. |
| **Exchange** | `GET /exchange/quotes` | Cotización puntual para una conversión. |
| **Assistant** | `POST /ai/assistant` | Consulta al asistente de IA. |

> **Nota:** las **tarjetas**, los **métodos de pago** y las **notificaciones** se gestionan con datos locales (`localStorage`), sin endpoints de backend por ahora. En modo **mock**, el resto de los endpoints son interceptados por handlers locales que también persisten en `localStorage`.

---

## 📊 Modelo de negocio

- Cada usuario tiene **una única billetera**.
- Cada billetera tiene **tres balances fijos**: ARS, USD y EUR.
- Las conversiones mueven saldo entre esos balances; no se crean nuevas cuentas.
- Los depósitos, transferencias y conversiones generan transacciones que alimentan el dashboard y el historial.
- El usuario puede elegir la moneda de visualización para el saldo unificado.

---

## 💱 Estrategia de cotizaciones y caching

El frontend consume cotizaciones desde el backend (`/exchange/rates`), el cual a su vez puede integrarse con proveedores como Frankfurter, ExchangeRate-API o Currency Freaks.

### Caché local

- Las cotizaciones se almacenan en `localStorage` bajo las keys:
  - `globalance.rates.last`: últimas cotizaciones completas.
  - `globalance.rates.history`: histórico de puntos por moneda.
- Cada vez que la API responde correctamente, se actualizan ambas keys.
- El histórico se siembra con **30 días** de datos cuando está vacío, usando la cotización actual como referencia.

### Fallback ante fallas

- Si `/exchange/rates` no responde, el frontend devuelve las cotizaciones guardadas en `globalance.rates.last`.
- Si no hay cotizaciones previas, devuelve un array vacío y la UI muestra un mensaje amigable.
- Esto garantiza que el usuario pueda seguir viendo tasas recientes incluso si el proveedor externo tiene problemas momentáneos.

### Frecuencia de actualización

- Las cotizaciones se consultan al cargar la pantalla de **Exchange** y la **Billetera**.
- El usuario puede refrescarlas manualmente con el botón de actualización.
- El backend define la expiración de cada cotización (`expiresAt`); el frontend no cachea más allá de la sesión actual.

---

## 🧠 Decisiones de diseño

### ¿Por qué una wallet única con balances fijos?

Optamos por el modelo **wallet → balances** en lugar de cuentas separadas porque:

- Simplifica la experiencia del usuario: una sola billetera con divisas claras.
- Facilita el saldo unificado: siempre se puede convertir entre ARS, USD y EUR.
- Reduce la complejidad del backend: no hay que crear/eliminar cuentas dinámicamente.
- Es coherente con el negocio: un freelancer opera sobre sus fondos totales, no sobre múltiples cuentas bancarias.

### ¿Por qué transacciones unificadas?

Todas las operaciones (depósito, transferencia, conversión, solicitud) se registran en una única tabla `transactions` con campos como `type`, `direction`, `from_currency` y `to_currency`. Esto permite:

- Un único historial consultable y filtrable.
- Cálculos de ingresos/gastos para el dashboard sin joins complejos.
- Extensibilidad: agregar nuevos tipos de operación no requiere nuevas tablas.

### ¿Por qué modo mock / firebase?

La capa `src/api/` abstrae la fuente de datos. En desarrollo se usan mocks para no depender del backend; en producción se usa Firebase + API. Esta separación permitió:

- Desarrollar UI y lógica de negocio en paralelo al backend.
- Testear flujos sin credenciales reales.
- Cambiar la fuente de datos sin tocar las páginas.

---

## 🗺️ Roadmap

- [x] Autenticación completa con Firebase.
- [x] Dashboard con datos reales y gráfico mensual.
- [x] Billetera con saldo unificado y acciones rápidas.
- [x] Historial de transacciones con filtros y paginación.
- [x] Conversiones con cotizaciones reales.
- [x] Gestión de contactos y categorías.
- [x] Panel de notificaciones y toasts.
- [x] Asistente de IA integrado.
- [x] Responsive completo.
- [x] Tests unitarios con Vitest.
- [ ] Módulo de retiros conectado al backend.
- [ ] Notificaciones push en tiempo real.
- [ ] Modo oscuro persistente.
- [ ] Internacionalización (i18n).

---

## 👥 Equipo

**GlobalLink Studio**

- Manuela Henao
- Jazmín
- Lucía
- Fernanda

---

## 📄 Licencia

Este proyecto es privado y pertenece a GlobalLink Studio.
