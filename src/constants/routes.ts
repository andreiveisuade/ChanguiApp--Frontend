export const ROUTES = {
  root: '/',
  onboarding: '/onboarding',
  tabs: {
    home: '/(tabs)/home',
    settings: '/(tabs)/settings',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
} as const;
