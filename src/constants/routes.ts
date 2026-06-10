export const ROUTES = {
  root: '/',
  onboarding: '/onboarding',
  tabs: {
    home: '/(tabs)/home',
    history: '/(tabs)/history',
    settings: '/(tabs)/settings',
  },
  purchaseDetail: '/purchase-detail',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
} as const;
