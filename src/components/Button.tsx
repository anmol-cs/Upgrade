import React from 'react';
import { Pressable, Text, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Stretches to fill its container — used for the primary action in forms/sheets,
   * where the button needs to read as clearly more important than the field above it. */
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

/**
 * docs/03-Design/03-Component-Library.md — one primary action per screen.
 *
 * The primary variant is deliberately weightier than a plain filled rectangle:
 * bold (not regular) label text, a bit more vertical padding than the other
 * variants, and a subtle shadow/elevation so it reads as a raised, tappable
 * surface rather than a flat block of color sitting next to an input field.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();

  const backgroundColor = {
    primary: theme.colors.accent.primary,
    secondary: theme.colors.background.card,
    ghost: 'transparent',
    destructive: theme.colors.semantic.error,
  }[variant];

  const textColor = theme.colors.text.primary;
  const isProminent = variant === 'primary' || variant === 'destructive';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => ({
        backgroundColor,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        borderRadius: theme.radius.md,
        paddingVertical: isProminent ? theme.spacing[4] : theme.spacing[3],
        paddingHorizontal: theme.spacing[6],
        minHeight: theme.semantic.touchMinimum,
        width: fullWidth ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: variant === 'ghost' ? 1 : 0,
        borderColor: theme.colors.border.default,
        // A raised, unmistakably-tappable feel on the primary/destructive actions —
        // absent on secondary/ghost so those stay visually quieter by comparison.
        ...(isProminent && !disabled
          ? Platform.select({
              android: { elevation: pressed ? 1 : 4 },
              default: {
                shadowColor: backgroundColor,
                shadowOpacity: pressed ? 0.15 : 0.35,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              },
            })
          : null),
      })}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: isProminent ? theme.typography.card.fontSize : theme.typography.body.fontSize,
            fontFamily: isProminent ? theme.typography.card.fontFamily : theme.typography.body.fontFamily,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
