/**
 * Color tokens — single source of truth for visual color values.
 * Mirrors docs/03-Design/02-Design-Tokens.md
 */
export const colors = {
  background: {
    primary: '#000000',
    surface: '#0E0E0E',
    card: '#151515',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9A9A9A',
    disabled: '#555555',
  },
  accent: {
    primary: '#D72638',
  },
  border: {
    default: '#242424',
  },
  semantic: {
    success: '#3DBE72',
    warning: '#E0A63B',
    error: '#D72638',
  },
} as const;

export type ColorTokens = typeof colors;
