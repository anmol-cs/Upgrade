export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

/** Type scale — docs/03-Design/02-Design-Tokens.md */
export const typography = {
  display: { fontSize: 48, lineHeight: 56, fontFamily: fontFamily.bold },
  title: { fontSize: 32, lineHeight: 40, fontFamily: fontFamily.bold },
  section: { fontSize: 24, lineHeight: 32, fontFamily: fontFamily.semibold },
  card: { fontSize: 20, lineHeight: 28, fontFamily: fontFamily.semibold },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular },
  caption: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular },
  label: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.medium },
} as const;

export type TypographyTokens = typeof typography;
