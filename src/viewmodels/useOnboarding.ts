import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import OnboardingRepository from '@/repositories/OnboardingRepository';
import { ROUTES } from '@/constants/routes';

/**
 * ViewModel del onboarding. Marca el onboarding como completado (best-effort) y
 * navega al login pase lo que pase, para que la View no toque persistencia ni
 * el repositorio directamente.
 */
export function useOnboarding(): { completeOnboarding: () => Promise<void> } {
  const router = useRouter();

  const completeOnboarding = useCallback(async (): Promise<void> => {
    try {
      await OnboardingRepository.markCompleted();
    } finally {
      router.replace(ROUTES.auth.login);
    }
  }, [router]);

  return { completeOnboarding };
}

export default useOnboarding;
