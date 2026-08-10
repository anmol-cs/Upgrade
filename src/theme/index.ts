export { colors } from './colors';
export { typography, fontFamily } from './typography';
export { spacing, radius, iconSize, duration, semantic } from './tokens';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, radius, iconSize, duration, semantic } from './tokens';

/** Single theme object — components should consume this via useTheme(), not raw token files. */
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  iconSize,
  duration,
  semantic,
} as const;

export type Theme = typeof theme;
