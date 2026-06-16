export const STORAGE_KEYS = {
  token: '@changuiapp/token',
  user: '@changuiapp/user',
  onboardingCompleted: '@changuiapp/onboarding_completed',
  // Cursor (updated_at máximo) del último sync incremental del catálogo local.
  catalogSyncedAt: '@changuiapp/catalog_synced_at',
  // Preferencias de accesibilidad.
  fontSize: '@changuiapp/font_size',
  language: '@changuiapp/language',
} as const;
