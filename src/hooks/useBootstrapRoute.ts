import { useEffect, useState } from 'react';
import AuthRepository from '@/repositories/AuthRepository';
import OnboardingRepository from '@/repositories/OnboardingRepository';
import { ROUTES } from '@/constants/routes';

type BootstrapRoute =
  | typeof ROUTES.onboarding
  | typeof ROUTES.tabs.home
  | typeof ROUTES.auth.login;

/**
 * Decide la ruta inicial del splash. Usa el check débil de sesión
 * (getStoredSession, sin validar contra la red) para resolver rápido.
 * Devuelve null mientras carga.
 */
export function useBootstrapRoute(resetKey: number = 0): BootstrapRoute | null {
  const [target, setTarget] = useState<BootstrapRoute | null>(null);

  useEffect(() => {
    let stillMounted = true;
    setTarget(null);

    const resolve = async (): Promise<void> => {
      const [hasCompletedOnboarding, session] = await Promise.all([
        OnboardingRepository.hasCompleted(),
        AuthRepository.getStoredSession(),
      ]);

      if (!stillMounted) return;

      if (!hasCompletedOnboarding) {
        setTarget(ROUTES.onboarding);
      } else {
        setTarget(session ? ROUTES.tabs.home : ROUTES.auth.login);
      }
    };

    void resolve();

    return () => {
      stillMounted = false;
    };
  }, [resetKey]);

  return target;
}

export default useBootstrapRoute;
