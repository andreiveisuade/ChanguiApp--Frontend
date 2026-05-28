export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://changuiapp-backend.onrender.com';

export const API_TIMEOUT_MS = 15000;

export const DEEP_LINKS = {
  resetPassword: 'changuiapp://auth/reset-password',
} as const;
