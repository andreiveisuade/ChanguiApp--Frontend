export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://changuiapp-backend.onrender.com';

// 30s para tolerar el cold start del backend en Render (free tier se duerme
// tras ~15 min de inactividad y puede tardar en responder al despertar).
export const API_TIMEOUT_MS = 30000;

export const DEEP_LINKS = {
  resetPassword: 'changuiapp://auth/reset-password',
} as const;
