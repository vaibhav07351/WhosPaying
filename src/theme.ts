export const colors = {
  background: '#0B0B0F',
  surface: '#16161D',
  surfaceAlt: '#1E1E28',
  text: '#F4F1EA',
  muted: '#9A958A',
  accent: '#FF3B6B',
  accentSoft: '#FF6B3B',
  gold: '#F5C518',
  hub: '#0B0B0F',
  hubRing: '#F4F1EA',
  pointer: '#F4F1EA',
  danger: '#FF5C7A',
} as const;

export const wheelColors: readonly string[] = [
  '#FF3B6B',
  '#FF6B3B',
  '#F5C518',
  '#3DDC97',
  '#3B9EFF',
  '#9B5CFF',
  '#FF4D9D',
  '#00C2C7',
];

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const MAX_NAMES = 24;
export const MIN_NAMES_TO_SPIN = 2;
export const MAX_NAME_LENGTH = 24;
export const SPIN_DURATION_MS = 4200;
