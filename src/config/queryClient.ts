import { QueryClient } from '@tanstack/react-query';

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
    },
  },
});
