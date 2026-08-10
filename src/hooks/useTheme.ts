import { theme } from '@/theme';

/**
 * Theme architecture supports future light mode without changing component APIs
 * (docs/03-Design/02-Design-Tokens.md). V1 is dark-mode only.
 */
export function useTheme() {
  return theme;
}
