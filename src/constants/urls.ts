export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://changuiapp-backend.onrender.com';

export const REQUEST_TIMEOUT_MS = 15000;

export const API_PATHS = {
  authBase: '/api/auth',
  cart: '/api/cart',
} as const;

export const DEEP_LINKS = {
  resetPassword: 'changuiapp://auth/reset-password',
} as const;
