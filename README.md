# ChanguiApp — Frontend

Aplicacion movil en React Native para Android que permite a consumidores argentinos controlar el total de su compra en tiempo real escaneando productos con la camara del celular.

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
# Completar con tus credenciales (ver sección "Variables de Entorno")

# 3. Levantar en emulador Android
npx react-native run-android

# 4. O levantar Metro bundler por separado
npx react-native start
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
| Framework | React Native | App movil multiplataforma (solo Android para este TP) |
| Patron | MVVM + Repository | Separacion de responsabilidades |
| Auth | Supabase Auth | Google Sign-In + email/contrasena |
| Navegacion | React Navigation | Tab navigator + stack navigator |
| HTTP | Axios o Fetch | Comunicacion con el backend |
| i18n | react-i18next | Internacionalizacion (espanol + ingles) |
| Scanner | react-native-camera / expo-barcode-scanner | Escaneo de codigos de barras |
| Pagos | Mercado Pago (WebView) | Checkout in-app en sandbox |

---

## Arquitectura (MVVM + Repository)

```
src/
├── screens/              # View — pantallas de la app (solo renderiza UI)
├── viewmodels/           # ViewModel — hooks (useCart, useLists, useScanner, etc.)
├── repositories/         # Repository — unica capa que habla con el backend (HTTP)
├── components/           # Componentes reutilizables de UI
├── navigation/           # Configuracion de React Navigation
├── i18n/                 # Configuracion de internacionalizacion
│   ├── index.js          # Setup de i18next
│   └── locales/
│       ├── es.json       # Textos en espanol
│       └── en.json       # Textos en ingles
└── utils/                # Helpers genericos
```

**Regla clave:** la Screen (View) NUNCA llama al Repository directamente. Siempre pasa por el ViewModel (hook).

```
Screen → ViewModel (hook) → Repository → Backend API
```

### Reglas de i18n

- NUNCA escribir texto directo en un componente (`<Text>Pagar</Text>`)
- SIEMPRE usar el hook: `const { t } = useTranslation();` y luego `<Text>{t('pay')}</Text>`
- Al agregar un texto nuevo, agregarlo a AMBOS archivos: `es.json` y `en.json`

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
npx react-native run-android    # Compilar y correr en Android
npx react-native start          # Levantar Metro bundler
npm test                        # Correr tests
npm run test:coverage           # Tests + cobertura
```

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
