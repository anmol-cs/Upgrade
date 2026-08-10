/** Base spacing unit: 8px. docs/03-Design/02-Design-Tokens.md */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

/** Motion durations — docs/03-Design/04-Motion-System.md */
export const duration = {
  fast: 150,
  normal: 200,
  slow: 250,
} as const;

/** Semantic values used across components */
export const semantic = {
  routineCompletedOpacity: 0.6,
  touchMinimum: 44,
  progressRingWidth: 8,
} as const;
