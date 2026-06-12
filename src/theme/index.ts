export const Colors = {
  // Primary palette
  primary: '#6C63FF',
  primaryLight: '#8B84FF',
  primaryDark: '#4A43CC',

  // Accent
  accent: '#00D4AA',
  accentLight: '#33DDBB',

  // Status colors
  success: '#00C896',
  warning: '#FFB347',
  danger: '#FF6B6B',
  info: '#4FC3F7',

  // Dark theme
  dark: {
    background: '#0A0A0F',
    surface: '#12121A',
    card: '#1A1A28',
    cardElevated: '#222236',
    border: '#2A2A3E',
    borderLight: '#333350',
    text: '#FFFFFF',
    textSecondary: '#A0A0C0',
    textTertiary: '#606080',
    placeholder: '#505070',
  },

  // Light theme
  light: {
    background: '#F5F5FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardElevated: '#F8F8FF',
    border: '#E8E8F0',
    borderLight: '#F0F0F8',
    text: '#0A0A1A',
    textSecondary: '#4A4A6A',
    textTertiary: '#8A8AAA',
    placeholder: '#AAAACC',
  },

  // Chart colors
  chart: ['#6C63FF', '#00D4AA', '#FFB347', '#FF6B6B', '#4FC3F7', '#A8E6CF', '#DDA0DD', '#98D8C8'],

  // Category colors
  categoryColors: {
    food: '#FF6B6B',
    groceries: '#4ECDC4',
    rent: '#45B7D1',
    bills: '#96CEB4',
    transport: '#F7DC6F',
    shopping: '#DDA0DD',
    entertainment: '#98D8C8',
    health: '#F0B27A',
    subscriptions: '#BB8FCE',
    family: '#85C1E9',
    travel: '#82E0AA',
    education: '#F0B27A',
    business: '#AEB6BF',
    savings: '#76D7C4',
    income: '#58D68D',
    other: '#BDC3C7',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
  h4: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  smallMedium: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
