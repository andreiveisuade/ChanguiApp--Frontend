import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Wrapper para renderHook/render en tests: QueryClient fresco por test,
// sin retry para que los casos de error no esperen backoff.
export const createQueryWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const client = new QueryClient({
    defaultOptions: {
      // gcTime: 0 → la query se libera al desmontar, sin timers colgados que
      // disparen el warning "worker failed to exit" de jest.
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};
