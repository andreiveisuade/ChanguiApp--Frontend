import { QueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/debugStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sin retry: paridad con el comportamiento previo (useAsyncAction no
      // reintentaba). Evita reintentar 401/4xx, que re-disparan el flujo de
      // sesión expirada y demoran el error.
      retry: false,
      // En RN no hay window focus cableado; explícito para que no haya refetch
      // sorpresa si más adelante se conecta focusManager.
      refetchOnWindowFocus: false,
      // Sin esto el default v5 es 0 → toda query se considera obsoleta apenas
      // llega y refetchea en cada mount. Como los tabs se desmontan al cambiar
      // de pantalla, alternar Home/Carrito/Perfil re-pegaba al backend aunque
      // el dato estuviera fresco. 1 min cubre la navegación normal; las
      // mutaciones siguen actualizando el cache al instante (optimista).
      staleTime: 60_000,
    },
  },
});

// Registra en el debug overlay cuándo una pantalla se sirve de datos frescos en
// cache (RAM) sin pegar al backend: es el contrapunto visible del staleTime. Si
// la query está vencida o no tiene datos, no se loguea acá porque va a fetchear
// y esa llamada queda registrada por su propio origen (http/sqlite).
queryClient.getQueryCache().subscribe((event) => {
  if (event.type !== 'observerAdded') return;
  const query = event.query;
  if (query.state.data !== undefined && !query.isStale()) {
    logger.call({ source: 'cache', message: `hit ${JSON.stringify(query.queryKey)}` });
  }
});
