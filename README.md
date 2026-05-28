# ChanguiApp — Frontend

Aplicacion movil en React Native para Android e iOS que permite a consumidores argentinos controlar el total de su compra en tiempo real escaneando productos con la camara del celular.

---

## Quickstart

```bash
# 1. Clonar e instalar
git clone https://github.com/andreiveisuade/ChanguiApp--Frontend.git
cd ChanguiApp--Frontend
git checkout dev
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Completar con tus credenciales (ver seccion "Variables de Entorno")

# 3. Levantar el dev server de Expo
npx expo start
# Escanear el QR con Expo Go (Android/iOS), o presionar:
#   'a' para emulador Android, 'i' para simulador iOS, 'w' para web
```

---

## Requisitos previos

Antes de clonar, asegurate de tener instalado:

1. **Node.js >= 18** — [descargar](https://nodejs.org/)
2. **Android Studio** — [descargar](https://developer.android.com/studio)
   - Instalar Android SDK (API Level 26+)
   - Configurar un emulador o conectar dispositivo fisico via USB
   - Agregar `ANDROID_HOME` a las variables de entorno del sistema
3. **React Native CLI** — `npm install -g react-native-cli`
4. **JDK 17** — viene con Android Studio o [descargar aparte](https://adoptium.net/)

Para verificar que todo esta bien:

```bash
npx react-native doctor
```

---

## Stack

| Capa | Tecnologia | Descripcion |
|------|-----------|-------------|
| Framework | React Native + Expo | App movil multiplataforma (Android + iOS) |
| Patron | MVVM + Repository | Separacion de responsabilidades |
| Auth | Supabase Auth + AuthContext | Google Sign-In + email/contrasena, estado compartido |
| Navegacion | Expo Router | File-based routing en `app/` |
| HTTP | `apiFetch` helper (fetch wrapper) | Auth automatico + manejo de 401 |
| i18n | react-i18next | Internacionalizacion (espanol + ingles) |
| Scanner | expo-camera | Escaneo de codigos de barras (DEV-30, pendiente) |
| Pagos | Mercado Pago (WebView) | Checkout in-app en sandbox |

---

## Arquitectura (MVVM + Repository)

```
src/
├── screens/              # View — pantallas de la app (solo renderiza UI)
├── viewmodels/           # ViewModel — hooks (useCart, useAuth, useScanner, etc.)
├── repositories/         # Repository — unica capa que habla con el backend (HTTP)
├── components/           # Componentes reutilizables (atoms en components/atoms/)
├── context/              # Providers de estado compartido (AuthContext)
├── config/               # Config de servicios externos (supabase)
├── i18n/                 # Internacionalizacion
│   └── locales/
│       ├── es.json       # Textos en espanol
│       └── en.json       # Textos en ingles
├── navigation/           # Helpers de navegacion
├── types/                # Tipos de dominio + errores
└── utils/                # Helpers (apiFetch, authEvents, theme, currency, ...)
```

**Regla clave:** la Screen (View) NUNCA llama al Repository directamente. Siempre pasa por el ViewModel (hook).

```
Screen → ViewModel (hook) → Repository → apiFetch → Backend API
```

### Reglas de i18n

- NUNCA escribir texto directo en un componente (`<Text>Pagar</Text>`)
- SIEMPRE usar el hook: `const { t } = useTranslation();` y luego `<AppText>{t('pay')}</AppText>`
- Al agregar un texto nuevo, agregarlo a AMBOS archivos: `es.json` y `en.json`

### Reglas de design system

- Usar `<AppText variant="...">` en lugar de `<Text>` (variants: Display, H1, H2, H3, Body, Label, Price).
- Usar `<AppIcon name="..." />` en lugar de importar Ionicons/Feather/MaterialCommunityIcons directo. Si falta un icono, agregarlo al map de `src/components/atoms/AppIcon.tsx`.
- Colores: SIEMPRE desde `colors.*` de `@/utils/theme`. Si falta un token, agregarlo al theme (no hardcodear hex literals).
- Spacing y touch targets: usar `spacing.*` y `touchTarget.*` de `@/utils/theme` (44x44 minimo en botones).
- Accesibilidad: todo boton interactivo debe tener `accessibilityRole`, `accessibilityLabel` y `accessibilityHint` (este ultimo via i18n).

### Autenticacion — patterns obligatorios

#### `useAuth()` — consumir estado de sesion

```ts
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

`useAuth` es un wrapper de `useAuthContext`. **El estado de sesion es unico** en toda la app (vive en `<AuthProvider>` montado en `app/_layout.tsx`). No hay duplicacion.

#### `apiFetch()` — todo repository que pegue al backend autenticado lo usa

```ts
// src/repositories/MyRepository.ts
import { apiFetch } from '@/utils/apiFetch';

export const MyRepository = {
  async getStuff() {
    const response = await apiFetch('/api/stuff');
    return response.json();
  },
};
```

`apiFetch` se encarga de:

- Leer el token de la sesion guardada e inyectar `Authorization: Bearer <token>`.
- Si el backend devuelve **401**: limpia la sesion local, emite el evento `sessionExpired` (que el `AuthContext` escucha) y lanza `AuthSessionExpiredError`.
- Si la respuesta no es OK: lanza un `Error` con el mensaje del backend.

**NO usar `fetch` directo en repositories.** Duplica logica de auth y rompe el manejo automatico de sesion expirada.

#### `AuthSessionExpiredError` — distinguir errores de auth en viewmodels

```ts
// src/viewmodels/useMyHook.ts
import { AuthSessionExpiredError } from '@/types/errors';

try {
  const data = await MyRepository.getStuff();
  setData(data);
} catch (err) {
  // Sesion expirada: NO mostrar mensaje al usuario.
  // El AuthContext ya limpio el estado y el guard de tabs redirige a login.
  if (err instanceof AuthSessionExpiredError) {
    return;
  }
  setError(err instanceof Error ? err.message : 'Error');
}
```

#### Guard de autenticacion

El `app/(tabs)/_layout.tsx` tiene un guard que redirige a `/auth/login` si `!isAuthenticated`. **No es necesario duplicar el guard en cada pantalla** — basta con que la ruta este dentro de `(tabs)`.

---

## Variables de Entorno

Copiar `.env.example` a `.env` y completar:

```env
# Backend API
API_BASE_URL=http://localhost:3000

# Supabase (mismas credenciales que el backend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

Las credenciales reales se comparten por el grupo de WhatsApp del equipo. Nunca commitear el `.env`.

---

## Pantallas de la app

| Pantalla | Descripcion | Sprint |
|----------|-------------|--------|
| Onboarding | 3 pantallas de bienvenida (solo primera vez) | Sprint 2 |
| Login / Register | Inicio de sesion y registro | Sprint 4 |
| Seleccion supermercado | Elegir donde estas comprando | Sprint 4 |
| Scanner | Escanear codigo de barras con la camara | Sprint 4 |
| Carrito | Ver items, cantidades, total acumulado | Sprint 4 |
| Listas de compras | Crear/gestionar listas, tachado automatico | Sprint 4-5 |
| Checkout | Pago con Mercado Pago in-app | Sprint 5 |
| Historial | Compras anteriores con cards view | Sprint 5 |
| Perfil | Ver/editar datos, eliminar cuenta, config | Sprint 4-5 |

---

## Scripts

```bash
npx expo start                  # Dev server con QR para Expo Go
npm run android                 # Expo + emulador Android
npm run ios                     # Expo + simulador iOS
npx tsc --noEmit                # Typecheck (correr antes de pushear)
```

> Hay archivos de tests en `__tests__/` pero el repo todavia no tiene la infra de Jest configurada (ver DEV-172). Por ahora `npm test` no existe.

---

## Documentacion del proyecto

| Documento | Ubicacion | Descripcion |
|-----------|-----------|-------------|
| Scope completo | [Backend/docs/Scope_ChanguiApp.md](https://github.com/andreiveisuade/ChanguiApp--Backend/blob/dev/docs/Scope_ChanguiApp.md) | Alcance, endpoints, CRUDs, entregables |
| Guia de contribucion | [CONTRIBUTING.md](./CONTRIBUTING.md) | GitFlow, commits, PRs, reviews |

La documentacion del proyecto esta centralizada en el repo del Backend. El scope, DER, diagramas y Swagger viven ahi.

---

## Equipo

| Integrante | Rol |
|------------|-----|
| Andrei Veis | Scrum Master |
| Ignacio Melinc | Product Owner |
| Ezequiel Lupis | Desarrollador |
| Ignacio Rodriguez | Desarrollador |
| Maximo Vendramini | Desarrollador |

Roles tecnicos (Tech Lead, UX/UI Lead, QA) son rotativos por sprint.

---

## Links

- Backend: [ChanguiApp--Backend](https://github.com/andreiveisuade/ChanguiApp--Backend)
- Jira: [ChanguiApp Board](https://andreiveis360.atlassian.net/jira/software/projects/DEV/boards/1)
- Figma: Pendiente de creacion (Sprint 1 — DEV-15 / DEV-118)

---

UADE — Desarrollo de Aplicaciones I — 2026
