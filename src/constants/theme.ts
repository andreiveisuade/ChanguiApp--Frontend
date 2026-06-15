export const colors = {
  primary: '#DC4040',
  secondary: '#FFB8B8',
  error: '#C1121F',
  warning: '#FFD1D0',
  surface: '#FFEFEF',
  success: '#5A8A58',
  textPrimary: '#000000',
  textSecondary: '#6B6B6B',
  background: '#FFF8F8',
  inputBackground: '#F1F1F3',
  white: '#FFFFFF',
  border: '#E5E7EB',
  muted: '#F7F2F2',
  errorSurface: '#FFD1D0',
  successSurface: '#DCEEDC',
  overlay: 'rgba(0, 0, 0, 0.28)',
  debugPanel: 'rgba(17, 17, 17, 0.88)',
  googleBlue: '#4285F4',
  googleRed: '#EA4335',
  googleYellow: '#FBBC05',
  googleGreen: '#34A853',
  splashDotInactive: 'rgba(255, 255, 255, 0.45)',
  onboardingDotInactive: '#D1D5DB',
  mailSurface: '#E6E8FF',
  mailIcon: '#4F46E5',
  shadow: '#000000',
  textMuted: '#6B7280',
  textDark: '#111827',
  textPlaceholder: '#9CA3AF',
  textSlate: '#374151',
  textSlateMuted: '#4B5563',
  textSlateDark: '#1F2937',
  iconSlate: '#475569',
  borderMuted: '#D1D5DB',
  successStrong: '#10B981',
  surfaceSubtle: '#F9FAFB',
  surfaceMuted: '#F3F4F6',
  surfaceBlush: '#FAF5F5',
  borderBlush: '#F3EAEA',
  danger: '#EF4444',
  dangerSurface: '#FEF2F2',
  dangerSurfaceStrong: '#FEE2E2',
  dangerTextDark: '#7F1D1D',
  accentOrange: '#EA580C',
  accentOrangeSurface: '#FFE5D9',
  accentOrangeSurfaceSubtle: '#FFF7ED',
  infoBlue: '#2563EB',
  infoBlueText: '#1E40AF',
  infoBlueTextDark: '#1E3A8A',
  infoBlueSurface: '#EFF6FF',
  infoBlueSurfaceAlt: '#EBF3FE',
  infoBlueBorder: '#DBEAFE',
  infoBlueBorderAlt: '#BFDBFE',
  indigoSurface: '#EFF2FE',
  indigoSurfaceAlt: '#EEF2FF',
  indigoBorder: '#818CF8',
  slateSurface: '#F1F5F9',
  warningSurface: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningIcon: '#D97706',
  warningText: '#92400E',
} as const;

export const fonts = {
  display: 'Poppins',
  body: 'Inter',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  xs: 2,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 32,
} as const;

export const fontSize = {
  display: 32,
  greeting: 28,
  h1: 24,
  h2: 18,
  h3: 16,
  body: 14,
  label: 12,
  price: 18,
  button: 18,
  input: 16,
} as const;

export const touchTarget = {
  minHeight: 44,
  minWidth: 44,
} as const;

export const opacity = {
  disabled: 0.5,
  muted: 0.7,
  pressed: 0.86,
} as const;

export const iconSize = {
  xs: 16,
  sm: 18,
  smd: 20,
  md: 22,
  mdl: 24,
  lg: 26,
  lgl: 28,
  xl: 30,
  xxl: 32,
  xxxl: 40,
  xxxxl: 42,
  hero: 48,
  heroSm: 56,
  heroMd: 72,
  heroLg: 80,
  heroXl: 96,
  heroXxl: 120,
} as const;

export const componentSize = {
  avatarButton: 44,
  cartIconBox: 52,
  emptyStateCircle: 108,
} as const;

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

export const borderWidth = {
  hairline: 1,
} as const;

export const control = {
  height: 48,
} as const;

export const sizes = {
  dropdownMaxHeight: 260,
  progressBarHeight: 4,
  emptyStateOffset: 60,
} as const;
