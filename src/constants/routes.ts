export const ROUTES = {
  root: '/',
  onboarding: '/onboarding',
  tabs: {
    home: '/(tabs)/home',
    cart: '/(tabs)/cart',
    scanner: '/(tabs)/scanner',
    history: '/(tabs)/history',
    settings: '/(tabs)/settings',
  },
  checkout: {
    confirmation: '/checkout/confirmation',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
} as const;
