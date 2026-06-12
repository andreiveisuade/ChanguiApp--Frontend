# Guía de defensa oral — ChanguiApp (Entrega 2)

Material para la defensa: dónde está cada cosa en el código y cómo explicarla desde la teoría.
Todas las rutas del **frontend** son relativas a este repo (`ChanguiApp--Frontend`).
Las del **backend** son relativas a `ChanguiApp--Backend`.

---

## 1. Las dos reglas de dependencia (lo primero que hay que poder decir)

Sacadas de `ChanguiApp--Backend/docs/ARQUITECTURA.md`:

1. **Backend — arquitectura por capas:** `Route → Controller → Service → Repository → Supabase`.
   Regla: *"El Controller nunca llama al Repository directamente. Siempre pasa por el Service."*
2. **Frontend — MVVM + Repository:** `View (screen) → ViewModel (hook) → Repository → backend`.
   Regla: *"La View nunca llama al Repository directamente. Siempre pasa por el ViewModel."*

La idea común: cada capa tiene una responsabilidad única (SRP) y depende solo de la de abajo. Eso desacopla UI ↔ negocio ↔ datos y hace todo testeable en aislamiento.

---

## 2. Las cuatro capas del MVVM (teoría + cómo se ve acá)

| Capa | Carpeta | Responsabilidad | Qué NO hace |
|---|---|---|---|
| **View** | `src/screens/` + `src/components/` | Renderiza UI, captura gestos. Consume un hook ViewModel y mapea estado→JSX. Navega con expo-router. | No tiene lógica de negocio ni llama a la API. |
| **ViewModel** | `src/viewmodels/` (hooks `useXxx`) | Estado de UI (`isLoading`, `error`, datos), lógica de presentación, traduce errores. Llama al Repository. | No sabe de axios ni de SQLite. |
| **Model** | `src/types/` | Tipos/interfaces de las entidades de dominio (data types anémicos). Fuente de verdad de la forma de los datos. | No tiene comportamiento. |
| **Data (Repository/Service)** | `src/repositories/` + `src/services/` | Única capa que habla con backend/Supabase/SQLite. Mapea respuestas raw → Model. Services = lógica transversal sin estado de UI (ej. `ErrorTranslationService`). | No tiene estado de presentación. |

Caso especial a mencionar: **Auth** usa un ViewModel global vía React Context (`src/context/AuthContext.tsx`); `useAuth` es solo un re-export que delega ahí.

---

## 3. Mapa por feature — abrir estos archivos en la defensa

Para cada feature: la cadena MVVM del frontend y la cadena por capas del backend, con `file:línea` exactos.

### 3.1 Auth / Login
**Frontend**
- View: `src/screens/auth/LoginScreen.tsx:20`
- ViewModel: `src/viewmodels/useAuth.ts:15` → lógica real en `src/context/AuthContext.tsx` (login `:190`, register `:215`, loginWithGoogle `:249`, AuthProvider `:322`)
- Repository: `src/repositories/AuthRepository.ts:114`
- Model: `src/types/auth.ts:33` (`AuthSession`) + `:1` (`User`)

**Backend** (`/api/auth`)
- Route `src/routes/auth.routes.ts:32` → Controller `src/controllers/auth.controller.ts:7` → Service `src/services/auth.service.ts:5` → Repository `src/repositories/auth.repository.ts:5`
- `POST /api/auth/register` → `register` (controller `:7`) → `authService.register`
- `POST /api/auth/login` → `login` (controller `:31`) → `authService.login`
- Extra defensa: rate-limit de auth (`authLimiter`, 10 req/15min) en `index.ts:46`.

### 3.2 Perfil (CRUD del usuario)
**Frontend**
- View: `src/screens/profile/ProfileScreen.tsx:20`
- ViewModel: `src/viewmodels/useProfile.ts:23`
- Repository: `src/repositories/ProfileRepository.ts:9`
- Model: `src/types/auth.ts:1` (`User`)

**Backend** (`/api/users/profile`)
- `GET` → `getProfile` (`user.controller.ts:4`) → `userService.getProfile` (`user.service.ts:6`) → `userRepository.findById` (`user.repository.ts:4`) — **Read**
- `PUT` → `updateProfile` (`user.controller.ts:17`) → `user.service.ts:14` → `userRepository.update` (`user.repository.ts:19`) — **Update**
- `DELETE` → `deleteProfile` (`user.controller.ts:30`) → `user.service.ts:32` → `userRepository.remove` + `removeAuthUser` (`user.repository.ts:31`, `:37`) — **Delete**
- El service filtra campos editables con `ALLOWED_FIELDS` (`user.service.ts:4`).

### 3.3 Carrito (CRUD completo)
**Frontend**
- View: `src/screens/cart/CartScreen.tsx:18`
- ViewModel: `src/viewmodels/useCart.ts:22` (el `addItem` se dispara desde `useProductFound`)
- Repository: `src/repositories/CartRepository.ts:116`
- Model: `src/types/domain.ts:54` (`CartWithItems`)

**Backend** (`/api/cart`)
- `GET /api/cart` → `getCart` (`cart.controller.ts:4`) → `cartService.getCart` (`cart.service.ts:5`) → `cartRepository.findActiveCartByUserId` — **Read**
- `POST /api/cart/items` → `addItem` (`cart.controller.ts:13`) → `cart.service.ts:26` → `createCart`/`addOrUpdateItem` — **Create** (upsert si duplicado)
- `PUT /api/cart/items/:id` → `updateItem` (`cart.controller.ts:36`) → `cart.service.ts:43` — **Update** (quantity 0 = borra)
- `DELETE /api/cart/items/:id` → `removeItem` (`cart.controller.ts:54`) — **Delete**
- `DELETE /api/cart` → `cancelCart` (`cart.controller.ts:63`)
- Dato fino para la defensa: en `cart.routes.ts` el `DELETE '/'` se registra **antes** que `DELETE '/items/:id'` a propósito, para que `/` no matchee como `:id`.

### 3.4 Catálogo / Productos + Scanner
**Frontend**
- View producto: `src/screens/scanner/ProductFoundScreen.tsx:18` / View scanner: `src/screens/scanner/ScannerScreen.tsx:17`
- ViewModel: `src/viewmodels/useProductFound.ts:32` (calcula subtotal/IVA) / `src/viewmodels/useScanner.ts:15`
- Repository: `src/repositories/ScannerRepository.ts:10` (cache-first sobre `ProductCatalogRepository.ts:109` SQLite local) → cae a red si falta
- Model: `src/types/domain.ts:8` (`Product`)

**Backend** (`/api/products`)
- `GET /api/products/barcode/:code` → `getByBarcode` (`product.controller.ts:4`) → `productService.getByBarcode` (`product.service.ts:88`) → `productRepository.findByBarcode` (`product.repository.ts:5`) — **Read**
- El service inyecta el IVA con `calculatePricing` (`pricing.service.ts`).

### 3.5 Checkout (Mercado Pago)
**Frontend**
- View: `src/screens/checkout/CheckoutConfirmationScreen.tsx:20`
- ViewModel: `src/viewmodels/useCheckout.ts:28` (inicia pago) + `src/viewmodels/useCheckoutStatus.ts` (polling)
- Repository: `src/repositories/CheckoutRepository.ts:14`
- Model: `src/repositories/CheckoutRepository.ts:3` (`CheckoutPreference`, `CheckoutStatus`)

**Backend** (`/api/checkout`)
- `POST /api/checkout` → `create` (`checkout.controller.ts:10`) → `checkoutService.createPreference` (`checkout.service.ts:32`) — **Create** preferencia
- `POST /api/checkout/webhook` → `webhook` (`checkout.controller.ts:52`) → `handleWebhook` (`checkout.service.ts:105`) → crea la `purchase` + cierra el carrito (público, lo llama MP)
- Seguro anti-cobro real: `assertTestCredentials` (`checkout.service.ts:20`).

### 3.6 Historial de compras
**Frontend**
- View: `src/screens/purchases/PurchaseHistoryScreen.tsx:39` (detalle: `PurchaseDetailScreen.tsx:15`)
- ViewModel: `src/viewmodels/usePurchaseHistory.ts:14` (detalle: `usePurchaseDetail.ts:14`)
- Repository: `src/repositories/PurchaseRepository.ts:56`
- Model: `src/types/domain.ts:77` (`Purchase`, `PurchaseItem`, `PurchaseDetail`)

**Backend** (`/api/purchases`)
- `GET /api/purchases` → `list` (`purchase.controller.ts:4`) → `purchaseService.list` (`purchase.service.ts:5`) — **List** (filtro `?status`)
- `GET /api/purchases/:id` → `getById` (`purchase.controller.ts:18`) → `purchase.service.ts:9` — **Read** detalle
- Dato fino: el detalle arma el IVA con la alícuota **congelada** en el ticket (`i.tax_rate`), no la categoría actual del producto.

### 3.7 Middleware del backend (transversal — buen tema de defensa)
- `authMiddleware` (`src/middleware/auth.ts:4`): Bearer token → `supabaseAuth.auth.getUser` → `req.user`; 401 si falta/invalida.
- `errorHandler` global (`src/index.ts:111`, registrado `:153`): mapea `ApiError`, status custom, JSON malformado, body too large; filtra mensajes 5xx en prod.
- `validate` + cadenas `express-validator` (`src/middleware/validators.ts:5`).
- Rate-limit global + auth (`index.ts:39`, `:46`); `helmet`/`cors`/`morgan` (`index.ts:30`).

---

## 4. Narrativa end-to-end para la defensa: "el usuario escanea un producto"

El mejor guion para mostrar las dos arquitecturas de punta a punta (de `ARQUITECTURA.md §4`):

```
[App] Usuario escanea el código
 → View ScannerScreen detecta el código
 → ViewModel useScanner llama a ScannerRepository.getProductByBarcode(code)
 → Repository: cache-first en SQLite; si falta, GET /api/products/barcode/:code

   [Backend] Route → Controller (extrae param) → Service (getByBarcode + IVA) → Repository (SELECT en products)

 → Respuesta sube por las capas
 → ViewModel actualiza estado con el producto
 → View ProductFoundScreen renderiza nombre, marca, precio
```

---

## 5. Checklist de CRUDs a testear (criterio de aprobación)

Derivado de `ChanguiApp--Backend/docs/Plan_de_Pruebas.md §8`. Probar cada uno por la app (frontend) end-to-end:

**Auth** — registro OK (201) · email existente (409) · login OK (200) · password mal (401) · sin token (401)
**Perfil** — GET perfil (200) · PUT `full_name` (200) · PUT body vacío (400) · DELETE cuenta (200)
**Productos** — barcode existente (200) · inexistente (404) · sin token (401)
**Carrito** — GET vacío (`{cart:null, total:0}`) · POST item (201) · duplicado→upsert · PUT quantity 0→borra · DELETE item ajeno (403)
**Checkout** — POST con carrito (preference_id+init_point) · sin carrito/vacío (400) · webhook aprobado→completed+cart cerrado · rechazado→failed
**Historial** — GET lista DESC · filtro `?status=completed` · detalle propio (200) · detalle ajeno (404, ownership)

**Flujo crítico completo:** registro → login → escanear → agregar al carrito + ver total/IVA → checkout MP sandbox → ver historial.

### Aclaraciones de alcance (importante para no quedar mal en la defensa)
- **Listas de compras:** está el Model (`domain.ts` `ShoppingList`) y componentes de UI, pero **no hay** screen/ViewModel/Repository ni rutas en el backend. Es la única capa Model sin las demás conectadas. Si la profe pregunta: feature esbozada, fuera del MVP de esta entrega.
- **Supermercados (`/api/stores`):** implementado en backend pero declarado fuera de alcance en el `Plan_de_Pruebas`. Testeo opcional.
